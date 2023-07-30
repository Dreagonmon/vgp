#include <vgp_impl_0001.h>
#include <stdio.h>
#include <stdlib.h>

#define _SCR_W 128
#define _SCR_H 64
#define _SCR_FMT VCOLOR_FORMAT_BW
// _MASK only works if _SCR_W and _SCR_H is 2^n
#define _W_MASK (UINT32_MAX - _SCR_W + 1)
#define _H_MASK (UINT32_MAX - _SCR_H + 1)

int32_t vgp_screen_get_size() {
    return ((_SCR_W & 0xFFF) << 12) | (_SCR_H & 0xFFF);
}

int32_t vgp_screen_get_color_format() {
    return _SCR_FMT;
}

void vgp_screen_pixel(int32_t x, int32_t y, int32_t c) {
    // if (x < 0 || x >= _SCR_W || y < 0 || y >= _SCR_H) {
    //     return;
    // }
    // faster version
    // _SCR_W - 1  = 127                    = 0b1111111
    // _W_MASK     = 0b11111111111111111111111110000000
    // _SCR_H - 1  = 63                      = 0b111111
    // _H_MASK     = 0b11111111111111111111111111000000
    if ( x & _W_MASK || y & _H_MASK) {
        return;
    }
    printf("Screen Pixel: %d, %d | %d\n", x, y, c);
}

int32_t vgp_cpu_ticks_ms(void) {
    return 0;
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
    printf("System Exit.\n");
    exit(0);
}
