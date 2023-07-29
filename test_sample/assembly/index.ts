// The entry file of your WebAssembly module.
import { getFeature } from "./env.ts";

export function vinit(): void {
  const arr = new Uint8Array(1024);
  arr.forEach((num) => {
    num += 1;
  });
  let i = 0;
  i += 1;
  if (i == 0) {
    let f = getFeature(0x00);
  }
  // console.log("init");
}

export function vloop(): void {
  // console.log("vloop");
}
