let print_buffer = [];
let screen = document.createElement("canvas");
let scr_context = screen.getContext("2d").getImageData(0, 0, screen.width, screen.height);
/** @type {WebAssembly.Instance} */
let instance = undefined;
let on_scr_refresh = (screen_canvas) => { };
let key_state = 0b000000;
let save_buffer = new Uint8Array(4096);
let save_name = "";

export const KEY_UP =       0b00000001;
export const KEY_DOWN =     0b00000010;
export const KEY_LEFT =     0b00000100;
export const KEY_RIGHT =    0b00001000;
export const KEY_A =        0b00010000;
export const KEY_B =        0b00100000;

const fun_get_extra_feature = () => {
    return 0b00000000_00000000_00000000_00000000;
};

const fun_put_ch = (val) => {
    const byt = val & 0x7F;
    if (val != 0x0A) {
        print_buffer.push(byt);
    } else {
        // \n
        let text = "";
        for (const ch of print_buffer) {
            text += String.fromCharCode(ch);
        }
        print_buffer.splice(0, print_buffer.length);
        console.log(text);
    }
};

const fun_ticks_ms = () => {
    return Date.now() & 0x7FFFFFFF;
};

const fun_scr_pixel = (x, y, c) => {
    if (x < 0 || x >= 128 || y < 0 || y >= 64) {
        return;
    }
    const offset = (y * scr_context.width + x) * 4;
    if (c > 0) {
        scr_context.data[offset] = 255;
        scr_context.data[offset + 1] = 255;
        scr_context.data[offset + 2] = 255;
        scr_context.data[offset + 3] = 255;
    } else {
        scr_context.data[offset] = 0;
        scr_context.data[offset + 1] = 0;
        scr_context.data[offset + 2] = 0;
        scr_context.data[offset + 3] = 0;
    }
};

const fun_scr_refresh = () => {
    screen.getContext("2d").putImageData(scr_context, 0, 0);
    on_scr_refresh(screen);
};

const fun_kpd_query = () => {
    return key_state;
};

const fun_read_save = (offset) => {
    if (offset < 0 || offset >= 4096) {
        return -1;
    }
    return save_buffer[ offset ];
};

const fun_write_save = (offset, val) => {
    if (offset < 0 || offset >= 4096) {
        return;
    }
    save_buffer[ offset ] = val & 0xFF;
};

const fun_commit_save = () => {
    let text = "";
    for (const ch of save_buffer) {
        text += String.fromCharCode(ch);
    }
    localStorage.setItem(save_name, text);
};

const get_imported_object = () => {
    return {
        env: {
            memory: new WebAssembly.Memory({ initial: 1, maximum: 1 }),
            get_extra_feature: fun_get_extra_feature,
            put_ch: fun_put_ch,
            ticks_ms: fun_ticks_ms,
            scr_pixel: fun_scr_pixel,
            scr_refresh: fun_scr_refresh,
            kpd_query: fun_kpd_query,
            read_save: fun_read_save,
            write_save: fun_write_save,
            commit_save: fun_commit_save,
        },
    };
};

export const vgp_load_wasm = async (wasm_bytes) => {
    screen = document.createElement("canvas");
    screen.width = 128;
    screen.height = 64;
    screen.getContext("2d").imageSmoothingEnabled = false;
    scr_context = screen.getContext("2d").getImageData(0, 0, screen.width, screen.height);
    const loaded = await WebAssembly.instantiate(wasm_bytes, get_imported_object());
    instance = loaded.instance;
};

export const vgp_init_save = (name) => {
    save_name = name;
    save_buffer = new Uint8Array(4096);
    const data = localStorage.getItem(name);
    if (data !== null) {
        let index = 0;
        for (const ch of data) {
            save_buffer[ index ] = ch.charCodeAt(0) & 0xFF;
            index ++;
        }
    }
};

/**
 * @param {(screen_canvas: HTMLCanvasElement) => {}} cb 
 */
export const vgp_set_on_screen_refresh_callback = (cb) => {
    on_scr_refresh = cb;
};

export const vgp_init_wasm = () => {
    // Call the WASI _start/_initialize function (different from WASM-4's start callback!)
    if (typeof instance.exports["_start"] === 'function') {
        instance.exports._start();
    }
    if (typeof instance.exports["_initialize"] === 'function') {
        instance.exports._initialize();
    }
    instance.exports.vinit();
}

export const vgp_loop_once = () => {
    instance.exports.vloop_once();
}

export const vgp_set_key_state = (key, val) => {
    if (val) {
        key_state = key_state | key;
    } else {
        key_state = key_state & (~key);
    }
}
