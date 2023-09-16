#include <hw.h>
#include <stdbool.h>
#include <string.h>
#include <SDL2/SDL.h>
#include <vgp_impl_0002.h>

#define WINDOW_W ((SCREEN_WIDTH * SCREEN_PIXEL_SCALE))
#define WINDOW_H ((SCREEN_HEIGHT * SCREEN_PIXEL_SCALE))

static SDL_Renderer *renderer = NULL;
static SDL_Window *window = NULL;
static SDL_Surface *surface = NULL;
static SDL_Rect rect = { 0 };
static bool frame_changed = false;
static bool should_quit = false;
static char *save_file_name = NULL;
static uint8_t *save_data = NULL;

static void sdl_print_error() {
    DEBUG_PRINTF("SDL Error: %s", SDL_GetError());
    exit(1);
}

static void sdl_check_code(int x) {
    if ((x) < 0) {
        sdl_print_error();
    }
}

static void sdl_check_not_null(void *x) {
    if ((x) == NULL) {
        sdl_print_error();
    }
}


static void sdl_set_black() {
    SDL_SetRenderDrawColor(renderer, 0, 0, 0, 255); // black
}

static void sdl_set_color(int32_t color) {
    if (color == 0) {
        SDL_SetRenderDrawColor(renderer, 0, 0, 0, 255); // black
    } else {
        #if (SCREEN_COLOR_FORMAT == VCOLOR_FORMAT_BW)
        SDL_SetRenderDrawColor(renderer, 255, 255, 255, 255); // white
        #endif
        #if  (SCREEN_COLOR_FORMAT == VCOLOR_FORMAT_RGB888)
        uint8_t r = color & 0xFF;
        uint8_t g = (color >> 8) & 0xFF;
        uint8_t b = (color >> 16) & 0xFF;
        SDL_SetRenderDrawColor(renderer, r, g, b, 255);
        #endif
    }
}

static void poll_sdl_events() {
    SDL_Event event;
    while (SDL_PollEvent(&event)) {  // poll until all events are handled!
        if (event.type == SDL_QUIT) {
            exit(0);
            break;
        }
    }
}

void __hw_init() {
    sdl_check_code(SDL_Init(SDL_INIT_VIDEO | SDL_INIT_EVENTS | SDL_INIT_TIMER));
    window = SDL_CreateWindow("VGP",
        SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED,
        WINDOW_W, WINDOW_H,
        SDL_WINDOW_SHOWN
    );
    sdl_check_not_null(window); // window not null
    renderer = SDL_CreateRenderer(window, -1, SDL_RENDERER_SOFTWARE);
    sdl_check_not_null(renderer); // renderer not null
    surface = SDL_GetWindowSurface(window);
    sdl_check_not_null(surface); // surface not null
    sdl_set_black();
    rect.x = 0;
    rect.y = 0;
    rect.w = SCREEN_WIDTH * SCREEN_PIXEL_SCALE;
    rect.h = SCREEN_HEIGHT * SCREEN_PIXEL_SCALE;
    sdl_check_code(SDL_RenderClear(renderer));
    sdl_check_code(SDL_RenderFillRect(renderer, &rect));
    SDL_RenderPresent(renderer);
    sdl_check_code(SDL_UpdateWindowSurface(window));
}

void __hw_draw_pixel(int32_t x, int32_t y, int32_t color) {
    sdl_set_color(color);
    rect.x = x * SCREEN_PIXEL_SCALE + SCREEN_PIXEL_OFFSET_MOD;
    rect.y = y * SCREEN_PIXEL_SCALE + SCREEN_PIXEL_OFFSET_MOD;
    rect.w = SCREEN_PIXEL_SCALE + SCREEN_PIXEL_SIZE_MOD;
    rect.h = SCREEN_PIXEL_SCALE + SCREEN_PIXEL_SIZE_MOD;
    sdl_check_code(SDL_RenderFillRect(renderer, &rect));
    frame_changed = true;
}

int32_t __hw_ticks_ms(void) {
    return SDL_GetTicks() & INT32_MAX;
}

