package com.ssafy.meethub.meeting.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.meethub.common.exception.BusinessException;
import com.ssafy.meethub.meeting.config.LiveKitConfig;
import com.ssafy.meethub.meeting.dto.request.CreateRoomRequest;
import com.ssafy.meethub.meeting.dto.request.JoinRoomRequest;
import com.ssafy.meethub.meeting.dto.response.TokenResponse;
import com.ssafy.meethub.meeting.exception.MeetingErrorCode;
import com.ssafy.meethub.meeting.model.RoomInfo;
import com.ssafy.meethub.meeting.model.RoomStatus;
import com.ssafy.meethub.user.entity.User;
import com.ssafy.meethub.user.exception.UserErrorCode;
import com.ssafy.meethub.user.repository.UserRepository;
import io.livekit.server.AccessToken;
import io.livekit.server.AgentDispatchServiceClient;
import io.livekit.server.RoomAdmin;
import io.livekit.server.RoomJoin;
import io.livekit.server.RoomName;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import livekit.LivekitAgentDispatch.AgentDispatch;
import livekit.LivekitModels.Room;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import retrofit2.Call;
import retrofit2.Response;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
@Slf4j
public class MeetingService {

    public static final String ROOM_INFO_PREFIX = "meeting:room:";
    private static final String USER_ACTIVE_ROOM_PREFIX = "meeting:user:";
    private static final long ROOM_EXPIRATION_HOURS = 24;
    private static final long TOKEN_TTL_HOURS = 1;
    private static final long ROOM_CREATION_COOLDOWN_SECONDS = 5;
    private final UserRepository userRepository;
    private final LiveKitConfig liveKitConfig;
    private final AgentDispatchServiceClient agentDispatchServiceClient;
    private final RedisTemplate<String, Object> redisObjectTemplate;
    private final ObjectMapper objectMapper;
    @Value("${agent.name}")
    private String agentName;

    public TokenResponse createRoom(Long userId, CreateRoomRequest request) {
        User host = getUserById(userId);
        checkCooldown(userId);

        String roomId = generateUniqueRoomId();
        createLiveKitRoom(roomId);

        RoomInfo roomInfo = buildRoomInfo(roomId, request, host);
        saveRoomInfo(roomId, roomInfo);
        setCooldown(userId);

        dispatchAgentToRoom(roomId, request.password(), host.getId());

        AccessToken hostToken = createHostToken(roomId, host);

        log.info("Room created - ID: {}, Display: '{}', Host: {}",
                roomId, request.displayName(), host.getName());
        return buildTokenResponse(roomId, request.displayName(), host.getId(), hostToken);
    }

