#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <stdbool.h>
#include <vgp.h>
#include <vgp_error.h>

int main() {
    // load test wasm
    uint8_t *wasm = malloc(65536);
    FILE *file = fopen("test_sample/build/debug.wasm", "rb");
    const size_t wasm_len = fread(wasm, 1, 65536, file);
    fclose(file);
    // vgp
    bool successed = vgp_init(wasm, wasm_len);
    if (!successed) {
        printf("init: %s\n", vgp_get_last_error());
    }
    while (successed) {
        successed = vgp_loop_once();
    }
    if (!successed) {
        printf("loop: %s\n", vgp_get_last_error());
    }
    // deinit
    vgp_destory();
    free(wasm);
    return 0;
}