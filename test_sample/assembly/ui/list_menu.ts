import {
    get_screen_width,
    get_screen_height,
    fill_rect,
    draw_center_text,
} from "../lib/bwscreen";
import {
    get_gamepad_event,
    GP_EVENT_PRESSED,
    KEY_MASK_A,
    KEY_MASK_B,
    KEY_MASK_DOWN,
    KEY_MASK_LEFT,
    KEY_MASK_RIGHT,
    KEY_MASK_UP
} from "../lib/gamepad";

const LH = 10; // Line Height

export class UIListMenu {
    title: string = "";
    items: Array<string> = [];
    cursor: i32 = 0;
    actionKey: i32 = 0;

    constructor (title: string, items: Array<string>) {
        this.title = title;
        this.items = items;
    }

    setSelection(pos: i32): void {
        this.cursor = pos % (this.items.length);
    }

    getSelection(): i32 {
        return this.cursor;
    }

    getSelectionItem(): string {
        return this.items.at(this.cursor);
    }

    getActionKey(): i32 {
        return this.actionKey;
    }

    render(): void {
        // render start
        const scrW: i32 = get_screen_width();
        const scrH: i32 = get_screen_height();
        const lineCount: i32 = (Math.floor(scrH / LH) - 1) as i32; // reserve space for title
        let offsetY: i32 = (Math.floor((scrH - ((lineCount + 1) * LH)) / 2) + LH) as i32;
        const pageOffset: i32 = this.cursor - (this.cursor % LH);
        // draw title
        fill_rect(0, 0, scrW, offsetY, 0);
        fill_rect(1, 1, 2, offsetY - 2, 1);
        fill_rect(scrW - 3, 1, 2, offsetY - 2, 1);
        draw_center_text(this.title, 4, 0, scrW - 8, offsetY, 1);
        // draw items
        for (let i = 0; i < lineCount; i++) {
            const itemId = i + pageOffset;
            if (itemId === this.cursor) {
                fill_rect(0, offsetY, scrW, LH, 1);
                draw_center_text(this.items.at(itemId), 0, offsetY, scrW, LH, 0);
            } else {
                if (itemId < this.items.length) {
                    fill_rect(0, offsetY, scrW, LH, 0);
                    draw_center_text(this.items.at(itemId), 0, offsetY, scrW, LH, 1);
                } else {
                    fill_rect(0, offsetY, scrW, LH, 0);
                }
            }
            offsetY += LH;
        }
        if (offsetY < scrH) {
            fill_rect(0, offsetY, scrW, scrH - offsetY, 0);
        }
    }

    /**
     * queryUserInput
     * @returns true if user take an action (A or B is pressed)
     */
    queryUserInput(): bool {
        const event: i32 = get_gamepad_event();
        const eType = (event >> 16) & 0x7F;
        const eKey = event & 0xFF;
        if (eType === GP_EVENT_PRESSED) {
            switch (eKey) {
                case KEY_MASK_UP:
                case KEY_MASK_LEFT:
                    this.cursor = (this.cursor - 1 + this.items.length) % (this.items.length);
                    this.render();
                    break;
                case KEY_MASK_DOWN:
                case KEY_MASK_RIGHT:
                    this.cursor = (this.cursor + 1) % (this.items.length);
                    this.render();
                    break;
                case KEY_MASK_A:
                case KEY_MASK_B:
                    this.actionKey = eKey;
                    return true;
                default: break;
            }
        }
        return false;
    }

}
