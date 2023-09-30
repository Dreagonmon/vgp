#include <vgp_config.h>
#include <vgp_impl_0003.h>
#include <hw.h>

#if (VGP_FEATURE_SAVE > 0)
void save_write(int32_t offset, int32_t byte) {
    if (offset >= 0 && offset < SAVE_CAPACITY) {
        __hw_get_save_buffer()[offset] = byte & 0xFF;
    }
}

void save_flush(void) {
    __hw_commit_save_buffer();
}

int32_t save_read(int32_t offset) {
    if (offset >= 0 && offset < SAVE_CAPACITY) {
        return __hw_get_save_buffer()[offset];
    }
    return 0;
}

int32_t save_get_capacity(void) {
    return SAVE_CAPACITY;
}
#endif
