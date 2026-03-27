package com.craftprobrasil.craftpro.api;

import com.craftprobrasil.craftpro.CraftProMod;
import com.craftprobrasil.craftpro.config.CraftProConfig;
import com.craftprobrasil.craftpro.delivery.PendingDelivery;
import com.craftprobrasil.craftpro.delivery.PendingRevocation;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

public class SiteApiClient {
    private static final Gson GSON = new Gson();
    private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public static class PendingResponse {
        public List<PendingDelivery> orders = new ArrayList<>();
        public List<PendingRevocation> revocations = new ArrayList<>();
    }

    public static PendingResponse fetchPending() throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(CraftProConfig.getApiUrl() + "/api/deliveries/pending"))
                .header("Authorization", "Bearer " + CraftProConfig.getApiKey())
                .GET()
                .timeout(Duration.ofSeconds(15))
                .build();

        HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            throw new RuntimeException("API retornou status " + response.statusCode());
        }

        JsonObject json = JsonParser.parseString(response.body()).getAsJsonObject();
        PendingResponse result = new PendingResponse();

        JsonArray ordersArray = json.getAsJsonArray("orders");
        if (ordersArray != null) {
            for (var elem : ordersArray) {
                result.orders.add(GSON.fromJson(elem, PendingDelivery.class));
            }
        }

        JsonArray revocationsArray = json.getAsJsonArray("revocations");
        if (revocationsArray != null) {
            for (var elem : revocationsArray) {
                result.revocations.add(GSON.fromJson(elem, PendingRevocation.class));
            }
        }

        return result;
    }

    public static void confirmDelivery(int orderId, String expiresAtIso) throws Exception {
        JsonObject body = new JsonObject();
        body.addProperty("orderId", orderId);
        body.addProperty("expiresAt", expiresAtIso);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(CraftProConfig.getApiUrl() + "/api/deliveries/confirm"))
                .header("Authorization", "Bearer " + CraftProConfig.getApiKey())
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(GSON.toJson(body)))
                .timeout(Duration.ofSeconds(15))
                .build();

        HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            throw new RuntimeException("Confirm falhou com status " + response.statusCode());
        }
    }

    public static void notifyExpired(int orderId) throws Exception {
        JsonObject body = new JsonObject();
        body.addProperty("orderId", orderId);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(CraftProConfig.getApiUrl() + "/api/deliveries/expired"))
                .header("Authorization", "Bearer " + CraftProConfig.getApiKey())
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(GSON.toJson(body)))
                .timeout(Duration.ofSeconds(15))
                .build();

        HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            CraftProMod.LOGGER.warn("CraftPro: notifyExpired falhou com status {}", response.statusCode());
        }
    }
}
