// The entry file of your WebAssembly module.
import { commit_save, log, read_save, scr_pixel, scr_refresh, write_save } from "./env";

export function vinit(): void {
  const arr = new Uint8Array(1024);
  arr.forEach((num) => {
    num += 1;
  });
  log("Hello!");
  // console.log("init");
  scr_pixel(0, 0, 1);
  scr_pixel(127, 63, 1);
  scr_refresh();
  const x:i32 = read_save(4095)
  log("value: "+x.toString());
  write_save(4095, x+1);
  commit_save();
}

export function vloop_once(): void {
  // console.log("vloop_once");
  // log(kpd_query().toString());
  scr_pixel(0, 0, 1);
  scr_pixel(127, 63, 1);
  scr_refresh();
}
