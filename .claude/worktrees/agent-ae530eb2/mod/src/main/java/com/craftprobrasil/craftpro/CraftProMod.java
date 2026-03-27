package com.craftprobrasil.craftpro;

import com.craftprobrasil.craftpro.config.CraftProConfig;
import com.craftprobrasil.craftpro.delivery.BenefitManager;
import com.craftprobrasil.craftpro.scheduler.TickScheduler;
import com.craftprobrasil.craftpro.command.CraftProCommand;
import net.neoforged.bus.api.IEventBus;
import net.neoforged.fml.ModContainer;
import net.neoforged.fml.common.Mod;
import net.neoforged.neoforge.common.NeoForge;
import net.neoforged.neoforge.event.RegisterCommandsEvent;
import net.neoforged.neoforge.event.server.ServerStartingEvent;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

@Mod("craftpro")
public class CraftProMod {
    public static final Logger LOGGER = LogManager.getLogger("craftpro");

    public CraftProMod(IEventBus modEventBus, ModContainer modContainer) {
        NeoForge.EVENT_BUS.register(TickScheduler.class);
        NeoForge.EVENT_BUS.addListener(this::onServerStarting);
        NeoForge.EVENT_BUS.addListener(this::onRegisterCommands);
        LOGGER.info("CraftPro mod inicializado.");
    }

    private void onServerStarting(ServerStartingEvent event) {
        CraftProConfig.load();
        BenefitManager.loadFromDisk();
        LOGGER.info("CraftPro: config carregada, {} beneficios ativos restaurados.", BenefitManager.getActiveCount());
    }

    private void onRegisterCommands(RegisterCommandsEvent event) {
        CraftProCommand.register(event.getDispatcher());
    }
}
