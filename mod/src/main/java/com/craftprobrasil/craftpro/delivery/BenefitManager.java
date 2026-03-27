package com.craftprobrasil.craftpro.delivery;

import com.craftprobrasil.craftpro.CraftProMod;
import com.craftprobrasil.craftpro.api.SiteApiClient;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;
import net.minecraft.network.chat.Component;
import net.minecraft.server.MinecraftServer;
import net.minecraft.server.level.ServerPlayer;

import net.neoforged.fml.loading.FMLPaths;

import java.io.IOException;
import java.lang.reflect.Type;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.concurrent.CompletableFuture;

public class BenefitManager {
    private static final Gson GSON = new GsonBuilder().setPrettyPrinting().create();
    private static final Path BENEFITS_FILE = FMLPaths.CONFIGDIR.get().resolve("craftpro/benefits.json");
    private static final List<ActiveBenefit> activeBenefits = new ArrayList<>();

    public static synchronized void loadFromDisk() {
        activeBenefits.clear();
        if (!Files.exists(BENEFITS_FILE)) return;
        try {
            String json = Files.readString(BENEFITS_FILE);
            Type listType = new TypeToken<List<ActiveBenefit>>(){}.getType();
            List<ActiveBenefit> loaded = GSON.fromJson(json, listType);
            if (loaded != null) activeBenefits.addAll(loaded);
            CraftProMod.LOGGER.info("CraftPro: {} beneficios carregados do disco.", activeBenefits.size());
        } catch (Exception e) {
            CraftProMod.LOGGER.error("CraftPro: erro ao carregar benefits.json: {}", e.getMessage());
        }
    }

    public static synchronized void saveToDisk() {
        try {
            Files.createDirectories(BENEFITS_FILE.getParent());
            Files.writeString(BENEFITS_FILE, GSON.toJson(activeBenefits));
        } catch (IOException e) {
            CraftProMod.LOGGER.error("CraftPro: erro ao salvar benefits.json: {}", e.getMessage());
        }
    }

    public static synchronized void addBenefit(ActiveBenefit benefit) {
        activeBenefits.add(benefit);
        saveToDisk();
    }

    public static synchronized void removeBenefit(int orderId) {
        activeBenefits.removeIf(b -> b.orderId == orderId);
        saveToDisk();
    }

    public static synchronized boolean hasBenefit(int orderId) {
        return activeBenefits.stream().anyMatch(b -> b.orderId == orderId);
    }

    public static synchronized int getActiveCount() {
        return activeBenefits.size();
    }

    public static synchronized List<ActiveBenefit> getAll() {
        return new ArrayList<>(activeBenefits);
    }

    /**
     * Check for expired benefits. Called every 60 seconds from TickScheduler.
     * Per D-10: real time expiration (no grace period).
     * Per D-11: executes /ftbranks remove and notifies site.
     * Per D-12: sends chat message to online player.
     */
    public static void checkExpirations(MinecraftServer server) {
        List<ActiveBenefit> expired = new ArrayList<>();
        synchronized (BenefitManager.class) {
            Iterator<ActiveBenefit> it = activeBenefits.iterator();
            while (it.hasNext()) {
                ActiveBenefit b = it.next();
                if (b.isExpired()) {
                    expired.add(b);
                    it.remove();
                }
            }
            if (!expired.isEmpty()) saveToDisk();
        }

        for (ActiveBenefit b : expired) {
            // Execute /ftbranks remove on server thread
            server.execute(() -> {
                String cmd = "ftbranks remove " + b.playerName + " " + b.rankSlug;
                server.getCommands().performPrefixedCommand(
                        server.createCommandSourceStack().withSuppressedOutput(), cmd);
                CraftProMod.LOGGER.info("CraftPro: rank {} removido de {} (order {})", b.rankSlug, b.playerName, b.orderId);

                // D-12: notify player if online
                ServerPlayer player = server.getPlayerList().getPlayerByName(b.playerName);
                if (player != null) {
                    player.sendSystemMessage(Component.literal(
                            "\u00a7c[CraftPro] \u00a7fSeu beneficio \u00a7e" + b.rankSlug + " \u00a7fexpirou. Obrigado por apoiar o servidor!"));
                }
            });

            // Notify site asynchronously
            CompletableFuture.runAsync(() -> {
                try {
                    SiteApiClient.notifyExpired(b.orderId);
                    CraftProMod.LOGGER.info("CraftPro: site notificado sobre expiracao do order {}", b.orderId);
                } catch (Exception e) {
                    CraftProMod.LOGGER.warn("CraftPro: falha ao notificar site sobre expiracao: {}", e.getMessage());
                }
            });
        }
    }
}
