package com.craftprobrasil.craftpro.command;

import com.craftprobrasil.craftpro.config.CraftProConfig;
import com.craftprobrasil.craftpro.delivery.ActiveBenefit;
import com.craftprobrasil.craftpro.delivery.BenefitManager;
import com.craftprobrasil.craftpro.delivery.DeliveryQueue;
import com.mojang.brigadier.CommandDispatcher;
import net.minecraft.commands.CommandSourceStack;
import net.minecraft.commands.Commands;
import net.minecraft.network.chat.Component;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

public class CraftProCommand {
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")
            .withZone(ZoneId.of("America/Sao_Paulo"));

    public static void register(CommandDispatcher<CommandSourceStack> dispatcher) {
        dispatcher.register(Commands.literal("craftpro")
                .then(Commands.literal("status")
                        .requires(src -> src.hasPermission(0)) // any player can check
                        .executes(ctx -> showStatus(ctx.getSource())))
                .then(Commands.literal("reload")
                        .requires(src -> src.hasPermission(2)) // op only
                        .executes(ctx -> reloadConfig(ctx.getSource())))
        );
    }

    private static int showStatus(CommandSourceStack source) {
        List<ActiveBenefit> benefits = BenefitManager.getAll();
        int pending = DeliveryQueue.getPendingCount();

        source.sendSuccess(() -> Component.literal(
                "\u00a7a[CraftPro] \u00a7fBeneficios ativos: \u00a7e" + benefits.size() +
                " \u00a7f| Entregas pendentes: \u00a7e" + pending), false);

        for (ActiveBenefit b : benefits) {
            long daysLeft = Math.max(0, (b.expiresAtEpoch - System.currentTimeMillis()) / (1000 * 60 * 60 * 24));
            String expiresStr = DATE_FMT.format(Instant.ofEpochMilli(b.expiresAtEpoch));
            source.sendSuccess(() -> Component.literal(
                    "  \u00a77" + b.playerName + " \u00a7f- \u00a7b" + b.rankSlug +
                    " \u00a7f- \u00a7e" + daysLeft + "d restantes \u00a77(" + expiresStr + ")"), false);
        }

        return 1;
    }

    private static int reloadConfig(CommandSourceStack source) {
        CraftProConfig.load();
        BenefitManager.loadFromDisk();
        source.sendSuccess(() -> Component.literal(
                "\u00a7a[CraftPro] \u00a7fConfig e beneficios recarregados."), false);
        return 1;
    }
}
