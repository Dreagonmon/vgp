// The entry file of your WebAssembly module.
import {
  cpu_ticks_ms,
  ticks_diff,
} from "./lib/env";
import {
  full_screen_text,
  screen_init,
} from "./lib/bwscreen";
import {
  gamepad_available,
} from "./lib/gamepad";
import { mainLoop, pushUI } from "./ui/context";
import { UISlashScreen } from "./ui/slash_screen";

export function vinit(): void {
  const stime: i32 = cpu_ticks_ms();
  let i: i32 = 0;
  while (i < 999999) {
    i++;
  }
  console.log(`Loop ${i} Times`);
  screen_init();
  const support_gamepad: bool = gamepad_available();
  console.log(`Gamepad: ${support_gamepad ? "support" : "not support" }`);
  const etime: i32 = cpu_ticks_ms();
  console.log(`inited. CPU time: ${ticks_diff(etime, stime)} ms`);
  pushUI(new UISlashScreen());
}

export function vloop(): void {
  mainLoop();
}
