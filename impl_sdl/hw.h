#ifndef hardware_h
#define hardware_h

#include <stdint.h>
#include <stdbool.h>
#include <vgp_config.h>
#include <vgp_impl_0001.h>
#include <SDL2/SDL_scancode.h>

#define SCREEN_PIXEL_SCALE 8
#define SCREEN_PIXEL_OFFSET_MOD 1
#define SCREEN_PIXEL_SIZE_MOD -2
#define SCREEN_COLOR_FORMAT VCOLOR_FORMAT_MVLSB
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#if (SCREEN_COLOR_FORMAT == VCOLOR_FORMAT_MVLSB)
#define SCREEN_BUFFER_SIZE (SCREEN_WIDTH * (SCREEN_HEIGHT / 8))
#endif
#if  (SCREEN_COLOR_FORMAT == VCOLOR_FORMAT_GS8)
#define SCREEN_BUFFER_SIZE (SCREEN_WIDTH * SCREEN_HEIGHT)
#endif

#if (VGP_FEATURE_GAMEPAD > 0)
#define KEY_SCAN_CODE_A SDL_SCANCODE_K
#define KEY_SCAN_CODE_B SDL_SCANCODE_J
#define KEY_SCAN_CODE_UP SDL_SCANCODE_W
#define KEY_SCAN_CODE_DOWN SDL_SCANCODE_S
#define KEY_SCAN_CODE_LEFT SDL_SCANCODE_A
#define KEY_SCAN_CODE_RIGHT SDL_SCANCODE_D
#endif // (VGP_FEATURE_GAMEPAD > 0)
#if (VGP_FEATURE_SAVE > 0)
#define SAVE_CAPACITY (8 * 1024)
#endif // (VGP_FEATURE_SAVE > 0)

#if (SCREEN_WIDTH > 0xFFF)
    #error Screen width must less than 4096
#endif // (SCREEN_WIDTH > 0xFFF)
#if (SCREEN_HEIGHT > 0xFFF)
    #error Screen height must less than 4096
#endif // (SCREEN_HEIGHT > 0xFFF)

void __hw_init(void);
void __hw_update_screen_buffer(uint8_t *buffer);
int32_t __hw_ticks_ms(void);
void __hw_task_each_frame(void);
void __hw_notify_quit(void);
bool __hw_should_quit(void);
void __hw_do_quit(void);
void *__hw_load_wasm(const char *wasm_path, size_t *data_size);
#if (VGP_FEATURE_GAMEPAD > 0)
int32_t __hw_get_gamepad_status(void);
#endif // (VGP_FEATURE_GAMEPAD > 0)
#if (VGP_FEATURE_SAVE > 0)
uint8_t *__hw_get_save_buffer(void);
void __hw_commit_save_buffer(void);
#endif // (VGP_FEATURE_SAVE > 0)
#if (VGP_FEATURE_RTC > 0)
uint64_t __hw_get_timestamp(void);
void __hw_set_timestamp_h32(int32_t value);
void __hw_set_timestamp_l32(int32_t value);
#endif

#endif // hardware_h