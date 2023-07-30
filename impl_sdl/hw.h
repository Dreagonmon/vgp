#ifndef hardware_h
#define hardware_h

#include <stdint.h>
#include <stdbool.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

void __hw_init(void);
void __hw_draw_pixel(int32_t x, int32_t y, int32_t color);
int32_t __hw_ticks_ms(void);
int32_t __hw_get_gamepad_status(void);
void __hw_task_each_frame(void);
void __hw_notify_quit(void);
bool __hw_should_quit(void);
void __hw_do_quit(void);

#endif // hardware_h