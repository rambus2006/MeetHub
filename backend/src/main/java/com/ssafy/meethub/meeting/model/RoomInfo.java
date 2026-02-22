package com.ssafy.meethub.meeting.model;

import java.io.Serial;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomInfo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String roomId;
    private String displayName;
    private String password;
    private Long hostId;
    private String hostName;
    private LocalDateTime createdAt;
    private RoomStatus status;
    private Set<Long> participantIds;

    private Boolean hasAgent;
    private String agentDispatchId;
}