    private User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(UserErrorCode.NOT_FOUND_USER));
    }

    private void checkCooldown(Long userId) {
        String cooldownKey = USER_ACTIVE_ROOM_PREFIX + userId + ":cooldown";
        if (redisObjectTemplate.hasKey(cooldownKey)) {
            throw new BusinessException(MeetingErrorCode.ROOM_CREATION_TOO_FREQUENT);
        }
    }

    private RoomInfo buildRoomInfo(String roomId, CreateRoomRequest request, User host) {
        return RoomInfo.builder()
                .roomId(roomId)
                .displayName(request.displayName())
                .password(getPasswordOrEmpty(request.password()))
                .hostId(host.getId())
                .hostName(host.getName())
                .createdAt(LocalDateTime.now())
                .status(RoomStatus.WAITING)
                .participantIds(new HashSet<>())
                .hasAgent(false)
                .build();
    }

    private void saveRoomInfo(String roomId, RoomInfo roomInfo) {
        String roomKey = ROOM_INFO_PREFIX + roomId;
        redisObjectTemplate.opsForValue().set(roomKey, roomInfo, ROOM_EXPIRATION_HOURS, TimeUnit.HOURS);
    }

    private void setCooldown(Long userId) {
        String cooldownKey = USER_ACTIVE_ROOM_PREFIX + userId + ":cooldown";
        redisObjectTemplate.opsForValue().set(cooldownKey, "1",
                ROOM_CREATION_COOLDOWN_SECONDS, TimeUnit.SECONDS);
    }

    private AccessToken createHostToken(String roomId, User host) {
        AccessToken hostToken = generateToken(roomId);
        hostToken.setName(host.getName());
        hostToken.setIdentity(host.getId().toString());
        hostToken.addGrants(new RoomAdmin(true));
        return hostToken;
    }

    private TokenResponse buildTokenResponse(String roomId, String displayName, Long hostId, AccessToken token) {
        return TokenResponse.builder()
                .roomId(roomId)
                .displayName(displayName)
                .hostId(hostId)
                .token(token.toJwt())
                .serverUrl(liveKitConfig.getLivekitUrl().replace("https://", "wss://"))
                .build();
    }

    private String getPasswordOrEmpty(String password) {
        return password != null ? password : "";
    }

    private String generateUniqueRoomId() {
        return "rm-" + UUID.randomUUID().toString()
                .replace("-", "")
                .substring(0, 12);
    }

    private void createLiveKitRoom(String roomId) {
        try {
            Response<Room> response = executeLiveKitRoomCreation(roomId);
            validateLiveKitResponse(response);
            Room room = response.body();
            validateRoomObject(room);
            log.info("LiveKit room created successfully: {} (SID: {})", room.getName(), room.getSid());
        } catch (Exception e) {
            log.error("Failed to create LiveKit room", e);
            throw new BusinessException(MeetingErrorCode.ROOM_CREATION_FAILED);
        }
    }

    private Response<Room> executeLiveKitRoomCreation(String roomId) throws Exception {
        Call<Room> call = liveKitConfig.roomServiceClient().createRoom(roomId, 300, 50);
        return call.execute();
    }

    private void validateLiveKitResponse(Response<Room> response) throws Exception {
        if (!response.isSuccessful()) {
            String errorBody = response.errorBody() != null ? response.errorBody().string() : "no body";
            log.error("LiveKit API error: HTTP {} - {}", response.code(), errorBody);
            throw new BusinessException(MeetingErrorCode.ROOM_CREATION_FAILED);
        }
    }

    private void validateRoomObject(Room room) {
        if (room == null) {
            log.error("LiveKit returned null room object");
            throw new BusinessException(MeetingErrorCode.ROOM_CREATION_FAILED);
        }
    }

    public TokenResponse joinRoom(Long userId, JoinRoomRequest request) {
        User user = getUserById(userId);
        RoomInfo roomInfo = getRoomInfo(request.roomId());
        validatePassword(roomInfo, request.password());

        AccessToken participantToken = createParticipantToken(request.roomId(), user);

        log.info("User joined room - ID: {}, Display: '{}', User: {}",
                request.roomId(), roomInfo.getDisplayName(), user.getName());

        return buildTokenResponse(request.roomId(), roomInfo.getDisplayName(), roomInfo.getHostId(), participantToken);
    }

    private RoomInfo getRoomInfo(String roomId) {
        String roomKey = ROOM_INFO_PREFIX + roomId;
        Object roomData = redisObjectTemplate.opsForValue().get(roomKey);

        if (roomData == null) {
            throw new BusinessException(MeetingErrorCode.ROOM_NOT_FOUND);
        }
        return convertToRoomInfo(roomData);
    }

    private void validatePassword(RoomInfo roomInfo, String providedPassword) {
        if (roomInfo.getPassword() != null && !roomInfo.getPassword().isEmpty()) {
            if (providedPassword == null || !roomInfo.getPassword().equals(providedPassword)) {
                throw new BusinessException(MeetingErrorCode.INVALID_PASSWORD);
            }
        }
    }

    private AccessToken createParticipantToken(String roomId, User user) {
        AccessToken participantToken = generateToken(roomId);
        participantToken.setName(user.getName());
        participantToken.setIdentity(user.getId() + "-" + UUID.randomUUID());
        return participantToken;
    }

    private AccessToken generateToken(String roomName) {
        try {
            AccessToken token = createAccessToken();
            configureToken(token, roomName);
            return token;
        } catch (Exception e) {
            log.error("Error generating token", e);
            throw new BusinessException(MeetingErrorCode.TOKEN_GENERATION_FAILED);
        }
    }

    private AccessToken createAccessToken() {
        return new AccessToken(liveKitConfig.getApiKey(), liveKitConfig.getApiSecret());
    }

    private void configureToken(AccessToken token, String roomName) {
        token.setTtl(TimeUnit.HOURS.toMillis(TOKEN_TTL_HOURS));
        token.addGrants(new RoomJoin(true), new RoomName(roomName));
    }

    private RoomInfo convertToRoomInfo(Object roomData) {
        try {
            return (RoomInfo) roomData;
        } catch (ClassCastException e) {
            log.error("Failed to convert room data to RoomInfo", e);
            throw new BusinessException(MeetingErrorCode.ROOM_NOT_FOUND);
        }
    }

    private void dispatchAgentToRoom(String roomId, String password, Long hostId) {
        try {
            Map<String, Object> metadata = buildAgentMetadata(roomId, password, hostId);
            String metadataJson = objectMapper.writeValueAsString(metadata);
            Response<AgentDispatch> response = agentDispatchServiceClient
                    .createDispatch(roomId, agentName, metadataJson)
                    .execute();
            validateAgentDispatchResponse(response);
            AgentDispatch dispatch = response.body();
            log.info("Agent dispatched successfully - Dispatch ID: {}, Room: {}", dispatch.getId(), dispatch.getRoom());
            updateRoomAgentStatus(roomId, true, dispatch.getId());

        } catch (Exception e) {
            log.error("Error dispatching agent to room: {}", roomId, e);
        }
    }

    private void validateAgentDispatchResponse(Response<AgentDispatch> response) throws Exception {
        if (!response.isSuccessful() || response.body() == null) {
            String errorBody = response.errorBody() != null ?
                    response.errorBody().string() : "no error body";
            log.warn("Failed to dispatch agent - HTTP {}: {}", response.code(), errorBody);
            throw new Exception("Agent dispatch failed");
        }
    }

    private Map<String, Object> buildAgentMetadata(String roomId, String password, Long hostId) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("room_id", roomId);
        metadata.put("password", password != null ? password : "");
        metadata.put("host_id", hostId);
        metadata.put("timestamp", System.currentTimeMillis());
        return metadata;
    }

    private void updateRoomAgentStatus(String roomId, boolean hasAgent, String dispatchId) {
        String roomKey = ROOM_INFO_PREFIX + roomId;
        RoomInfo roomInfo = (RoomInfo) redisObjectTemplate.opsForValue().get(roomKey);

        if (roomInfo != null) {
            roomInfo.setHasAgent(hasAgent);
            roomInfo.setAgentDispatchId(dispatchId);
            redisObjectTemplate.opsForValue().set(
                    roomKey,
                    roomInfo,
                    ROOM_EXPIRATION_HOURS,
                    TimeUnit.HOURS
            );
            log.debug("Updated agent status for room {}: hasAgent={}, dispatchId={}", roomId, hasAgent, dispatchId);
        }
    }

    public void deleteRoom(String roomId) {
        String roomKey = ROOM_INFO_PREFIX + roomId;
        redisObjectTemplate.delete(roomKey);
    }
}
