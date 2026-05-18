export const BRAND_NAME_MAX_LENGTH = 30;
export const CORE_HOOK_MAX_LENGTH = 50;

export function clampBrandName(value: string): string {
  return value.slice(0, BRAND_NAME_MAX_LENGTH);
}

export function clampCoreHook(value: string): string {
  return value.slice(0, CORE_HOOK_MAX_LENGTH);
}
