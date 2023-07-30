// The entry file of your WebAssembly module.
import {
  getFeature,
  cpu_ticks_ms,
  ticks_diff,
  VFEATURE_SCREEN_SIZE,
} from "./env.ts";

let SCRW: u16 = 0;
let SCRH: u16 = 0;
const updateScreenSize = (): void => {
  const data: i32 = getFeature(VFEATURE_SCREEN_SIZE);
  const width: u16 = u16((data >> 12) & 0xFFF);
  const height: u16 = u16(data & 0xFFF);
  SCRW = width;
  SCRH = height;
};

export function vinit(): void {
  const stime: i32 = cpu_ticks_ms()
  updateScreenSize();
  console.log(`Screen Width: ${SCRW}`);
  console.log(`Screen Height: ${SCRH}`);
  let i = 0;
  while (i < 999999) {
    i++;
  }
  const etime: i32 = cpu_ticks_ms()
  console.log(`number: ${i}`);
  console.log(`inited. CPU time: ${ticks_diff(etime, stime)} ms`);
}

export function vloop(): void {
  // console.log("vloop");
}
