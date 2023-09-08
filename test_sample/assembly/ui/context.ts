import {
    system_exit,
} from "../lib/env";

export class UIContext {
    loop(): void { };
    onEnter(): void { };
}

export const EMPTY_UI_CONTEXT = new UIContext();

const uiStack: Array<UIContext> = new Array();

export const mainLoop = (): void => {
    if (uiStack.length <= 0) {
        console.warn("Empty UI stack.");
        system_exit();
        return;
    }
    uiStack.at(-1).loop();
};

export const pushUI = (ui: UIContext): void => {
    uiStack.push(ui);
    ui.onEnter();
};

export const popUI = (): UIContext => {
    if (uiStack.length > 0) {
        const ctx: UIContext = uiStack.pop();
        if (uiStack.length > 0) {
            uiStack.at(-1).onEnter();
        }
        return ctx;
    }
    return EMPTY_UI_CONTEXT;
};
