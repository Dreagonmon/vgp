// The entry file of your WebAssembly module.
import {
  show,
  screen_init,
} from "./lib/bwscreen";
import {
  gamepad_available,
} from "./lib/gamepad";
import { mainLoop, pushUI } from "./ui/context";
import { UISlashScreen } from "./ui/slash_screen";

export function vinit(): void {
  screen_init();
  const support_gamepad: bool = gamepad_available();
  console.log(`Gamepad: ${support_gamepad ? "support" : "not support" }`);
  pushUI(new UISlashScreen());
  show();
}

export function vloop(): void {
  mainLoop();
}
