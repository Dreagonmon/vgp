import {
    get_feature,
    VFEATURE_SCREEN_SIZE,
    VFEATURE_SCREEN_COLOR_FORMAT,
    VCOLOR_FORMAT_MVLSB,
    VCOLOR_FORMAT_GS8,
    update_screen_buffer,
} from "./env";

const FONT_PETME128_8X8: u8[] = [
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // 32=
    0x00, 0x00, 0x00, 0x4f, 0x4f, 0x00, 0x00, 0x00, // 33=!
    0x00, 0x07, 0x07, 0x00, 0x00, 0x07, 0x07, 0x00, // 34="
    0x14, 0x7f, 0x7f, 0x14, 0x14, 0x7f, 0x7f, 0x14, // 35=#
    0x00, 0x24, 0x2e, 0x6b, 0x6b, 0x3a, 0x12, 0x00, // 36=$
    0x00, 0x63, 0x33, 0x18, 0x0c, 0x66, 0x63, 0x00, // 37=%
    0x00, 0x32, 0x7f, 0x4d, 0x4d, 0x77, 0x72, 0x50, // 38=&
    0x00, 0x00, 0x00, 0x04, 0x06, 0x03, 0x01, 0x00, // 39='
    0x00, 0x00, 0x1c, 0x3e, 0x63, 0x41, 0x00, 0x00, // 40=(
    0x00, 0x00, 0x41, 0x63, 0x3e, 0x1c, 0x00, 0x00, // 41=)
    0x08, 0x2a, 0x3e, 0x1c, 0x1c, 0x3e, 0x2a, 0x08, // 42=*
    0x00, 0x08, 0x08, 0x3e, 0x3e, 0x08, 0x08, 0x00, // 43=+
    0x00, 0x00, 0x80, 0xe0, 0x60, 0x00, 0x00, 0x00, // 44=,
    0x00, 0x08, 0x08, 0x08, 0x08, 0x08, 0x08, 0x00, // 45=-
    0x00, 0x00, 0x00, 0x60, 0x60, 0x00, 0x00, 0x00, // 46=.
    0x00, 0x40, 0x60, 0x30, 0x18, 0x0c, 0x06, 0x02, // 47=/
    0x00, 0x3e, 0x7f, 0x49, 0x45, 0x7f, 0x3e, 0x00, // 48=0
    0x00, 0x40, 0x44, 0x7f, 0x7f, 0x40, 0x40, 0x00, // 49=1
    0x00, 0x62, 0x73, 0x51, 0x49, 0x4f, 0x46, 0x00, // 50=2
    0x00, 0x22, 0x63, 0x49, 0x49, 0x7f, 0x36, 0x00, // 51=3
    0x00, 0x18, 0x18, 0x14, 0x16, 0x7f, 0x7f, 0x10, // 52=4
    0x00, 0x27, 0x67, 0x45, 0x45, 0x7d, 0x39, 0x00, // 53=5
    0x00, 0x3e, 0x7f, 0x49, 0x49, 0x7b, 0x32, 0x00, // 54=6
    0x00, 0x03, 0x03, 0x79, 0x7d, 0x07, 0x03, 0x00, // 55=7
    0x00, 0x36, 0x7f, 0x49, 0x49, 0x7f, 0x36, 0x00, // 56=8
    0x00, 0x26, 0x6f, 0x49, 0x49, 0x7f, 0x3e, 0x00, // 57=9
    0x00, 0x00, 0x00, 0x24, 0x24, 0x00, 0x00, 0x00, // 58=:
    0x00, 0x00, 0x80, 0xe4, 0x64, 0x00, 0x00, 0x00, // 59=;
    0x00, 0x08, 0x1c, 0x36, 0x63, 0x41, 0x41, 0x00, // 60=<
    0x00, 0x14, 0x14, 0x14, 0x14, 0x14, 0x14, 0x00, // 61==
    0x00, 0x41, 0x41, 0x63, 0x36, 0x1c, 0x08, 0x00, // 62=>
    0x00, 0x02, 0x03, 0x51, 0x59, 0x0f, 0x06, 0x00, // 63=?
    0x00, 0x3e, 0x7f, 0x41, 0x4d, 0x4f, 0x2e, 0x00, // 64=@
    0x00, 0x7c, 0x7e, 0x0b, 0x0b, 0x7e, 0x7c, 0x00, // 65=A
    0x00, 0x7f, 0x7f, 0x49, 0x49, 0x7f, 0x36, 0x00, // 66=B
    0x00, 0x3e, 0x7f, 0x41, 0x41, 0x63, 0x22, 0x00, // 67=C
    0x00, 0x7f, 0x7f, 0x41, 0x63, 0x3e, 0x1c, 0x00, // 68=D
    0x00, 0x7f, 0x7f, 0x49, 0x49, 0x41, 0x41, 0x00, // 69=E
    0x00, 0x7f, 0x7f, 0x09, 0x09, 0x01, 0x01, 0x00, // 70=F
    0x00, 0x3e, 0x7f, 0x41, 0x49, 0x7b, 0x3a, 0x00, // 71=G
    0x00, 0x7f, 0x7f, 0x08, 0x08, 0x7f, 0x7f, 0x00, // 72=H
    0x00, 0x00, 0x41, 0x7f, 0x7f, 0x41, 0x00, 0x00, // 73=I
    0x00, 0x20, 0x60, 0x41, 0x7f, 0x3f, 0x01, 0x00, // 74=J
    0x00, 0x7f, 0x7f, 0x1c, 0x36, 0x63, 0x41, 0x00, // 75=K
    0x00, 0x7f, 0x7f, 0x40, 0x40, 0x40, 0x40, 0x00, // 76=L
    0x00, 0x7f, 0x7f, 0x06, 0x0c, 0x06, 0x7f, 0x7f, // 77=M
    0x00, 0x7f, 0x7f, 0x0e, 0x1c, 0x7f, 0x7f, 0x00, // 78=N
    0x00, 0x3e, 0x7f, 0x41, 0x41, 0x7f, 0x3e, 0x00, // 79=O
    0x00, 0x7f, 0x7f, 0x09, 0x09, 0x0f, 0x06, 0x00, // 80=P
    0x00, 0x1e, 0x3f, 0x21, 0x61, 0x7f, 0x5e, 0x00, // 81=Q
    0x00, 0x7f, 0x7f, 0x19, 0x39, 0x6f, 0x46, 0x00, // 82=R
    0x00, 0x26, 0x6f, 0x49, 0x49, 0x7b, 0x32, 0x00, // 83=S
    0x00, 0x01, 0x01, 0x7f, 0x7f, 0x01, 0x01, 0x00, // 84=T
    0x00, 0x3f, 0x7f, 0x40, 0x40, 0x7f, 0x3f, 0x00, // 85=U
    0x00, 0x1f, 0x3f, 0x60, 0x60, 0x3f, 0x1f, 0x00, // 86=V
    0x00, 0x7f, 0x7f, 0x30, 0x18, 0x30, 0x7f, 0x7f, // 87=W
    0x00, 0x63, 0x77, 0x1c, 0x1c, 0x77, 0x63, 0x00, // 88=X
    0x00, 0x07, 0x0f, 0x78, 0x78, 0x0f, 0x07, 0x00, // 89=Y
    0x00, 0x61, 0x71, 0x59, 0x4d, 0x47, 0x43, 0x00, // 90=Z
    0x00, 0x00, 0x7f, 0x7f, 0x41, 0x41, 0x00, 0x00, // 91=[
    0x00, 0x02, 0x06, 0x0c, 0x18, 0x30, 0x60, 0x40, // 92='\'
    0x00, 0x00, 0x41, 0x41, 0x7f, 0x7f, 0x00, 0x00, // 93=]
    0x00, 0x08, 0x0c, 0x06, 0x06, 0x0c, 0x08, 0x00, // 94=^
    0xc0, 0xc0, 0xc0, 0xc0, 0xc0, 0xc0, 0xc0, 0xc0, // 95=_
    0x00, 0x00, 0x01, 0x03, 0x06, 0x04, 0x00, 0x00, // 96=`
    0x00, 0x20, 0x74, 0x54, 0x54, 0x7c, 0x78, 0x00, // 97=a
    0x00, 0x7f, 0x7f, 0x44, 0x44, 0x7c, 0x38, 0x00, // 98=b
    0x00, 0x38, 0x7c, 0x44, 0x44, 0x6c, 0x28, 0x00, // 99=c
    0x00, 0x38, 0x7c, 0x44, 0x44, 0x7f, 0x7f, 0x00, // 100=d
    0x00, 0x38, 0x7c, 0x54, 0x54, 0x5c, 0x58, 0x00, // 101=e
    0x00, 0x08, 0x7e, 0x7f, 0x09, 0x03, 0x02, 0x00, // 102=f
    0x00, 0x98, 0xbc, 0xa4, 0xa4, 0xfc, 0x7c, 0x00, // 103=g
    0x00, 0x7f, 0x7f, 0x04, 0x04, 0x7c, 0x78, 0x00, // 104=h
    0x00, 0x00, 0x00, 0x7d, 0x7d, 0x00, 0x00, 0x00, // 105=i
    0x00, 0x40, 0xc0, 0x80, 0x80, 0xfd, 0x7d, 0x00, // 106=j
    0x00, 0x7f, 0x7f, 0x30, 0x38, 0x6c, 0x44, 0x00, // 107=k
    0x00, 0x00, 0x41, 0x7f, 0x7f, 0x40, 0x00, 0x00, // 108=l
    0x00, 0x7c, 0x7c, 0x18, 0x30, 0x18, 0x7c, 0x7c, // 109=m
    0x00, 0x7c, 0x7c, 0x04, 0x04, 0x7c, 0x78, 0x00, // 110=n
    0x00, 0x38, 0x7c, 0x44, 0x44, 0x7c, 0x38, 0x00, // 111=o
    0x00, 0xfc, 0xfc, 0x24, 0x24, 0x3c, 0x18, 0x00, // 112=p
    0x00, 0x18, 0x3c, 0x24, 0x24, 0xfc, 0xfc, 0x00, // 113=q
    0x00, 0x7c, 0x7c, 0x04, 0x04, 0x0c, 0x08, 0x00, // 114=r
    0x00, 0x48, 0x5c, 0x54, 0x54, 0x74, 0x20, 0x00, // 115=s
    0x04, 0x04, 0x3f, 0x7f, 0x44, 0x64, 0x20, 0x00, // 116=t
    0x00, 0x3c, 0x7c, 0x40, 0x40, 0x7c, 0x3c, 0x00, // 117=u
    0x00, 0x1c, 0x3c, 0x60, 0x60, 0x3c, 0x1c, 0x00, // 118=v
    0x00, 0x1c, 0x7c, 0x30, 0x18, 0x30, 0x7c, 0x1c, // 119=w
    0x00, 0x44, 0x6c, 0x38, 0x38, 0x6c, 0x44, 0x00, // 120=x
    0x00, 0x9c, 0xbc, 0xa0, 0xa0, 0xfc, 0x7c, 0x00, // 121=y
    0x00, 0x44, 0x64, 0x74, 0x5c, 0x4c, 0x44, 0x00, // 122=z
    0x00, 0x08, 0x08, 0x3e, 0x77, 0x41, 0x41, 0x00, // 123={
    0x00, 0x00, 0x00, 0xff, 0xff, 0x00, 0x00, 0x00, // 124=|
    0x00, 0x41, 0x41, 0x77, 0x3e, 0x08, 0x08, 0x00, // 125=}
    0x00, 0x02, 0x03, 0x01, 0x03, 0x02, 0x03, 0x01, // 126=~
    0xaa, 0x55, 0xaa, 0x55, 0xaa, 0x55, 0xaa, 0x55, // 127
];

