BUILD = build
TARGET_NAME = test
TARGET_WAT = $(BUILD)/$(TARGET_NAME).wat
TARGET_WASM = $(BUILD)/$(TARGET_NAME).wasm

CC = clang
LD = wasm-ld
WASM2WAT = wasm2wat
SIZE = llvm-size
ECHO = echo

# SRC += $(wildcard *.c littlefs/*.c)
SRC += $(wildcard *.c)
SRC += $(wildcard env/*.c)
SRC += $(wildcard libc/*.c)
SRC += $(wildcard libc/math/*.c)
SRC += $(wildcard libc/ctype/*.c)
SRC += $(wildcard libc/string/*.c)
SRC += $(wildcard libc/stdlib/*.c)
SRC += $(wildcard libc/umm_malloc/*.c)
SRC += $(wildcard libc/xprintf/*.c)
SRC += $(wildcard time/*.c)
SRC += $(wildcard gamepad/*.c)
SRC += $(wildcard graphic/*.c)
OBJ := $(SRC:%.c=$(BUILD)/%.o)

# target
CFLAGS += --target=wasm32
CFLAGS += -std=gnu17 -Wall
CFLAGS += -nostdlib
CFLAGS += -fvisibility=hidden
CFLAGS += -ffunction-sections
CFLAGS += -fdata-sections
CFLAGS += -flto
CFLAGS += -foptimize-sibling-calls
# wasm3 support features
# CFLAGS += -mmutable-globals
# CFLAGS += -mnontrapping-fptoint
# CFLAGS += -msign-ext
# CFLAGS += -mmultivalue
CFLAGS += -mbulk-memory
# opt
ifdef DEBUG
CFLAGS += -O0 -g3
else
CFLAGS += -Os
endif
# include header
CFLAGS += -Ienv
CFLAGS += -Ilibc
CFLAGS += -Itime
CFLAGS += -Igamepad
CFLAGS += -Igraphic

# link
LFLAGS += --no-entry
LFLAGS += --strip-all
LFLAGS += --gc-sections
LFLAGS += --lto-O3
# stack and memory size
LFLAGS += -z stack-size=4096
# LFLAGS += --initial-memory=65536
# LFLAGS += --import-memory


all: $(TARGET_WASM)

$(TARGET_WASM): $(OBJ)
	@$(ECHO) Linking...
	@$(LD) $^ $(LFLAGS) -o $@
	@$(SIZE) $(TARGET_WASM)
	@$(ECHO) done.

$(TARGET_WAT): $(TARGET_WASM)
	@$(WASM2WAT) -o $(TARGET_WAT) $(TARGET_WASM)

$(BUILD)/%.o: %.c
	@mkdir -p $(dir $@)
	@$(CC) -c -MMD $(CFLAGS) $< -o $@

clean:
	@$(ECHO) Cleaning...
	@rm -f $(TARGET_WASM)
	@rm -f $(TARGET_WAT)
	@rm -f $(OBJ)
	@$(ECHO) done.

run: all
	@$(ECHO) ================================
	../build/vgp_main $(TARGET_WASM)
