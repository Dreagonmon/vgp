#include <stdint.h>
#include <stdbool.h>
#include <env.h>

typedef unsigned long usize_t;

void trace(char *text, int32_t len) {
    for (int i = 0; i < len; i++) {
        trace_put_char(text[i]);
    }
}

void trace_uint32(uint32_t num) {
    uint32_t mod = 1000000000;
    for (int i = 0; i < 10; i++) {
        trace_put_char(0x30 + ((num / mod) % 10));
        mod /= 10;
    }
    trace_put_char('\n');
}

// stupid alloctor
extern void *__heap_base;
uint8_t * bump_pointer = (uint8_t *) &__heap_base;
void *malloc(usize_t n) {
    uint8_t * r = bump_pointer;
    bump_pointer += n;
    return (void *)r;
}

WASM_EXPORT("memset") void *memset(void *str, int c, usize_t n) {
    uint8_t *mem = (uint8_t *) str;
    for (int i = 0; i < n; i++) {
        mem[i] = (uint8_t) c;
    }
    return str;
}

void free(void* p) {
  // lol
}

#define SCR_BUF_SIZE 4096
static uint8_t *scr_buf = 0;
static int32_t scr_buf_real_size = 0;
static uint8_t last_color = 0;
static int32_t sw;
static int32_t sh;

void init_screen(void) {
    int32_t sfmt = get_feature(VFEATURE_SCREEN_COLOR_FORMAT);
    if (sfmt != VCOLOR_FORMAT_MVLSB) {
        char msg[] = "screen format not support.\n";
        trace(msg, sizeof(msg));
        system_exit();
    }
    int32_t ssz = get_feature(VFEATURE_SCREEN_SIZE);
    sw = (ssz >> 12) & 0xFFF;
    sh = ssz & 0xFFF;
    scr_buf_real_size = sw * (sh / 8);
    scr_buf = malloc(scr_buf_real_size);
    for (int i = 0; i < scr_buf_real_size; i++) {
        scr_buf[i] = 0;
    }
    last_color = 0;
    update_screen_buffer(scr_buf);
}

void screen_pixel_mvlsb(int32_t x, int32_t y, int32_t c) {
    uint32_t index = (y >> 3) * sw + x;
    uint8_t offset = y & 0x07;
    uint8_t nValue = (scr_buf[index] & ~(0x01 << offset)) | (uint8_t)((c & 1) << offset);
    scr_buf[index] = nValue;
};

WASM_EXPORT("vinit") void vinit() {
    char line[] = "Hello Dragon\n";
    trace(line, sizeof(line));
    init_screen();
}

WASM_EXPORT("vloop") void vloop() {
    trace_uint32(last_color);
    for (int y = 0; y < sh; y++) {
        for (int x = 0; x < sw; x++) {
            screen_pixel_mvlsb(x, y, last_color & 1);
        }
    }
    // memset(scr_buf, last_color, scr_buf_real_size);
    last_color = last_color ? 0 : 0xFF;
    update_screen_buffer(scr_buf);
}
