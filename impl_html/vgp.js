
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

export class VirtualGamePocket {
    #scrw = 0; // screen width
    #scrh = 0; // screen height
    #savcap = 0; // save capacity
    #pscale = 1; // pixel scale mod
    #pofmod = 0; // pixel offset mod
    #pszmod = 0; // pixel size mod
    /** @type {HTMLElement} */
    #pelem = null; // print element
    /** @type {Array<string>} */
    #phis = []; // print history
    /** @type {Array<string>} */
    #pcline = []; // print current line
    /** @type {HTMLCanvasElement} */
    #ofscvs = null; // off screen canvas
    /** @type {HTMLCanvasElement} */
    #dspcvs = null; // display canvas
    /** @type {Uint8Array} */
    #dspbuf = null; // display buffer
    #dspbufdty = false; // display buffer is dirty
    #name = "VGP"; // name used for prefix
    /** @type {Uint8Array} */
    #savbuf = null; // save buffer
    #exited = false; // exit flag
    /** @type {WebAssembly.Instance} */
    #wasm = null; // wasm instance
    /** @type {WebAssembly.Memory} */
    #mem = null; // wasm memory
    #kstat = 0; // key status
    constructor (screenWidth = 128, screenHeight = 64, saveCapacity = 8192, pixelScale = 8, pixelOffsetMod = 1, pixelSizeMod = -2) {
        this.#scrw = screenWidth;
        this.#scrh = screenHeight;
        this.#savcap = saveCapacity;
        this.#pscale = pixelScale;
        this.#pofmod = pixelOffsetMod;
        this.#pszmod = pixelSizeMod;
        this.#ofscvs = document.createElement("canvas");
        this.#ofscvs.width = this.#scrw * this.#pscale;
        this.#ofscvs.height = this.#scrh * this.#pscale;
        this.#dspbuf = new Uint8Array(this.#scrw * (Math.ceil(this.#scrh / 8)));
        this.#mem = new WebAssembly.Memory({ initial: 1, maximum: undefined });
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

    bindPrintElement (elem) {
        this.#pelem = elem;
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
                // return this.#savcap;
                return 0;
            case VFEATURE_RTC_SUPPORT:
                // return TRUE;
                return FALSE;
            default: return INT32_MIN;
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

    #impl_call0 (function_id) {
        switch (feature_id) {
            case VFUNC_SYSTEM_EXIT:
                this.#exited = true;
                return 0;
            case VFUNC_CPU_TICKS_MS:
                return Math.floor(Date.now()) & INT32_MAX;
            case VFUNC_GAMEPAD_STATUS:
                return this.#kstat;
            default: return 0;
        }
    }

    #impl_call1 (function_id, p1) {
        switch (feature_id) {
            case VFUNC_UPDATE_SCREEN_BUFFER:
                const mem = this.#getMemoryBuffer();
                if (mem) {
                    const mem8 = new Uint8Array(mem.buffer);
                    const memSize = mem8.byteLength;
                    const remainSize = memSize - p1;
                    if (p1 < 0 || remainSize < this.#dspbuf.length) {
                        this.#putError("Display Buffer Pointer Out of Range.");
                        this.#exited = true;
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
            default: return 0;
        }
    }

    #makeImportObject () {
        return {
            env: {
                memory: this.#mem,
                get_feature: this.#impl_get_feature.bind(this),
                call0: this.#impl_call0.bind(this),
                call1: this.#impl_call1.bind(this),
                call2: (f, p1, p2) => 0,
                call3: (f, p1, p2, p3) => 0,
                call4: (f, p1, p2, p3, p4) => 0,
            },
        };
    }

    async load (buffer, name) {
        await WebAssembly.instantiate(buffer, this.#makeImportObject());
        this.#name = name;
    }

    async loadStream (stream, name) {
        await WebAssembly.instantiateStreaming(stream, this.#makeImportObject());
        this.#name = name;
    }
}
