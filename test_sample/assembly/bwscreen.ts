import {
    getFeature,
    VFEATURE_SCREEN_SIZE,
    VFEATURE_SCREEN_COLOR_FORMAT,
    VCOLOR_FORMAT_BW,
    VCOLOR_FORMAT_RGB888,
    screen_pixel,
} from "./env.ts";

let SCRW: i32 = 0;
let SCRH: i32 = 0;
let WHITE: i32 = 0xFFFFFF;
const BLACK: i32 = 0;

export const screen_init = (): void => {
    const data: i32 = getFeature(VFEATURE_SCREEN_SIZE);
    const width: i32 = (data >> 12) & 0xFFF;
    const height: i32 = data & 0xFFF;
    SCRW = width;
    SCRH = height;
    const fmt: i32 = getFeature(VFEATURE_SCREEN_COLOR_FORMAT);
    if (fmt === VCOLOR_FORMAT_BW) {
        WHITE = 1;
    } else if (fmt === VCOLOR_FORMAT_RGB888) {
        WHITE = 0xFFFFFF;
    }
};

export const get_screen_width = (): i32 => SCRW;

export const get_screen_height = (): i32 => SCRH;

export const fill_screen = (color: i32): void => {
    const c: i32 = color > 0 ? WHITE : BLACK;
    for (let x: i32 = 0; x < SCRW; x++) {
        for (let y: i32 = 0; y < SCRH; y++) {
            screen_pixel(x, y, c);
        }
    }
};
