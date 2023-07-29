#ifndef vgp_h
#define vgp_h

#include <vgp_config.h>
#include <stdint.h>
#include <stdbool.h>
#include <wasm3.h>

bool vgp_init(uint8_t* wasm, uint32_t fsize);
void vgp_destory(void);
bool vgp_loop_once(void);
void vgp_get_wasm_error(M3ErrorInfo *o_info);

#endif // vgp_h