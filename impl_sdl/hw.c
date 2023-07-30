#include <hw.h>
#include <stdbool.h>
#include <SDL2/SDL.h>

#define KEY_MASK_UP    (0b1 << 5)
#define KEY_MASK_DOWN  (0b1 << 4)
#define KEY_MASK_LEFT  (0b1 << 3)
#define KEY_MASK_RIGHT (0b1 << 2)
#define KEY_MASK_A     (0b1 << 1)
#define KEY_MASK_B     (0b1 << 0)
#define WINDOW_SCALE 8
#define WINDOW_W (SCREEN_WIDTH * WINDOW_SCALE)
#define WINDOW_H (SCREEN_HEIGHT * WINDOW_SCALE)
#define check(x) if ((x) < 0) { printf("SDL Error: %s\n", SDL_GetError()); exit(1); }

static SDL_Renderer *renderer = NULL;
static SDL_Window *window = NULL;
static SDL_Surface *surface = NULL;
static SDL_Rect rect = { 0 };
static bool frame_changed = false;
static bool should_quit = false;

static void sdl_white() {
    SDL_SetRenderDrawColor(renderer, 255, 255, 255, 255); // white
}

static void sdl_black() {
    SDL_SetRenderDrawColor(renderer, 0, 0, 0, 255); // black
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
    sdl_black();
    rect.x = 0;
    rect.y = 0;
    rect.w = SCREEN_WIDTH * WINDOW_SCALE;
    rect.h = SCREEN_HEIGHT * WINDOW_SCALE;
    check(SDL_RenderClear(renderer));
    check(SDL_RenderFillRect(renderer, &rect));
    SDL_RenderPresent(renderer);
    check(SDL_UpdateWindowSurface(window));
}

void __hw_draw_pixel(int32_t x, int32_t y, int32_t color) {
    if (color) {
        sdl_white();
    } else {
        sdl_black();
    }
    rect.x = x * WINDOW_SCALE + 1;
    rect.y = y * WINDOW_SCALE + 1;
    rect.w = WINDOW_SCALE - 2;
    rect.h = WINDOW_SCALE - 2;
    check(SDL_RenderFillRect(renderer, &rect));
    frame_changed = true;
}

int32_t __hw_ticks_ms(void) {
    return SDL_GetTicks() & INT32_MAX;
}

int32_t __hw_get_gamepad_status(void) {
    int ksize = 0;
    const int32_t *kbd = SDL_GetKeyboardState(&ksize);
    int32_t value = 0;
    if (kbd[SDL_SCANCODE_K]) {
        value |= KEY_MASK_A;
    } else if (kbd[SDL_SCANCODE_J]) {
        value |= KEY_MASK_B;
    } else if (kbd[SDL_SCANCODE_W]) {
        value |= KEY_MASK_UP;
    } else if (kbd[SDL_SCANCODE_S]) {
        value |= KEY_MASK_DOWN;
    } else if (kbd[SDL_SCANCODE_A]) {
        value |= KEY_MASK_LEFT;
    } else if (kbd[SDL_SCANCODE_D]) {
        value |= KEY_MASK_RIGHT;
    }
    return value;
}

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

void __hw_quit(void) {
    SDL_Quit();
    exit(0);
}
