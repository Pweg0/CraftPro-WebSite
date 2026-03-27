package com.craftprobrasil.craftpro.delivery;

public class PendingDelivery {
    public int orderId;
    public String minecraftUuid;
    public String minecraftName;
    public String itemName;
    public String itemType;
    public Integer itemDuration; // days, nullable
    public int amountCents;
}
