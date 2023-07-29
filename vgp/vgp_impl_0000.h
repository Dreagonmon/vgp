/**
 * Features Must Have
*/
#ifndef vgp_impl_0000_h
#define vgp_impl_0000_h

#include <vgp_config.h>
#include <stdint.h>

int32_t vgp_screen_get_size(void);
int32_t vgp_screen_get_color_format(void);
void vgp_screen_pixel(int32_t x, int32_t y, int32_t color);
int32_t vgp_cpu_ticks_ms(void);
void vgp_trace_put_char(int32_t ascii_byte);
void vgp_system_exit(void);

#endif // vgp_impl_0000_h