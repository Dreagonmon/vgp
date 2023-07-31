import {
    VFEATURE_GAMEPAD_SUPPORT,
    gamepad_status, get_feature,
} from "./env.ts";

export const KEY_MASK_UP: i32 = (0b1 << 5);
export const KEY_MASK_DOWN: i32 = (0b1 << 4);
export const KEY_MASK_LEFT: i32 = (0b1 << 3);
export const KEY_MASK_RIGHT: i32 = (0b1 << 2);
export const KEY_MASK_A: i32 = (0b1 << 1);
export const KEY_MASK_B: i32 = (0b1 << 0);

export const GP_EVENT_NONE: i32 = 0x00;
export const GP_EVENT_PRESSED: i32 = 0x01;
export const GP_EVENT_RELEASED: i32 = 0x02;

let last_status: i32 = 0;

@inline
const make_event = (evt: i32, key: i32): i32 => {
    return (evt << 16) | (key & 0xFFFF);
};

export const gamepad_available = (): bool => {
    return get_feature(VFEATURE_GAMEPAD_SUPPORT) > 0;
};

export const get_gamepad_event = (): i32 => {
    // TODO: generate gamepad event
    return 0;
};
