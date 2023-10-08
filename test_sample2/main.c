#include <stdint.h>
#include <stdio.h>
#include <env.h>
#include <_malloc.h>

#include "screen.h"
#include "framebuf.h"

void init(void) {
    size_t mems = _init_memory(1);
    printf("Total Memory Available: %lu\n", mems);
    screen_init();
    gfb_clear(get_frame_buffer(), COLOR_CLEAR);
    screen_flush();
}

void game_init(void);
void game_loop(void);

WASM_EXPORT("vinit") void vinit() {
    init();
    screen_flush();
    game_init();
}

WASM_EXPORT("vloop") void vloop() {
    game_loop();
}
