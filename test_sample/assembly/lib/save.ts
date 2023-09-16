import {
    VFEATURE_SAVE_CAPACITY,
    get_feature,
    save_write as _write,
    save_read as _read,
    save_flush as _flush,
} from "./env";

export const save_available = (): bool => {
    return get_feature(VFEATURE_SAVE_CAPACITY) > 0;
};

export const get_save_capacity = (): i32 => {
    return get_feature(VFEATURE_SAVE_CAPACITY);
};

export const save_write = (offset: i32, byte: u8): void => {
    _write(offset, byte);
};

export const save_flush = (): void => {
    _flush();
};

export const save_read = (offset: i32): u8 => {
    return (_read(offset) & 0xFF) as u8;
}
