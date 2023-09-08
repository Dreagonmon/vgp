import {
    cpu_ticks_ms,
    ticks_diff,
} from "../lib/env";
import { full_screen_text } from "../lib/bwscreen";
import { UIContext, popUI } from "./context";

export class UISlashScreen extends UIContext {
    startTime: i32 = 0;

    constructor () {
        super();
    }

    onEnter(): void {
        full_screen_text(`Virtual Game\nPocket`);
        this.startTime = cpu_ticks_ms();
    }

    loop(): void {
        const now: i32 = cpu_ticks_ms();
        if (ticks_diff(now, this.startTime) > 2000) {
            popUI();
        }
    }
}
