import { UIContext, popUI } from "./context";
import { UIListMenu } from "./list_menu";
import {
    get_gamepad_event,
    GP_EVENT_PRESSED,
    KEY_MASK_A,
    KEY_MASK_B,
} from "../lib/gamepad";
import { full_screen_text } from "../lib/bwscreen";
import {
    rtc_available,
    rtc_get,
    rtc_set,
} from "../lib/rtc";

const BATCH_SIZE: i32 = 1024;

export class UITestRTC extends UIContext {
    showingDialog: bool = false;
    uiMenu: UIListMenu;

    constructor () {
        super();
        this.uiMenu = new UIListMenu("RTC", [
            "Now",
            "+1 Hour",
            "-1 Hour",
            "Exit",
        ]);
    }

    dialog(text: string): void {
        this.showingDialog = true;
        full_screen_text(text);
    }

    onEnter(): void {
        if (!rtc_available()) {
            this.dialog("RTC\nNot Supported");
        } else {
            this.uiMenu.render();
        }
    }

    loop(): void {
        if (this.showingDialog) {
            const event: i32 = get_gamepad_event();
            const eType = (event >> 16) & 0x7F;
            const eKey = event & 0xFF;
            if (eType === GP_EVENT_PRESSED) {
                switch (eKey) {
                    case KEY_MASK_A:
                    case KEY_MASK_B:
                        this.showingDialog = false;
                        this.uiMenu.render();
                        if (!rtc_available()) {
                            popUI();
                        }
                    default: break;
                }
            }
        } else {
            if (this.uiMenu.queryUserInput() && this.uiMenu.getActionKey() === KEY_MASK_A) {
                const item = this.uiMenu.getSelectionItem();
                if (item === "Now") {
                    const now: i64 = rtc_get();
                    const date = new Date(now * 1000);
                    const dateText = `${date.getUTCFullYear()}/${date.getUTCMonth()+1}/${date.getUTCDate()}`;
                    const timeText = `${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}`;
                    this.dialog(`UTC\n${dateText}\n${timeText}`);
                } else if (item === "+1 Hour") {
                    const now: i64 = rtc_get();
                    const date = new Date(now * 1000);
                    date.setUTCHours((date.getUTCHours() + 1) % 24);
                    rtc_set((date.getTime() / 1000) as i64);
                    const dateText = `${date.getUTCFullYear()}/${date.getUTCMonth()+1}/${date.getUTCDate()}`;
                    const timeText = `${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}`;
                    this.dialog(`UTC\n${dateText}\n${timeText}`);
                } else if (item === "-1 Hour") {
                    const now: i64 = rtc_get();
                    const date = new Date(now * 1000);
                    date.setUTCHours((date.getUTCHours() + 24 - 1) % 24);
                    rtc_set((date.getTime() / 1000) as i64);
                    const dateText = `${date.getUTCFullYear()}/${date.getUTCMonth()+1}/${date.getUTCDate()}`;
                    const timeText = `${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}`;
                    this.dialog(`UTC\n${dateText}\n${timeText}`);
                } else if (item === "Exit") {
                    popUI();
                }
            }
        }
    }
}