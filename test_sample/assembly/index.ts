// The entry file of your WebAssembly module.
import {
  getFeature,
  cpu_ticks_ms,
  ticks_diff,
} from "./env.ts";
import {
  fill_screen,
  get_screen_height,
  get_screen_width,
  screen_init,
} from "./bwscreen.ts";

let SCRW: i32 = 0;
let SCRH: i32 = 0;

export function vinit(): void {
  const stime: i32 = cpu_ticks_ms();
  screen_init();
  SCRW = get_screen_width();
  SCRH = get_screen_height();
  console.log(`Screen Width: ${SCRW}`);
  console.log(`Screen Height: ${SCRH}`);
  let i = 0;
  while (i < 999999) {
    i++;
  }
  fill_screen(1);
  const etime: i32 = cpu_ticks_ms();
  console.log(`number: ${i}`);
  console.log(`inited. CPU time: ${ticks_diff(etime, stime)} ms`);
}

export function vloop(): void {
  // console.log("vloop");
  // console.log("filling screen...");
  // abort();
}