let SCRW: i32 = 0;
let SCRH: i32 = 0;
let SFMT: i32 = 0;
let WHITE: i32 = 0xFF;
let BUFFER: usize = 0;
const BLACK: i32 = 0;

let screen_pixel: (x: i32, y: i32, c: i32) => void = (x, y, c) => {};

const screen_pixel_mvlsb = (x: i32, y: i32, c: i32): void => {
    const index: u32 = (y >> 3) * SCRW + x;
    const offset: u8 = (y & 0x07) as u8;
    const nValue: u8 = (load<u8>(BUFFER + index) & ~(0x01 << offset)) | ((c & 1) << offset) as u8;
    store<u8>(BUFFER + index, nValue);
};

const screen_pixel_gs8 = (x: i32, y: i32, c: i32): void => {
    const index: u32 = y * SCRW + x;
    store<u8>(BUFFER + index, (c & 0xFF) as u32 as u8 );
};

export const screen_init = (): void => {
    const data: i32 = get_feature(VFEATURE_SCREEN_SIZE);
    const width: i32 = (data >> 12) & 0xFFF;
    const height: i32 = data & 0xFFF;
    SCRW = width;
    SCRH = height;
    const SFMT: i32 = get_feature(VFEATURE_SCREEN_COLOR_FORMAT);
    if (SFMT === VCOLOR_FORMAT_MVLSB) {
        WHITE = 1;
        console.log(`Screen Color: BlackWhite`);
        let yPage: i32 = (SCRH / 8) as i32;
        if (SCRH % 8 > 0) {
            yPage += 1;
        }
        const bsize: usize = (SCRW * yPage) as usize;
        BUFFER = heap.alloc(bsize);
        screen_pixel = screen_pixel_mvlsb;
    } else if (SFMT === VCOLOR_FORMAT_GS8) {
        WHITE = 0xFF;
        console.log(`Screen Width: GS8`);
        BUFFER = heap.alloc(SCRW * SCRH);
        screen_pixel = screen_pixel_gs8;
    }
    console.log(`Screen Width: ${SCRW}`);
    console.log(`Screen Height: ${SCRH}`);
};

