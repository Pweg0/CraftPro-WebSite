package com.craftprobrasil.craftpro.scheduler;

import com.craftprobrasil.craftpro.CraftProMod;
import com.craftprobrasil.craftpro.api.SiteApiClient;
import com.craftprobrasil.craftpro.config.CraftProConfig;
import com.craftprobrasil.craftpro.delivery.BenefitManager;
import com.craftprobrasil.craftpro.delivery.DeliveryQueue;
import com.craftprobrasil.craftpro.delivery.PendingDelivery;
import net.minecraft.server.MinecraftServer;
import net.neoforged.bus.api.SubscribeEvent;
import net.neoforged.neoforge.event.tick.ServerTickEvent;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.atomic.AtomicBoolean;

public class TickScheduler {
    private static int pollTickCounter = 0;
    private static int expiryTickCounter = 0;
    private static final AtomicBoolean polling = new AtomicBoolean(false);

    @SubscribeEvent
    public static void onServerTick(ServerTickEvent.Post event) {
        pollTickCounter++;
        expiryTickCounter++;

        MinecraftServer server = event.getServer();

        // D-02: poll every 30 seconds (600 ticks at 20 TPS)
        if (pollTickCounter >= CraftProConfig.getPollIntervalTicks()) {
            pollTickCounter = 0;

            // Process any queued deliveries for now-online players
            DeliveryQueue.processQueue(server);
            DeliveryQueue.processRevocations(server);

            // Poll API asynchronously (NEVER block tick thread)
            if (!polling.getAndSet(true)) {
                CompletableFuture.runAsync(() -> {
                    try {
                        SiteApiClient.PendingResponse response = SiteApiClient.fetchPending();

                        // Queue new deliveries
                        for (PendingDelivery d : response.orders) {
                            if (!BenefitManager.hasBenefit(d.orderId)) {
                                DeliveryQueue.addToQueue(d);
                            }
                        }

                        // Queue revocations
                        for (var r : response.revocations) {
                            DeliveryQueue.addRevocation(r);
                        }

                        // Process deliveries for online players immediately
                        server.execute(() -> {
                            DeliveryQueue.processQueue(server);
                            DeliveryQueue.processRevocations(server);
                        });

                    } catch (Exception e) {
                        CraftProMod.LOGGER.warn("CraftPro: erro no polling: {}", e.getMessage());
                    } finally {
                        polling.set(false);
                    }
                });
            }
        }

        // D-11: check expirations every 60 seconds (1200 ticks)
        if (expiryTickCounter >= CraftProConfig.getExpiryCheckIntervalTicks()) {
            expiryTickCounter = 0;
            BenefitManager.checkExpirations(server);
        }
    }
}
