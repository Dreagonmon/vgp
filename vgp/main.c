#include "wasm3.h"
#include "m3_env.h"
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <stdbool.h>

#define FATAL(msg, ...) { printf("Fatal: " msg "\n", ##__VA_ARGS__); return; }
#define WASM_STACK_SIZE 4096
static void check (IM3Runtime runtime, M3Result result) {
    if (result != m3Err_none) {
        M3ErrorInfo info;
        m3_GetErrorInfo(runtime, &info);
        fprintf(stderr, "WASM error: %s (%s)\n", result, info.message);
        exit(1);
    }
}

void init_wasm(uint8_t* wasm, uint32_t fsize) {
    M3Result result = m3Err_none;

    // uint8_t* wasm = (uint8_t*)fib32_wasm;
    // uint32_t fsize = fib32_wasm_len;

    printf("Loading WebAssembly...\n");
    IM3Environment env = m3_NewEnvironment ();
    if (!env) FATAL("m3_NewEnvironment failed");

    IM3Runtime runtime = m3_NewRuntime (env, WASM_STACK_SIZE, NULL);
    if (!runtime) FATAL("m3_NewRuntime failed");

    // init memory 64K
    runtime->memory.maxPages = 1;
    ResizeMemory(runtime, 1);

    IM3Module module;
    result = m3_ParseModule (env, &module, wasm, fsize);
    if (result) FATAL("m3_ParseModule: %s", result);
    module->memoryImported = true;

    result = m3_LoadModule (runtime, module);
    if (result) FATAL("m3_LoadModule: %s", result);

    // Call start functions
    check(runtime, m3_RunStart(module));
    M3Function* func;
    m3_FindFunction(&func, runtime, "_start");
    if (func) {
        check(runtime, m3_CallV(func));
    }
    m3_FindFunction(&func, runtime, "_initialize");
    if (func) {
        check(runtime, m3_CallV(func));
    }

    IM3Function f;
    result = m3_FindFunction (&f, runtime, "vinit");
    if (result) FATAL("m3_FindFunction: %s", result);

    printf("Running...\n");

    result = m3_CallV(f, 24);
    check(runtime, result);
    if (result) FATAL("m3_Call: %s", result);

    unsigned value = 0;
    result = m3_GetResultsV (f, &value);
    if (result) FATAL("m3_GetResults: %s", result);

    printf("Result: %u\n", value);
}

int main() {
    // load test wasm
    uint8_t *wasm = malloc(65536);
    FILE *file = fopen("test_sample/build/debug.wasm", "rb");
    const size_t wasm_len = fread(wasm, 1, 65536, file);
    fclose(file);
    // wasm
    init_wasm(wasm, wasm_len);
    // deinit
    free(wasm);
    return 0;
}