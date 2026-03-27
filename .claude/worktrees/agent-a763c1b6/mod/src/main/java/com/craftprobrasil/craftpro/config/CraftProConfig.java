package com.craftprobrasil.craftpro.config;

import com.craftprobrasil.craftpro.CraftProMod;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import net.neoforged.fml.loading.FMLPaths;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

public class CraftProConfig {
    private static final Gson GSON = new GsonBuilder().setPrettyPrinting().create();
    private static final Path CONFIG_FILE = FMLPaths.CONFIGDIR.get().resolve("craftpro/config.json");

    private static ConfigData data = new ConfigData();

    public static class ConfigData {
        public String apiUrl = "https://craftprobrasil.com.br";
        public String apiKey = "CHANGE_ME";
        public int pollIntervalSeconds = 30;
        public int expiryCheckIntervalSeconds = 60;
    }

    public static void load() {
        try {
            if (Files.exists(CONFIG_FILE)) {
                String json = Files.readString(CONFIG_FILE);
                data = GSON.fromJson(json, ConfigData.class);
                CraftProMod.LOGGER.info("CraftPro: config carregada de {}", CONFIG_FILE);
            } else {
                save();
                CraftProMod.LOGGER.info("CraftPro: config padrao criada em {}", CONFIG_FILE);
            }
        } catch (IOException e) {
            CraftProMod.LOGGER.error("CraftPro: erro ao carregar config: {}", e.getMessage());
        }
    }

    public static void save() {
        try {
            Files.createDirectories(CONFIG_FILE.getParent());
            Files.writeString(CONFIG_FILE, GSON.toJson(data));
        } catch (IOException e) {
            CraftProMod.LOGGER.error("CraftPro: erro ao salvar config: {}", e.getMessage());
        }
    }

    public static String getApiUrl() { return data.apiUrl; }
    public static String getApiKey() { return data.apiKey; }
    public static int getPollIntervalTicks() { return data.pollIntervalSeconds * 20; }
    public static int getExpiryCheckIntervalTicks() { return data.expiryCheckIntervalSeconds * 20; }
}
