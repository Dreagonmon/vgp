/**
 * Features Must Have
*/
#ifndef vgp_impl_0000_h
#define vgp_impl_0000_h

#include <stdint.h>

#define VCOLOR_FORMAT_BW 1
#define VCOLOR_FORMAT_RGB888 2

int32_t vgp_screen_get_size(void);
int32_t vgp_screen_get_color_format(void);
void vgp_screen_pixel(int32_t x, int32_t y, int32_t color);
int32_t vgp_cpu_ticks_ms(void);
void vgp_trace_put_char(int32_t ascii_byte);
void vgp_system_exit(void);

#endif // vgp_impl_0000_h