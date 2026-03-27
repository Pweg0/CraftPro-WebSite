package com.craftprobrasil.craftpro.delivery;

import com.craftprobrasil.craftpro.CraftProMod;
import com.craftprobrasil.craftpro.api.SiteApiClient;
import net.minecraft.server.MinecraftServer;
import net.minecraft.server.level.ServerPlayer;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CopyOnWriteArrayList;

public class DeliveryQueue {
    private static final CopyOnWriteArrayList<PendingDelivery> queue = new CopyOnWriteArrayList<>();
    private static final CopyOnWriteArrayList<PendingRevocation> revocationQueue = new CopyOnWriteArrayList<>();

    public static void addToQueue(PendingDelivery delivery) {
        // Avoid duplicates
        if (queue.stream().noneMatch(d -> d.orderId == delivery.orderId)) {
            queue.add(delivery);
            CraftProMod.LOGGER.info("CraftPro: order {} adicionado a fila (player {} offline)", delivery.orderId, delivery.minecraftName);
        }
    }

    public static void addRevocation(PendingRevocation revocation) {
        if (revocationQueue.stream().noneMatch(r -> r.orderId == revocation.orderId)) {
            revocationQueue.add(revocation);
            CraftProMod.LOGGER.info("CraftPro: revogacao order {} adicionada a fila", revocation.orderId);
        }
    }

    public static int getPendingCount() {
        return queue.size();
    }

    /**
     * Process deliveries for online players. Called after each poll.
     * Per D-03: only deliver when player is online.
     */
    public static void processQueue(MinecraftServer server) {
        Iterator<PendingDelivery> it = queue.iterator();
        List<PendingDelivery> delivered = new ArrayList<>();

        while (it.hasNext()) {
            PendingDelivery d = it.next();
            ServerPlayer player = server.getPlayerList().getPlayerByName(d.minecraftName);
            if (player != null) {
                deliverToPlayer(server, d);
                delivered.add(d);
            }
        }

        queue.removeAll(delivered);
    }

    /**
     * Process revocations. Remove rank from players who had benefits revoked by admin.
     */
    public static void processRevocations(MinecraftServer server) {
        Iterator<PendingRevocation> it = revocationQueue.iterator();
        List<PendingRevocation> processed = new ArrayList<>();

        while (it.hasNext()) {
            PendingRevocation r = it.next();
            // Execute remove regardless of player online status (FTB Ranks works offline too)
            server.execute(() -> {
                String cmd = "ftbranks remove " + r.minecraftName + " " + r.itemName;
                server.getCommands().performPrefixedCommand(
                        server.createCommandSourceStack().withSuppressedOutput(), cmd);
                CraftProMod.LOGGER.info("CraftPro: rank {} revogado de {} (order {})", r.itemName, r.minecraftName, r.orderId);
            });
            BenefitManager.removeBenefit(r.orderId);
            processed.add(r);
        }

        revocationQueue.removeAll(processed);
    }

    private static void deliverToPlayer(MinecraftServer server, PendingDelivery d) {
        // Determine rank slug from item name/type
        String rankSlug = d.itemName.toLowerCase().replace(" ", "_");

        // Execute /ftbranks add on server thread
        server.execute(() -> {
            String cmd = "ftbranks add " + d.minecraftName + " " + rankSlug;
            server.getCommands().performPrefixedCommand(
                    server.createCommandSourceStack().withSuppressedOutput(), cmd);
            CraftProMod.LOGGER.info("CraftPro: rank {} entregue a {} (order {})", rankSlug, d.minecraftName, d.orderId);

            // Notify player
            ServerPlayer player = server.getPlayerList().getPlayerByName(d.minecraftName);
            if (player != null) {
                player.sendSystemMessage(net.minecraft.network.chat.Component.literal(
                        "\u00a7a[CraftPro] \u00a7fVoce recebeu o beneficio \u00a7e" + d.itemName + "\u00a7f! Obrigado pela compra!"));
            }
        });

        // Calculate expiration
        int durationDays = (d.itemDuration != null && d.itemDuration > 0) ? d.itemDuration : 30;
        Instant now = Instant.now();
        Instant expiresAt = now.plus(durationDays, ChronoUnit.DAYS);
        String expiresAtIso = DateTimeFormatter.ISO_INSTANT.format(expiresAt);

        // Save active benefit locally (per D-08)
        ActiveBenefit benefit = new ActiveBenefit(
                d.minecraftName, d.minecraftUuid, rankSlug, d.orderId,
                now.toEpochMilli(), expiresAt.toEpochMilli());
        BenefitManager.addBenefit(benefit);

        // Confirm to site asynchronously (per MOD-03)
        CompletableFuture.runAsync(() -> {
            try {
                SiteApiClient.confirmDelivery(d.orderId, expiresAtIso);
                CraftProMod.LOGGER.info("CraftPro: entrega do order {} confirmada pro site", d.orderId);
            } catch (Exception e) {
                CraftProMod.LOGGER.warn("CraftPro: falha ao confirmar entrega do order {}: {}", d.orderId, e.getMessage());
            }
        });
    }
}
