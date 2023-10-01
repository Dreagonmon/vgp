
const VFEATURE_SCREEN_SIZE = 0x0000;
const VFEATURE_SCREEN_COLOR_FORMAT = 0x0001;
const VFEATURE_GAMEPAD_SUPPORT = 0x0002;
const VFEATURE_SAVE_CAPACITY = 0x0003;
const VFEATURE_RTC_SUPPORT = 0x0004;

const VFUNC_UPDATE_SCREEN_BUFFER = 0x000100;
const VFUNC_CPU_TICKS_MS = 0x000101;
const VFUNC_TRACE_PUT_CHAR = 0x000102;
const VFUNC_SYSTEM_EXIT = 0x000103;
const VFUNC_GAMEPAD_STATUS = 0x000200;
const VFUNC_SAVE_WRITE = 0x000300;
const VFUNC_SAVE_FLUSH = 0x000301;
const VFUNC_SAVE_READ = 0x000302;
const VFUNC_RTC_GET_H32 = 0x000400;
const VFUNC_RTC_SET_H32 = 0x000401;
const VFUNC_RTC_GET_L32 = 0x000402;
const VFUNC_RTC_SET_L32 = 0x000403;

/* screen */
const VCOLOR_FORMAT_MVLSB = 1;
const VCOLOR_FORMAT_GS8 = 2;
/* gamepad */
const KEY_MASK_UP = (0b1 << 5);
const KEY_MASK_DOWN = (0b1 << 4);
const KEY_MASK_LEFT = (0b1 << 3);
const KEY_MASK_RIGHT = (0b1 << 2);
const KEY_MASK_A = (0b1 << 1);
const KEY_MASK_B = (0b1 << 0);

const INT32_MIN = (-2147483647 - 1);
const INT32_MAX = 2147483647;
const TRUE = 1;
const FALSE = 0;

const BACKLOG_LIMIT = 9999;
const LKEY_SAVE_PREFIX = "_vgps_";
const LKEY_RTC_OFFSET = "_vrtc_";

const as_u32 = (num) => {
    if (typeof num === "bigint") {
        return Number.parseInt(num & 0xFFFFFFFFn);
    } else if (typeof num === "number") {
        return num & 0xFFFFFFFF;
    }
    return num;
};

const as_i32 = (num) => {
    if (typeof num === "bigint") {
        return Number.parseInt(num % 0x80000000n);
    } else if (typeof num === "number") {
        return num % 0x80000000;
    }
    return num;
};

const u32_as_i32 = (num) => {
    let n = as_u32(num);
    if (n > 0x7FFF_FFFF) {
        n = n - 0xFFFF_FFFF - 1;
    }
    return n;
};

const i32_as_u32 = (num) => {
    let n = as_i32(num);
    if (n < 0) {
        n = n + 0xFFFFFFFF + 1;
    }
    return n;
};

export class VirtualGamePocket {
    // ======== display related ========
    #scrw = 0; // screen width
    #scrh = 0; // screen height
    #savcap = 0; // save capacity
    #pscale = 1; // pixel scale mod
    #pofmod = 0; // pixel offset mod
    #pszmod = 0; // pixel size mod
    /** @type {HTMLCanvasElement} */
    #ofscvs = null; // off screen canvas
    /** @type {HTMLCanvasElement} */
    #dspcvs = null; // display canvas
    /** @type {Uint8Array} */
    #dspbuf = null; // display buffer
    #dspbufdty = false; // display buffer is dirty
    //
    // ======== print related ========
    /** @type {HTMLElement} */
    #pelem = null; // print element
    /** @type {Array<string>} */
    #phis = []; // print history
    /** @type {Array<string>} */
    #pcline = []; // print current line
    //
    // ======== gamepad related ========
    #kstat = 0; // key status
    //
    // ======== save related ========
    #name = "VGP"; // name used for prefix
    /** @type {Uint8Array} */
    #savbuf = null; // save buffer
    //
    // ======== rtc related ========
    #rtcoff = 0n; // rtc offset
    #rtcval = 0n; // rtc value
    #rtcmod = 0n; // rtc value (modified)
    #rtcdty = false; // rtc is modified
    //
    // ======== runtime related ========
    /** @type {WebAssembly.Instance} */
    #wasm = null; // wasm instance
    /** @type {WebAssembly.Memory} */
    #mem = null; // wasm memory
    #exited = false; // exit flag
    constructor (screenWidth = 128, screenHeight = 64, saveCapacity = 8192, pixelScale = 8, pixelOffsetMod = 1, pixelSizeMod = -2) {
        this.#scrw = screenWidth;
        this.#scrh = screenHeight;
        this.#savcap = saveCapacity;
        this.#pscale = pixelScale;
        this.#pofmod = pixelOffsetMod;
        this.#pszmod = pixelSizeMod;
        this.#ofscvs = document.createElement("canvas");
        this.#dspbuf = new Uint8Array(this.#scrw * (Math.ceil(this.#scrh / 8)));
        this.#mem = new WebAssembly.Memory({ initial: 1, maximum: undefined });
        // init some varbs
        this.#ofscvs.width = this.#scrw * this.#pscale;
        this.#ofscvs.height = this.#scrh * this.#pscale;
        const ctx = this.#ofscvs.getContext("2d");
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, this.#ofscvs.width, this.#ofscvs.height);
        try {
            this.#rtcoff = BigInt(localStorage.getItem(LKEY_RTC_OFFSET));
        } catch {
            this.#rtcoff = 0n;
        }
    }

