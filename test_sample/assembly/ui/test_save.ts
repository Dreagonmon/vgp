import {
    cpu_ticks_ms
} from "../lib/env";
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
    save_available,
    get_save_capacity,
    save_write,
    save_flush,
    save_read,
} from "../lib/save";

const BATCH_SIZE: i32 = 1024;

export class UITestSave extends UIContext {
    showingDialog: bool = false;
    uiMenu: UIListMenu;

    constructor () {
        super();
        this.uiMenu = new UIListMenu("Save", [
            "Write Last",
            "Commit",
            "Read Last",
            "TEST RW",
            "Exit",
        ]);
    }

    dialog(text: string): void {
        this.showingDialog = true;
        full_screen_text(text);
    }

    onEnter(): void {
        if (!save_available()) {
            this.dialog("SAVE\nNot Supported");
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
                        if (!save_available()) {
                            popUI();
                        }
                    default: break;
                }
            }
        } else {
            if (this.uiMenu.queryUserInput() && this.uiMenu.getActionKey() === KEY_MASK_A) {
                const item = this.uiMenu.getSelectionItem();
                if (item === "Write Last") {
                    const value: u8 = (cpu_ticks_ms() & 0xFF) as u8;
                    const pos: i32 = get_save_capacity() - 1;
                    save_write(pos, value);
                    this.dialog(`${value}\n\nto addr\n\n#${pos}`);
                } else if (item === "Commit") {
                    save_flush();
                    this.dialog("Save commited");
                } else if (item === "Read Last") {
                    const pos: i32 = get_save_capacity() - 1;
                    const value: u8 = save_read(pos);
                    this.dialog(`${value}\n\nat addr\n\n#${pos}`);
                } else if (item === "TEST RW") {
                    const save_capacity: i32 = get_save_capacity();
                    const baseNumber: u8 = (cpu_ticks_ms() & 0xFF) as u8;
                    let passed: bool = true;
                    // write to save
                    let currentNumber: i32 = baseNumber;
                    for (let offset = 0; offset < get_save_capacity(); offset++) {
                        save_write(offset, (currentNumber as u8));
                        currentNumber += 1;
                        currentNumber = currentNumber & 0xFF;
                    }
                    // read from save
                    currentNumber = baseNumber;
                    for (let offset = 0; offset < get_save_capacity(); offset++) {
                        const value = save_read(offset);
                        if (value != currentNumber) {
                            passed = false;
                            this.dialog(`${value}\n\nat #${offset},\nexpect ${currentNumber}`);
                            break;
                        }
                        currentNumber += 1;
                        currentNumber = currentNumber & 0xFF;
                    }
                    if (passed) {
                        this.dialog(`Test Passed`);
                    }
                } else if (item === "Exit") {
                    popUI();
                }
            }
        }
    }
}