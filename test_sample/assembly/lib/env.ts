
// @ts-ignore: decorator
@external("env", "get_feature")
export declare function get_feature(featureId: i32): i32;

// @ts-ignore: decorator
@external("env", "call0")
export declare function call0(func: i32): i32;

// @ts-ignore: decorator
@external("env", "call1")
export declare function call1(func: i32, p1: i32): i32;

// @ts-ignore: decorator
@external("env", "call2")
export declare function call2(func: i32, p1: i32, p2: i32): i32;

// @ts-ignore: decorator
@external("env", "call3")
export declare function call3(func: i32, p1: i32, p2: i32, p3: i32): i32;

// @ts-ignore: decorator
@external("env", "call4")
export declare function call4(func: i32, p1: i32, p2: i32, p3: i32, p4: i32): i32;

export const VFEATURE_SCREEN_SIZE: i32 = 0x0000;
export const VFEATURE_SCREEN_COLOR_FORMAT: i32 = 0x0001;
export const VFEATURE_GAMEPAD_SUPPORT: i32 = 0x0002;
export const VFEATURE_SAVE_CAPACITY: i32 = 0x0003;
export const VFEATURE_RTC_SUPPORT: i32 = 0x0004;

export const VFUNC_UPDATE_SCREEN_BUFFER: i32 = 0x000100;
export const VFUNC_CPU_TICKS_MS: i32 = 0x000101;
export const VFUNC_TRACE_PUT_CHAR: i32 = 0x000102;
export const VFUNC_SYSTEM_EXIT: i32 = 0x000103;
export const VFUNC_GAMEPAD_STATUS: i32 = 0x000200;
export const VFUNC_SAVE_WRITE: i32 = 0x000300;
export const VFUNC_SAVE_FLUSH: i32 = 0x000301;
export const VFUNC_SAVE_READ: i32 = 0x000302;
export const VFUNC_RTC_GET_H32: i32 = 0x000400;
export const VFUNC_RTC_SET_H32: i32 = 0x000401;
export const VFUNC_RTC_GET_L32: i32 = 0x000402;
export const VFUNC_RTC_SET_L32: i32 = 0x000403;

/* ======== Feature Must Have ======== */

export const VCOLOR_FORMAT_MVLSB: i32 = 1;
export const VCOLOR_FORMAT_GS8: i32 = 2;

const INT32_MAX: i32 = 0x7FFFFFFF;

export const update_screen_buffer = (bufferPointer: i32): void => {
    call1(VFUNC_UPDATE_SCREEN_BUFFER, bufferPointer);
};

export const cpu_ticks_ms = (): i32 => {
    return call0(VFUNC_CPU_TICKS_MS);
};

export const ticks_diff = (t2: i32, t1: i32): i32 => {
    let half: i32 = (INT32_MAX / 2) + 1;
    return ((t2 - t1 + half) & INT32_MAX) - half;
};

export const trace_put_char = (ch: i32): void => {
    call1(VFUNC_TRACE_PUT_CHAR, ch & 0x7F);
};

const trace_put_string = (text: string): void => {
    for (let p: i32 = 0; p < text.length; p++) {
        trace_put_char(text.charCodeAt(p));
    }
};

export const system_exit = (): void => {
    call0(VFUNC_SYSTEM_EXIT);
};

export const abort = (msg: string = "", fileName: string = "", lineNumber: i32 = 0, columnNumber: i32 = 0): void => {
    if (msg.length > 0) {
        trace_put_string(msg);
        trace_put_string("\n");
    }
    if (fileName.length > 0) {
        trace_put_string(`File: ${fileName} Line: ${lineNumber} Col: ${columnNumber}\n`);
    }
    system_exit();
};

class Console {
    log(message: string = ""): void {
        trace_put_string(message);
        trace_put_string("\n");
    }
    debug(message: string = ""): void {
        this.log("[Debug] " + message);
    }
    info(message: string = ""): void {
        this.log("[Info] " + message);
    }
    warn(message: string = ""): void {
        this.log("[Warning] " + message);
    }
    error(message: string = ""): void {
        this.log("[Error] " + message);
    }
}

export const console = new Console();

/* ======== Feature Gamepad ======== */

export const gamepad_status = (): i32 => {
    return call0(VFUNC_GAMEPAD_STATUS);
};

/* ======== Feature Save ======== */
export const save_write = (offset: i32, value: i32): void => {
    call2(VFUNC_SAVE_WRITE, offset, value);
};

export const save_flush = (): void => {
    call0(VFUNC_SAVE_FLUSH);
};

export const save_read = (offset: i32): i32 => {
    return call1(VFUNC_SAVE_READ, offset);
};

/* ======== Feature RTC ======== */
export const rtc_get_h32 = (): i32 => {
    return call0(VFUNC_RTC_GET_H32);
};

export const rtc_set_h32 = (value: i32): void => {
    call1(VFUNC_RTC_SET_H32, value);
};

export const rtc_get_l32 = (): i32 => {
    return call0(VFUNC_RTC_GET_L32);
};

export const rtc_set_l32 = (value: i32): void => {
    call1(VFUNC_RTC_SET_L32, value);
};
