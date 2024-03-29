# VGP 定义

## 程序需提供

* void vinit(void)

初始化方法，程序启动会被调用一次

* void vloop(void)

主循环，会被反复调用

## 运行时环境

* int32 get_feature(int32 feature_id)

(返回值对齐 bit 0, 即最右边是最后一个数据, MSB。不支持特性一律返回INT32_MIN，即 –2147483648)

| feature id | return | note |
|:----:|:----:|:----:|
| 0x00 | 12bit宽，12bit高 | 获取屏幕大小(必须支持) |
| 0x01 | 1:mvlsb，2:gs8 | 获取屏幕颜色格式(必须支持) |
| 0x02 | 1:是，0:否 | 是否支持gamepad输入 |
| 0x03 | >0:是且最大容量为返回值，<=0:否 | 是否支持SAV存档 |
| 0x04 | 1:是，0:否 | 是否支持RTC时间 |

* int32 call0(int32 function_id)

* int32 call1(int32 function_id, int32 param1)

* int32 call2(int32 function_id, int32 param1, int32 param2)

* int32 call3(int32 function_id, int32 param1, int32 param2, int32 param3)

* int32 call4(int32 function_id, int32 param1, int32 param2, int32 param3, int32 param4)

## Feature集合

所有Feature里的方法都是通过call[n]方法来调用的。

### Features Must Have 0x0001

* void update_screen_buffer(uint8 *buffer_p)

  更新屏幕内容，buffer需要足够大以放下整个屏幕

  vinit()和vloop()调用结束时才会真正刷新屏幕

  - buffer_p: 指向wasm内存中屏幕缓冲区的指针

* int32 cpu_ticks_ms(void)

  获取不精确的CPU时间，单位ms，超过INT32_MAX之后从0开始，适用循环相减法判断时间差

* void trace_put_char(int8 ascii_byte)

  输出一个ascii字符到控制台

* void system_exit(void)

  退出程序

### Feature Gamepad 0x0002

* uint32 gamepad_status(void)

  返回游戏手柄按键状态，直到下一次vloop()被调用之前，该函数获取到的状态不会改变

  返回值按照MSB编码，高位在左边，低位在右边，对应位1表示按下，0表示松开

  - bit5: 按键上
  - bit4: 按键下
  - bit3: 按键左
  - bit2: 按键右
  - bit1: 按键A
  - bit0: 按键B

### Feature Save 0x0003

* void save_write(uint32 offset, uint8 byte)

  写入1字节存档，在调用save_flush()之前，所有存档更改不会被写入存储设备

* void save_flush(void)

  将存档更改写入存储设备

* uint8 save_read(uint32 offset)

  读取1字节存档，写入之后立刻就能读取到，无论是否写入存储设备

### Feature Real Time Clock 0x0004

真实时间计算公式为: 时间 = ((offset & 0x7FFFFF) << 32) | (rtc & 0xFFFFFF)

* uint32 rtc_get_h32(void)

  获取RTC的秒数高32位，符号位忽略

* void rtc_set_h32(uint32 value)

  设置RTC的秒数高32位，符号位忽略

* uint32 rtc_get_l32(void)

  获取RTC的秒数低32位，符号位忽略

* void rtc_set_l32(uint32 value)

  设置RTC的秒数低32位，符号位忽略

# VGP 方法列表
| feature set | function id | function name |
|:----:|:----:|:----:|
| 0x0001 | 0x000100 | update_screen_buffer |
| 0x0001 | 0x000101 | cpu_ticks_ms |
| 0x0001 | 0x000102 | trace_put_char |
| 0x0001 | 0x000103 | system_exit |
| ------ | -------- | -------- |
| 0x0002 | 0x000200 | gamepad_status |
| ------ | -------- | -------- |
| 0x0003 | 0x000300 | save_write |
| 0x0003 | 0x000301 | save_flush |
| 0x0003 | 0x000302 | save_read |
| ------ | -------- | -------- |
| 0x0004 | 0x000400 | rtc_get_h32 |
| 0x0004 | 0x000401 | rtc_set_h32 |
| 0x0004 | 0x000402 | rtc_get_l32 |
| 0x0004 | 0x000403 | rtc_set_l32 |

# 参考资料

* https://dassur.ma/things/c-to-webassembly/
