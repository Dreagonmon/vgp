// The entry file of your WebAssembly module.
import {
  cpu_ticks_ms,
  ticks_diff,
} from "./env.ts";
import {
  full_screen_text,
  get_screen_height,
  get_screen_width,
  screen_init,
} from "./bwscreen.ts";
import {
  gamepad_available,
  get_gamepad_event,
  GP_EVENT_NONE,
} from "./gamepad.ts";

let SCRW: i32 = 0;
let SCRH: i32 = 0;

export function vinit(): void {
  const stime: i32 = cpu_ticks_ms();
  let i: i32 = 0;
  while (i < 999999) {
    i++;
  }
  console.log(`number: ${i}`);
  screen_init();
  SCRW = get_screen_width();
  SCRH = get_screen_height();
  console.log(`Screen Width: ${SCRW}`);
  console.log(`Screen Height: ${SCRH}`);
  const support_gamepad: bool = gamepad_available();
  console.log(`Gamepad: ${support_gamepad ? "support" : "not support" }`);
  const etime: i32 = cpu_ticks_ms();
  console.log(`inited. CPU time: ${ticks_diff(etime, stime)} ms`);
  full_screen_text(`Virtual Game\nPocket\n\nBoot: ${ticks_diff(etime, stime)}ms`);

}

export function vloop(): void {
  // full_screen_text("Hello\nDragon~");
  let event = get_gamepad_event();
  let event_type = (event >> 16) & 0xFF;
  let event_value = event & 0xFF;
  if (event_type != GP_EVENT_NONE) {
    console.log(`gpevt: ${event_type}, ${event_value}`);
  }
}
