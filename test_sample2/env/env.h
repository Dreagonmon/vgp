#ifndef ENV_H
#define ENV_H

#include <stdint.h>

#define WASM_IMPORT(mod,name) __attribute((import_module(mod),import_name(name)))
#define WASM_EXPORT(name) __attribute((export_name(name)))

WASM_IMPORT("env","get_feature")
int32_t get_feature(int32_t feature_id);

WASM_IMPORT("env","call0")
int32_t call0(int32_t fid);

WASM_IMPORT("env","call1")
int32_t call1(int32_t fid, int32_t p1);

WASM_IMPORT("env","call2")
int32_t call2(int32_t fid, int32_t p1, int32_t p2);

WASM_IMPORT("env","call3")
int32_t call3(int32_t fid, int32_t p1, int32_t p2, int32_t p3);

WASM_IMPORT("env","call4")
int32_t call4(int32_t fid, int32_t p1, int32_t p2, int32_t p3, int32_t p4);


#define VFEATURE_SCREEN_SIZE 0x0000
#define VFEATURE_SCREEN_COLOR_FORMAT 0x0001

#define VCOLOR_FORMAT_MVLSB 1

#define VFUNC_UPDATE_SCREEN_BUFFER 0x000100
#define VFUNC_CPU_TICKS_MS 0x000101
#define VFUNC_TRACE_PUT_CHAR 0x000102
#define VFUNC_SYSTEM_EXIT 0x000103

void update_screen_buffer(uint8_t *buffer_p);
int32_t cpu_ticks_ms(void);
void trace_put_char(char ch);
void system_exit(void);

#endif