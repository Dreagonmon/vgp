export declare function get_extra_feature(): i32;
export declare function put_ch(ch: i32): void;
export declare function ticks_ms(): i32;
export declare function scr_pixel(x: i32, y: i32, color: i32): void;
export declare function scr_refresh(): void;
export declare function kpd_query(): i32;
export declare function read_save(offset: i32): i32;
export declare function write_save(offset: i32, byte: i32): void;
export declare function commit_save(): void;

export const log = (text: string): void => {
    let index: i32 = 0;
    while (index < text.length) {
        put_ch(text.charCodeAt(index) & 0xFF);
        index ++;
    }
    put_ch(0x0A);
};
