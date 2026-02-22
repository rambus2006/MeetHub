package com.ssafy.meethub.meeting.config;

import io.livekit.server.AgentDispatchServiceClient;
import io.livekit.server.RoomServiceClient;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
public class LiveKitConfig {

    @Value("${livekit.url}")
    private String livekitUrl;

    @Value("${livekit.api-key}")
    private String apiKey;

    @Value("${livekit.api-secret}")
    private String apiSecret;

    @Bean
    public RoomServiceClient roomServiceClient() {
        return RoomServiceClient.createClient(livekitUrl, apiKey, apiSecret);
    }

    @Bean
    public AgentDispatchServiceClient agentDispatchServiceClient() {
        return AgentDispatchServiceClient.createClient(livekitUrl, apiKey, apiSecret);
    }
}
