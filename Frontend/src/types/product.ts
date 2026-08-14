export type UsageStep =
  | 'CLEANSING'
  | 'TONER'
  | 'ESSENCE_SERUM'
  | 'CREAM'
  | 'SUNCARE'
  | 'MASK_PACK'
  | 'OTHER';

export type IngredientTag =
  | 'RETINOL'
  | 'AHA_BHA'
  | 'VITAMIN_C'
  | 'CICA'
  | 'NEEDLE_SHOT'
  | 'OTHER';

export type CycleType = 'DAILY' | 'EVERY_N_DAYS' | 'SPECIFIC_WEEKDAYS';

export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export interface ProductRequest {
  name: string;
  usageStep: UsageStep;
  ingredientTags?: IngredientTag[];
  cycleType: CycleType;
  cycleIntervalDays?: number | null;
  cycleWeekdays?: DayOfWeek[] | null;
  lastUsedAt?: string | null; // yyyy-MM-dd
}

export interface ProductResponse {
  id: number;
  name: string;
  usageStep: UsageStep;
  ingredientTags: IngredientTag[];
  cycleType: CycleType;
  cycleIntervalDays: number | null;
  cycleWeekdays: DayOfWeek[] | null;
  nightOnly: boolean;
  lastUsedAt: string | null; // yyyy-MM-dd
  nextUseDate: string | null; // yyyy-MM-dd
}
