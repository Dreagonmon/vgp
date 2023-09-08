#include <vgp_impl_0001.h>
#include <hw.h>
#include <stdio.h>
#include <stdlib.h>
#include <SDL2/SDL.h>

// _MASK only works if SCREEN_WIDTH and SCREEN_HEIGHT is 2^n
#define _BORDER_CHECK_OPTIMIZE ( \
    ( \
        SCREEN_WIDTH == 32 \
        || SCREEN_WIDTH == 64 \
        || SCREEN_WIDTH == 128 \
        || SCREEN_WIDTH == 256 \
        || SCREEN_WIDTH == 512 \
        || SCREEN_WIDTH == 1024 \
        || SCREEN_WIDTH == 2048 \
    ) && ( \
        SCREEN_HEIGHT == 32 \
        || SCREEN_HEIGHT == 64 \
        || SCREEN_HEIGHT == 128 \
        || SCREEN_HEIGHT == 256 \
        || SCREEN_HEIGHT == 512 \
        || SCREEN_HEIGHT == 1024 \
        || SCREEN_HEIGHT == 2048 \
    ) \
)
#define _W_MASK (UINT32_MAX - SCREEN_WIDTH + 1)
#define _H_MASK (UINT32_MAX - SCREEN_HEIGHT + 1)

int32_t vgp_screen_get_size() {
    return ((SCREEN_WIDTH & 0xFFF) << 12) | (SCREEN_HEIGHT & 0xFFF);
}

int32_t vgp_screen_get_color_format() {
    return SCREEN_COLOR_FORMAT;
}

void vgp_screen_pixel(int32_t x, int32_t y, int32_t c) {
    #if (_BORDER_CHECK_OPTIMIZE)
    // faster version
    // SCREEN_WIDTH - 1  = 127                    = 0b1111111
    // _W_MASK     = 0b11111111111111111111111110000000
    // SCREEN_HEIGHT - 1  = 63                      = 0b111111
    // _H_MASK     = 0b11111111111111111111111111000000
    if ( x & _W_MASK || y & _H_MASK) {
        return;
    }
    #else
    if (x < 0 || x >= SCREEN_WIDTH || y < 0 || y >= SCREEN_HEIGHT) {
        return;
    }
    #endif
    // printf("Screen Pixel: %d, %d | %d\n", x, y, c);
    __hw_draw_pixel(x, y, c);
}

int32_t vgp_cpu_ticks_ms(void) {
    return __hw_ticks_ms();
}

void vgp_trace_put_char(int32_t ascii_byte) {
    if (ascii_byte < 0 || ascii_byte >= 0x7F) {
        // printf("?");
        putchar(0x3F);
    } else {
        // printf("%c", ascii_byte & 0x7F);
        putchar(ascii_byte & 0x7F);
    }
}

void vgp_system_exit(void) {
    __hw_notify_quit();
}
