#include <vgp_config.h>
#include <vgp_impl_0004.h>
#include <hw.h>
#include <time.h>

#if (VGP_FEATURE_RTC > 0)

int32_t rtc_get_h32(void) {
    return (__hw_get_timestamp() >> 32) & 0xFFFFFFFF;
}
void rtc_set_h32(int32_t value) {
    __hw_set_timestamp_h32(value);
}
int32_t rtc_get_l32(void) {
    return __hw_get_timestamp() & 0xFFFFFFFF;
}
void rtc_set_l32(int32_t value) {
    __hw_set_timestamp_l32(value);
}

#endif