#include <hw.h>
#include <stdbool.h>
#include <SDL2/SDL.h>
#include <vgp_impl_0002.h>

#define WINDOW_W ((SCREEN_WIDTH * SCREEN_PIXEL_SCALE))
#define WINDOW_H ((SCREEN_HEIGHT * SCREEN_PIXEL_SCALE))
#define check(x) if ((x) < 0) { printf("SDL Error: %s\n", SDL_GetError()); exit(1); }

static SDL_Renderer *renderer = NULL;
static SDL_Window *window = NULL;
static SDL_Surface *surface = NULL;
static SDL_Rect rect = { 0 };
static bool frame_changed = false;
static bool should_quit = false;

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
    check(SDL_Init(SDL_INIT_VIDEO | SDL_INIT_EVENTS | SDL_INIT_TIMER));
    window = SDL_CreateWindow("VGP",
        SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED,
        WINDOW_W, WINDOW_H,
        SDL_WINDOW_SHOWN
    );
    check((int64_t)window - 1); // window not null
    renderer = SDL_CreateRenderer(window, -1, SDL_RENDERER_SOFTWARE);
    check((int64_t)renderer - 1); // renderer not null
    surface = SDL_GetWindowSurface(window);
    check((int64_t)surface - 1); // surface not null
    sdl_set_black();
    rect.x = 0;
    rect.y = 0;
    rect.w = SCREEN_WIDTH * SCREEN_PIXEL_SCALE;
    rect.h = SCREEN_HEIGHT * SCREEN_PIXEL_SCALE;
    check(SDL_RenderClear(renderer));
    check(SDL_RenderFillRect(renderer, &rect));
    SDL_RenderPresent(renderer);
    check(SDL_UpdateWindowSurface(window));
}

void __hw_draw_pixel(int32_t x, int32_t y, int32_t color) {
    sdl_set_color(color);
    rect.x = x * SCREEN_PIXEL_SCALE + SCREEN_PIXEL_OFFSET_MOD;
    rect.y = y * SCREEN_PIXEL_SCALE + SCREEN_PIXEL_OFFSET_MOD;
    rect.w = SCREEN_PIXEL_SCALE + SCREEN_PIXEL_SIZE_MOD;
    rect.h = SCREEN_PIXEL_SCALE + SCREEN_PIXEL_SIZE_MOD;
    check(SDL_RenderFillRect(renderer, &rect));
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
        check(SDL_UpdateWindowSurface(window));
    }
}

void __hw_notify_quit(void) {
    should_quit = true;
}

bool __hw_should_quit(void) {
    return should_quit;
}

void __hw_do_quit(void) {
    SDL_Quit();
    exit(0);
}