#if (VGP_FEATURE_GAMEPAD > 0)
int32_t __hw_get_gamepad_status(void) {
    int ksize = 0;
    const uint8_t *kbd = SDL_GetKeyboardState(&ksize);
    int32_t value = 0;
    if (kbd[KEY_SCAN_CODE_A]) {
        value |= KEY_MASK_A;
    }
    if (kbd[KEY_SCAN_CODE_B]) {
        value |= KEY_MASK_B;
    }
    if (kbd[KEY_SCAN_CODE_UP]) {
        value |= KEY_MASK_UP;
    }
    if (kbd[KEY_SCAN_CODE_DOWN]) {
        value |= KEY_MASK_DOWN;
    }
    if (kbd[KEY_SCAN_CODE_LEFT]) {
        value |= KEY_MASK_LEFT;
    }
    if (kbd[KEY_SCAN_CODE_RIGHT]) {
        value |= KEY_MASK_RIGHT;
    }
    return value;
}
#endif

void __hw_task_each_frame(void) {
    poll_sdl_events();
    if (frame_changed) {
        SDL_RenderPresent(renderer);
        sdl_check_code(SDL_UpdateWindowSurface(window));
    }
}

void __hw_notify_quit(void) {
    should_quit = true;
}

bool __hw_should_quit(void) {
    return should_quit;
}

void __hw_do_quit(void) {
    if (save_file_name) {
        free(save_file_name);
        save_file_name = NULL;
    }
    if (save_data) {
        free(save_data);
        save_data = NULL;
    }
    SDL_Quit();
    exit(0);
}

void *__hw_load_wasm(const char *wasm_path, size_t *data_size) {
    if (save_file_name) {
        free(save_file_name);
        save_file_name = NULL;
    }
    if (save_data) {
        free(save_data);
        save_data = NULL;
    }
    // generate save file name
    int last_p = (strrchr(wasm_path, '.') - wasm_path); // ascii '.'
    save_file_name = malloc(sizeof(char) * (last_p + 4 + 1));
    strncpy(save_file_name, wasm_path, last_p);
    strcat(save_file_name, ".sav");
    // read data
    SDL_RWops *prop = SDL_RWFromFile(wasm_path, "rb");
    void *data = SDL_LoadFile_RW(prop, data_size, true);
    return data;
}

#if (VGP_FEATURE_SAVE > 0)
uint8_t *__hw_get_save_buffer() {
    if (save_data == NULL) {
        if (save_file_name != NULL) {
            SDL_RWops *prop = SDL_RWFromFile(save_file_name, "rb");
            if (prop == NULL) {
                save_data = malloc(sizeof(uint8_t) * SAVE_CAPACITY);
                memset(save_data, '\0', SAVE_CAPACITY);
                DEBUG_PRINTF("Failed to open save file: %s", save_file_name);
            } else {
                size_t data_size;
                void *data = SDL_LoadFile_RW(prop, &data_size, true);
                if (data == NULL) {
                    save_data = malloc(sizeof(uint8_t) * SAVE_CAPACITY);
                    memset(save_data, '\0', SAVE_CAPACITY);
                    DEBUG_PRINTF("Failed to read save file: %s", save_file_name);
                } else {
                    save_data = malloc(sizeof(uint8_t) * SAVE_CAPACITY);
                    size_t copy_size = data_size > SAVE_CAPACITY ? SAVE_CAPACITY : data_size;
                    memcpy(save_data, data, copy_size);
                    if (copy_size < SAVE_CAPACITY) {
                        size_t lack_size = SAVE_CAPACITY - copy_size;
                        memset(save_data + copy_size, '\0', lack_size);
                    }
                    free(data);
                }
            }
        }
    }
    return save_data;
}

void __hw_commit_save_buffer() {
    if (save_data == NULL) {
        DEBUG_PRINTF("Save buffer not inited.");
    } else {
        SDL_RWops *prop = SDL_RWFromFile(save_file_name, "wb");
        if (prop == NULL) {
            DEBUG_PRINTF("Failed to open save file: %s", save_file_name);
            sdl_print_error();
        } else {
            size_t write_size = SDL_RWwrite(prop, save_data, 1, SAVE_CAPACITY);
            SDL_RWclose(prop);
            if (write_size != SAVE_CAPACITY) {
                DEBUG_PRINTF("Failed to write save file: %s", save_file_name);
                sdl_print_error();
            }
        }
    }
}
#endif