    #putChar (ch) {
        let chString = null;
        if (typeof ch == "number") {
            chString = String.fromCharCode(ch);
        } else if (typeof ch == "string") {
            chString = ch;
        }
        if (chString === "\n") {
            const line = this.#pcline.join("");
            this.#phis.push(line);
            if (this.#phis.length > BACKLOG_LIMIT) {
                this.#phis.splice(0, 1);
            }
            this.#pcline.splice(0, this.#pcline.length);
            if (this.#pelem != null) {
                this.#pelem.innerText = this.#phis.join("\n");
            }
        } else if (chString) {
            this.#pcline.push(chString);
        }
    }

    #putString (text, newLine = true) {
        for (const c of text) {
            this.#putChar(c);
        }
        if (newLine) {
            this.#putChar("\n");
        }
    }

    #putError (text) {
        this.#putString(`[VGP Error] ${text}`, true);
    }

    #about (reason) {
        this.#putError(reason);
        this.#exited = true;
    }

    #getPixelFromBuffer (x, y) {
        // MVLSB format
        const index = (y >> 3) * this.#scrw + x;
        const offset = y & 0x07;
        const value = (this.#dspbuf[ index ] >> offset) & 0x01;
        return value;
    }

    #drawPixel (ctxp, x, y, c) {
        /** @type {CanvasRenderingContext2D} */
        const ctx = ctxp;
        const rect_x = x * this.#pscale + this.#pofmod;
        const rect_y = y * this.#pscale + this.#pofmod;
        const rect_w = this.#pscale + this.#pszmod;
        const rect_h = this.#pscale + this.#pszmod;
        ctx.fillStyle = c ? "white" : "black";
        ctx.fillRect(rect_x, rect_y, rect_w, rect_h);
    }

    #renderOffScreenCanvas () {
        const ctx = this.#ofscvs.getContext("2d");
        for (let y = 0; y < this.#scrh; y++) {
            for (let x = 0; x < this.#scrw; x++) {
                const color = this.#getPixelFromBuffer(x, y);
                this.#drawPixel(ctx, x, y, color);
            }
        }
    }

    #getMemoryBuffer () {
        /** @type {WebAssembly.Memory} */
        const buffer = this.#wasm.exports.memory;
        if (!buffer) {
            return this.#mem;
        }
        return buffer;
    }

    #ensureSave () {
        if (this.#savbuf == null) {
            this.#savbuf = new Uint8Array(this.#savcap);
            const localSave = localStorage.getItem(LKEY_SAVE_PREFIX + this.#name);
            if (localSave) {
                const copyLimit = Math.min(this.#savcap, localSave.length);
                for (let i = 0; i < copyLimit; i++) {
                    this.#savbuf[ i ] = localSave.charCodeAt(i);
                }
            }
        }
    }

    #impl_get_feature (feature_id) {
        switch (feature_id) {
            case VFEATURE_SCREEN_SIZE:
                return ((this.#scrw & 0xFFF) << 12) | (this.#scrh & 0xFFF);
            case VFEATURE_SCREEN_COLOR_FORMAT:
                return VCOLOR_FORMAT_MVLSB;
            case VFEATURE_GAMEPAD_SUPPORT:
                return TRUE;
            case VFEATURE_SAVE_CAPACITY:
                return this.#savcap;
            // return 0;
            case VFEATURE_RTC_SUPPORT:
                return TRUE;
            // return FALSE;
            default: return INT32_MIN;
        }
    }

    #impl_call0 (function_id) {
        switch (function_id) {
            case VFUNC_SYSTEM_EXIT:
                this.#exited = true;
                this.#putString("[VGP Exit]", true);
                return 0;
            case VFUNC_CPU_TICKS_MS:
                return Math.floor(performance.now()) & INT32_MAX;
            case VFUNC_GAMEPAD_STATUS:
                return u32_as_i32(this.#kstat);
            case VFUNC_SAVE_FLUSH:
                this.#ensureSave();
                localStorage.setItem(LKEY_SAVE_PREFIX + this.#name, String.fromCharCode(...this.#savbuf));
                return 0;
            case VFUNC_RTC_GET_H32:
                return u32_as_i32((this.#rtcmod >> 32n) & 0xFFFF_FFFFn);
            case VFUNC_RTC_GET_L32:
                return u32_as_i32(this.#rtcmod & 0xFFFF_FFFFn);
            default: return 0;
        }
    }

    #impl_call1 (function_id, p1) {
        switch (function_id) {
            case VFUNC_UPDATE_SCREEN_BUFFER:
                const mem = this.#getMemoryBuffer();
                if (mem) {
                    const mem8 = new Uint8Array(mem.buffer);
                    const memSize = mem8.byteLength;
                    const remainSize = memSize - p1;
                    if (p1 < 0 || remainSize < this.#dspbuf.length) {
                        this.#about(`Display Buffer Pointer Out of Range: ${p1}`);
                        return 0;
                    }
                    for (let i = 0; i < this.#dspbuf.length; i++) {
                        this.#dspbuf[ i ] = mem8[ p1 + i ];
                    }
                    this.#dspbufdty = true;
                }
                return 0;
            case VFUNC_TRACE_PUT_CHAR:
                this.#putChar(p1 & 0xFF);
                return 0;
            case VFUNC_SAVE_READ:
                p1 = i32_as_u32(p1);
                if (p1 < 0 || p1 >= this.#savcap) {
                    this.#about(`Save Wrtie Offset Out Of Range: ${p1}`);
                    return 0;
                }
                this.#ensureSave();
                return u32_as_i32(this.#savbuf[ p1 ]);
            case VFUNC_RTC_SET_H32:
                p1 = i32_as_u32(p1);
                this.#rtcmod = (this.#rtcmod & 0x0000_0000_FFFF_FFFFn) | (BigInt(p1) << 32n);
                this.#rtcdty = true;
                return 0;
            case VFUNC_RTC_SET_L32:
                p1 = i32_as_u32(p1);
                this.#rtcmod = (this.#rtcmod & 0xFFFF_FFFF_0000_0000n) | BigInt(p1);
                this.#rtcdty = true;
                return 0;
            default: return 0;
        }
    }

    #impl_call2 (function_id, p1, p2) {
        switch (function_id) {
            case VFUNC_SAVE_WRITE:
                p1 = i32_as_u32(p1);
                if (p1 < 0 || p1 >= this.#savcap) {
                    this.#about(`Save Wrtie Offset Out Of Range: ${p1}`);
                    return 0;
                }
                this.#ensureSave();
                this.#savbuf[ p1 ] = p2 & 0xFF;
                return 0;
            default: return 0;
        }
    }

    #makeImportObject () {
        return {
            env: {
                get_feature: this.#impl_get_feature.bind(this),
                call0: this.#impl_call0.bind(this),
                call1: this.#impl_call1.bind(this),
                call2: this.#impl_call2.bind(this),
                call3: (f, p1, p2, p3) => 0,
                call4: (f, p1, p2, p3, p4) => 0,
            },
        };
    }

    async load (buffer, name) {
        try {
            const mod = await WebAssembly.compile(buffer);
            const imps = WebAssembly.Module.imports(mod);
            const importObject = this.#makeImportObject();
            for (const item of imps) {
                if (item.kind == "memory") {
                    if (!importObject[ item.module ]) {
                        importObject[ item.module ] = {};
                    }
                    importObject[ item.module ] = {
                        ...importObject[ item.module ],
                        [ item.name ]: this.#mem,
                    };
                }
            }
            this.#wasm = await WebAssembly.instantiate(mod, importObject);
            this.#name = name;
        } catch (e) {
            this.#about(e.toString());
        }
    }

    async loadHttp (urlText) {
        try {
            const url = new URL(urlText, window.location.toString());
            const name = url.pathname.substring(url.pathname.lastIndexOf("/") + 1);
            const resp = await fetch(name, {
                mode: "cors",
                credentials: "omit",
            });
            if (resp.status !== 200) {
                throw new Error(`Failed to fetch .wasm binary: ${url.toString()}`);
            }
            const data = await resp.arrayBuffer();
            await this.load(data, name);
        } catch (e) {
            this.#about(e.toString());
        }
    }

    vinit () {
        try {
            if (this.#wasm && this.#wasm.exports._initialize && !this.#exited) {
                this.#wasm.exports._initialize();
            }
            if (this.#wasm && this.#wasm.exports._start && !this.#exited) {
                this.#wasm.exports._start();
            }
            if (this.#wasm && this.#wasm.exports.vinit && !this.#exited) {
                this.#wasm.exports.vinit();
            }
        } catch (e) {
            this.#about(e.toString());
        }
    }

    vloop () {
        try {
            if (this.#wasm && this.#wasm.exports.vloop && !this.#exited) {
                this.#wasm.exports.vloop();
            }
        } catch (e) {
            this.#about(e.toString());
        }
    }

    doBetweenFrames () {
        if (this.#dspbufdty) {
            this.#renderOffScreenCanvas();
            if (this.#dspcvs) {
                this.#dspcvs.getContext("2d").drawImage(this.#ofscvs, 0, 0);
            }
            this.#dspbufdty = false;
        }
        if (this.#rtcdty) {
            this.#rtcoff = this.#rtcmod - this.#rtcval;
            localStorage.setItem(LKEY_RTC_OFFSET, this.#rtcoff.toString());
            this.#rtcdty = false;
        }
        this.#rtcval = BigInt(Math.floor(Date.now() / 1000));
        this.#rtcmod = this.#rtcval + this.#rtcoff;
    }

    bindPrintElement (elem) {
        this.#pelem = elem;
    }

    bindDisplayElement (canvas) {
        this.#dspcvs = canvas;
        this.#dspcvs.width = this.#scrw * this.#pscale;
        this.#dspcvs.height = this.#scrh * this.#pscale;
    }

    setKeyUpStatus (isPressed) {
        if (isPressed) {
            this.#kstat = this.#kstat | KEY_MASK_UP;
        } else {
            this.#kstat = this.#kstat & ~(KEY_MASK_UP);
        }
    }

    setKeyDownStatus (isPressed) {
        if (isPressed) {
            this.#kstat = this.#kstat | KEY_MASK_DOWN;
        } else {
            this.#kstat = this.#kstat & ~(KEY_MASK_DOWN);
        }
    }

    setKeyLeftStatus (isPressed) {
        if (isPressed) {
            this.#kstat = this.#kstat | KEY_MASK_LEFT;
        } else {
            this.#kstat = this.#kstat & ~(KEY_MASK_LEFT);
        }
    }

    setKeyRightStatus (isPressed) {
        if (isPressed) {
            this.#kstat = this.#kstat | KEY_MASK_RIGHT;
        } else {
            this.#kstat = this.#kstat & ~(KEY_MASK_RIGHT);
        }
    }

    setKeyAStatus (isPressed) {
        if (isPressed) {
            this.#kstat = this.#kstat | KEY_MASK_A;
        } else {
            this.#kstat = this.#kstat & ~(KEY_MASK_A);
        }
    }

    setKeyBStatus (isPressed) {
        if (isPressed) {
            this.#kstat = this.#kstat | KEY_MASK_B;
        } else {
            this.#kstat = this.#kstat & ~(KEY_MASK_B);
        }
    }

    isExited () {
        return this.#exited;
    }
}
