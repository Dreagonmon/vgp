import {
    gamepad_available,
    KEY_MASK_A,
} from "../lib/gamepad";
import { full_screen_text } from "../lib/bwscreen";
import { cpu_ticks_ms, ticks_diff } from "../lib/env";
import { UIListMenu } from "./list_menu";
import { UITestGamepad } from "./test_gamepad";
import { UITestSave } from "./test_save";
import { UIContext, pushUI, popUI } from "./context";

export class UIMainMenu extends UIContext {
    isGamepadAvailable: bool = false;
    startTime: i32 = 0;
    uiMenu: UIListMenu;

    constructor () {
        super();
        this.isGamepadAvailable = gamepad_available();
        this.startTime = cpu_ticks_ms();
        this.uiMenu = new UIListMenu("Main Menu", [
            "Gamepad",
            "Save",
            "RTC",
            "Exit",
        ]);
    }

    onEnter(): void {
        if (!this.isGamepadAvailable) {
            console.warn("No Gamepad Available.");
            full_screen_text(`No Gamepad\nAvailable`);
            return;
        }
        this.uiMenu.render();
    }

    loop(): void {
        if (!this.isGamepadAvailable) {
            const now: i32 = cpu_ticks_ms();
            if (ticks_diff(now, this.startTime) > 2000) {
                popUI(); // exit
            }
            return;
        }
        if (this.uiMenu.queryUserInput() && this.uiMenu.getActionKey() === KEY_MASK_A) {
            const item = this.uiMenu.getSelectionItem();
            if (item === "Exit") {
                popUI();
            } else if (item === "Gamepad") {
                pushUI(new UITestGamepad());
            } else if (item === "Save") {
                pushUI(new UITestSave());
            } else if (item === "RTC") {
                //
            }
        }
    }
}