import {
    VFEATURE_RTC_SUPPORT,
    get_feature,
    rtc_get_h32,
    rtc_set_h32,
    rtc_get_l32,
    rtc_set_l32,
} from "./env";

export const rtc_available = (): bool => {
    return get_feature(VFEATURE_RTC_SUPPORT) > 0;
};

export const rtc_get = (): i64 => {
    const hi: i32 = rtc_get_h32();
    const lo: i32 = rtc_get_l32();
    const now: u64 = ((hi as u32 as u64) << 32) | (lo as u32 as u64);
    return now as i64;
};

export const rtc_set = (value: i64): void => {
    const hi: i32 = (((value as u64) >> 32) & 0x00000000FFFFFFFF) as u32 as i32;
    const lo: i32 = ((value as u64) & 0x00000000FFFFFFFF) as u32 as i32;
    rtc_set_h32(hi);
    rtc_set_l32(lo);
}
