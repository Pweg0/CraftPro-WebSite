package com.craftprobrasil.craftpro.delivery;

public class ActiveBenefit {
    public String playerName;
    public String minecraftUuid;
    public String rankSlug;
    public int orderId;
    public long deliveredAtEpoch; // epoch millis
    public long expiresAtEpoch;   // epoch millis

    public ActiveBenefit() {}

    public ActiveBenefit(String playerName, String minecraftUuid, String rankSlug,
                         int orderId, long deliveredAtEpoch, long expiresAtEpoch) {
        this.playerName = playerName;
        this.minecraftUuid = minecraftUuid;
        this.rankSlug = rankSlug;
        this.orderId = orderId;
        this.deliveredAtEpoch = deliveredAtEpoch;
        this.expiresAtEpoch = expiresAtEpoch;
    }

    public boolean isExpired() {
        return System.currentTimeMillis() >= expiresAtEpoch;
    }
}
