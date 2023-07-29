#ifndef vgp_runtime_h
#define vgp_runtime_h

#include <stdint.h>
#include <wasm3.h>

#define VFEATURE_SCREEN_SIZE 0x00
#define VFEATURE_SCREEN_COLOR_FORMAT 0x01
#define VFEATURE_GAMEPAD_SUPPORT 0x02
#define VFEATURE_SAVE_SIZE 0x03
#define VFEATURE_RTC_SUPPORT 0x04

#define VCOLOR_FORMAT_BW 1
#define VCOLOR_FORMAT_RGB888 2

M3Result __vgp_link_runtime(IM3Module module);

#endif // vgp_runtime_h