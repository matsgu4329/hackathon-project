package com.skinclock.product;

import java.util.Set;

public enum IngredientTag {
    RETINOL,
    AHA_BHA,
    VITAMIN_C,
    CICA,
    NEEDLE_SHOT,
    OTHER;

    /** Tags that force a product into the "night only" routine (SPEC 1, 3: UV-sensitive ingredients). */
    private static final Set<IngredientTag> NIGHT_ONLY_TAGS = Set.of(RETINOL, AHA_BHA);

    public boolean forcesNightOnly() {
        return NIGHT_ONLY_TAGS.contains(this);
    }
}
