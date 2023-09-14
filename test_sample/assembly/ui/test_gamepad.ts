import { UIContext, popUI } from "./context";
import { full_screen_text } from "../lib/bwscreen";
import {
    get_gamepad_event,
    GP_EVENT_NONE,
    GP_EVENT_PRESSED,
    GP_EVENT_RELEASED,
    KEY_MASK_A,
    KEY_MASK_B,
    KEY_MASK_DOWN,
    KEY_MASK_LEFT,
    KEY_MASK_RIGHT,
    KEY_MASK_UP
} from "../lib/gamepad";

const mapEventName = (evt: i32): string => {
    switch (evt) {
        case GP_EVENT_PRESSED: return "Pressed"
        case GP_EVENT_RELEASED: return "Released"
        default: return "Unknown";
    }
}

const mapKeyName = (key: i32): string => {
    switch (key) {
        case KEY_MASK_A: return "A"
        case KEY_MASK_B: return "B"
        case KEY_MASK_UP: return "UP"
        case KEY_MASK_DOWN: return "DOWN"
        case KEY_MASK_LEFT: return "LEFT"
        case KEY_MASK_RIGHT: return "RIGHT"
        default: return "Unknown";
    }
}

export class UITestGamepad extends UIContext {
    pressedCount: i32 = -1;

    constructor () {
        super();
        //
    }

    onEnter(): void {
        full_screen_text("Press B\nfor 10 times\nEXIT")
    }

    loop(): void {
        const event: i32 = get_gamepad_event();
        const eType: i32 = (event >> 16) & 0x7F;
        const eKey: i32 = event & 0xFF;
        if (eType === GP_EVENT_RELEASED && this.pressedCount < 0) {
            // ignore first key release event
            this.pressedCount = 0;
            return;
        }
        if (eType !== GP_EVENT_NONE) {
            full_screen_text(`${mapKeyName(eKey)}\n\n${mapEventName(eType)}`);
            if (eType === GP_EVENT_PRESSED && eKey === KEY_MASK_B) {
                this.pressedCount += 1;
                if (this.pressedCount >= 10) {
                    popUI();
                }
            }
            if (eKey !== KEY_MASK_B) {
                this.pressedCount = 0;
            }
        }
    }
}
