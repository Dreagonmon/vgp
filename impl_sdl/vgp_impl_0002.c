#include <vgp_config.h>
#include <vgp_impl_0002.h>
#include <hw.h>

#if (VGP_FEATURE_GAMEPAD > 0)
int32_t vgp_gamepad_status(void) {
    return __hw_get_gamepad_status();
}
#endif
