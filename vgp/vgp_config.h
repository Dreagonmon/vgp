#ifndef vgp_config_h
#define vgp_config_h

#define WASM_STACK_SIZE 4096
// #define VGP_FEATURE_GAMEPAD 1

// ==================================
// ======== Feature Fallback ========

// Feature Gamepad 0x02
#ifndef VGP_FEATURE_GAMEPAD
    #define VGP_FEATURE_GAMEPAD 0
#endif

#endif // vgp_config_h