export const get_screen_width = (): i32 => SCRW;

export const get_screen_height = (): i32 => SCRH;

export const pixel = (areaX: i32, areaY: i32, color: i32): void => {
    const c: i32 = color > 0 ? WHITE : BLACK;
    screen_pixel(areaX, areaY, c);
};

export const fill_rect = (areaX: i32, areaY: i32, areaW: i32, areaH: i32, color: i32): void => {
    const c: i32 = color > 0 ? WHITE : BLACK;
    const endX = areaX + areaW;
    const endY = areaY + areaH;
    for (let x: i32 = areaX; x < endX; x++) {
        for (let y: i32 = areaY; y < endY; y++) {
            screen_pixel(x, y, c);
        }
    }
};

export const fill_screen = (color: i32): void => {
    fill_rect(0, 0, SCRW, SCRH, color);
};


export const draw_char_8x8 = (chr: i32, x0: i32, y0: i32, color: i32): void => {
    const c: i32 = color > 0 ? WHITE : BLACK;
    if (chr < 32 || chr > 127) {
        chr = 127;
    }
    // get char data
    const chr_data_offset: i32 = (chr - 32) * 8;
    // loop over char data
    for (let j: i32 = 0; j < 8; j++) {
        if (0 <= x0 && x0 < SCRW) { // clip x
            let vline_data: u8 = FONT_PETME128_8X8[ chr_data_offset + j ]; // each byte is a column of 8 pixels, LSB at top
            for (let y: i32 = y0; vline_data > 0; y++) { // scan over vertical column
                if (vline_data & 1) { // only draw if pixel set
                    if (0 <= y && y < SCRH) { // clip y
                        screen_pixel(x0, y, c);
                    }
                }
                vline_data >>= 1;
            }
        }
        x0++;
    }
};

export const draw_text_8x8 = (text: string, x: i32, y: i32, color: i32): void => {
    for (let p: i32 = 0; p < text.length; p++) {
        draw_char_8x8(text.charCodeAt(p), x, y, color);
        x += 8;
    }
};

export const draw_center_text = (text: string, areaX: i32, areaY: i32, areaW: i32, areaH: i32, color: i32): void => {
    const lines = text.split("\n");
    let offy: i32 = (areaH - (lines.length * 8)) / 2 + areaY;
    for (let l: i32 = 0; l < lines.length; l++) {
        const line = lines[ l ].trim();
        const offx = (areaW - (line.length * 8)) / 2 + areaX;
        draw_text_8x8(line, offx, offy, color);
        offy += 8;
    }
};

export const show = (): void => {
    update_screen_buffer(BUFFER as u32 as i32);
}

export const full_screen_text = (text: string): void => {
    fill_screen(BLACK);
    draw_center_text(text, 0, 0, SCRW, SCRH, WHITE);
    show();
};
