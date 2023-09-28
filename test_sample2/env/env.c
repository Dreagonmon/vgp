#include <env.h>

void update_screen_buffer(uint8_t *buffer_p) {
    call1(VFUNC_UPDATE_SCREEN_BUFFER, (int32_t) buffer_p);
}

int32_t cpu_ticks_ms(void) {
    return call0(VFUNC_CPU_TICKS_MS);
}

void trace_put_char(char ch) {
    call1(VFUNC_TRACE_PUT_CHAR, ch);
}

void system_exit(void) {
    call0(VFUNC_SYSTEM_EXIT);
}
