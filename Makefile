BUILD = build
TARGET = $(BUILD)/vgp_main

CC = gcc
SIZE = size

# SRC += $(wildcard *.c littlefs/*.c)
SRC += $(wildcard *.c wasm3/*.c vgp/*.c impl_sdl/*.c)
OBJ := $(SRC:%.c=$(BUILD)/%.o)

ifdef DEBUG
CFLAGS += -O0 -g3
else
CFLAGS += -Os
endif
CFLAGS += -std=c17 -Wall
# library
CFLAGS += -lm
# include header
CFLAGS += -Iwasm3
CFLAGS += -Ivgp
CFLAGS += -Iimpl_sdl

LFLAGS =


all: $(TARGET)

size: $(OBJ)
	$(SIZE) -t $^

-include $(DEP)

$(TARGET): $(OBJ)
	mkdir -p $(BUILD)
	$(CC) $(CFLAGS) $^ $(LFLAGS) -o $@
	# rm -f $(OBJ)

$(BUILD)/%.o: %.c
	mkdir -p $(dir $@)
	$(CC) -c -MMD $(CFLAGS) $< -o $@

clean:
	rm -f $(TARGET)
	rm -f $(OBJ)

run: $(TARGET)
	@chmod +x $(TARGET)
	@echo ================================
	@$(TARGET)
