package com.onboarding.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

// Audit logging now lives in the Node.js service (which owns MongoDB). Instead
// of writing to Mongo directly, Spring Boot posts each event to Node over HTTP.
// Best-effort: a logging failure must never break the main business operation.
@Service
public class ActivityLogService {

    private final RestClient restClient = RestClient.create();

    @Value("${node.service.url:http://localhost:8082}")
    private String nodeUrl;

    // Shared key so Node accepts this server-to-server call (no user JWT here,
    // e.g. the LOGIN event is recorded before a token exists).
    private static final String INTERNAL_KEY = "onboarding-internal-key";

    public void log(String action, String actorEmail, String detail) {
        try {
            restClient.post()
                    .uri(nodeUrl + "/activity")
                    .header("X-Internal-Key", INTERNAL_KEY)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of(
                            "action", action,
                            "actorEmail", actorEmail == null ? "" : actorEmail,
                            "detail", detail == null ? "" : detail))
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            // Node may be down — never let audit logging break the request.
            System.err.println("[activity-log] could not reach Node service: " + e.getMessage());
        }
    }
}
