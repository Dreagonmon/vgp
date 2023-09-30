#include <vgp_impl_0001.h>
#include <hw.h>
#include <stdio.h>

int32_t vgp_screen_get_size(void) {
    return ((SCREEN_WIDTH & 0xFFF) << 12) | (SCREEN_HEIGHT & 0xFFF);
}

int32_t vgp_screen_get_color_format(void) {
    return SCREEN_COLOR_FORMAT;
}

void vgp_update_screen_buffer(uint8_t *buffer) {
    __hw_update_screen_buffer(buffer);
}

int32_t vgp_cpu_ticks_ms(void) {
    return __hw_ticks_ms();
}

void vgp_trace_put_char(int32_t ascii_byte) {
    if (ascii_byte < 0 || ascii_byte >= 0x7F) {
        // DEBUG_PRINTF("?");
        putchar(0x3F);
    } else {
        // DEBUG_PRINTF("%c", ascii_byte & 0x7F);
        putchar(ascii_byte & 0x7F);
    }
}

void vgp_system_exit(void) {
    __hw_notify_quit();
}
