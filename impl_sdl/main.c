#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <stdbool.h>
#include <vgp.h>
#include <vgp_error.h>
#include <hw.h>

int main(int argc, char *argv[]) {
    if (argc < 2) {
        DEBUG_PRINTF("Expect a path to the wasm file.\n");
        return 1;
    }
    char *wasm_path = argv[1];
    // load test wasm
    size_t wasm_len = 0;
    uint8_t *wasm = __hw_load_wasm(wasm_path, &wasm_len);
    if (wasm == NULL) {
        DEBUG_PRINTF("Failed to open wasm file: %s\n", wasm_path);
        return 1;
    }
    // uint8_t *wasm = malloc(65536);
    // FILE *file = fopen("test_sample/build/debug.wasm", "rb");
    // const size_t wasm_len = fread(wasm, 1, 65536, file);
    // fclose(file);
    // init
    __hw_init();
    bool successed = vgp_init(wasm, wasm_len);
    if (!successed) {
        DEBUG_PRINTF("init: %s\n", vgp_get_last_error());
    }
    // loop
    while (successed) {
        successed = vgp_loop_once();
        __hw_task_each_frame();
        if (__hw_should_quit()) {
            DEBUG_PRINTF("System Quit.\n");
            break;
        }
    }
    if (!successed) {
        DEBUG_PRINTF("loop: %s\n", vgp_get_last_error());
    }
    // deinit
    vgp_destory();
    free(wasm);
    __hw_do_quit();
    return 0;
}