// The entry file of your WebAssembly module.
import { getFeature, VFEATURE_SCREEN_SIZE } from "./env.ts";

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
  updateScreenSize();
  console.log(`Screen Width: ${SCRW}`);
  console.log(`Screen Height: ${SCRH}`);
  console.log("inited.");
}

export function vloop(): void {
  // console.log("vloop");
}
