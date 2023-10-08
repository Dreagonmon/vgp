#include <stdlib.h>
#include <stdio.h>
#include "env.h"
#include "gamepad.h"
#include "screen.h"
#include "framebuf.h"
#include "asciifont.h"
#include "ui_utils.h"
#define N 4

int grid[N][N] = {0};
int D = 0;
int M = 2048;
int cellW = 0;
int cellH = 0;
char numbuf[5] = "0000";

void fullScreenText(const char *text)
{
    ui_text_area(
        font8x8_quan, text,
        get_frame_buffer(),
        0, 0, get_screen_width(), get_screen_height(),
        ui_ALIGN_HCENTER | ui_ALIGN_VCENTER,
        COLOR_SET, COLOR_CLEAR);
    screen_flush();
}

void drawCell(uint8_t row, uint8_t col, const char *text)
{
    ui_text_area(
        font8x8_quan, text,
        get_frame_buffer(),
        cellW * col, cellH * row, cellW, cellH,
        ui_ALIGN_HCENTER | ui_ALIGN_VCENTER,
        COLOR_SET, COLOR_CLEAR);
}

void parseNumber(int num)
{
    num %= 10000; // 最多4位数
    if (num < 0)
        num = -num;
    sprintf(numbuf, "%u", num);
}

void fillEmpty(void)
{
    numbuf[0] = ' ';
    numbuf[1] = '\0';
}

int getKey(void)
{
    int k = 0;
    uint32_t event = gamepad_query_event();
    if (k_action(event) == KACT_SHORT_CLICK) // c<0为特殊键，还要再读下一个字节判断为何键
    {
        uint16_t c = k_value(event);
        if (c == K_UP)
        {
            D = 1;
            k = 1;
        } // top
        if (c == K_DOWN)
        {
            D = 2;
            k = 1;
        } // down
        if (c == K_LEFT)
        {
            D = 3;
            k = 1;
        } // left
        if (c == K_RIGHT)
        {
            D = 4;
            k = 1;
        } // right
    }
    return k;
}

void displayData(void)
{
    int i, j;
    for (i = 0; i < N; i++)
    {
        for (j = 0; j < N; j++)
        {
            if (grid[i][j] != 0)
                parseNumber(grid[i][j]);
            else
                fillEmpty();
            drawCell(i, j, numbuf);
        }
    }
    screen_flush();
}
// 判断是否有空位
int isNotFull(void)
{
    int i, j, k = 0;
    for (i = 0; i < N; i++)
        for (j = 0; j < N; j++)
            if (grid[i][j] == 0)
            {
                k = 1;
                break;
            }
    return k;
}
// 清空棋盘
void clearData(void)
{
    int i, j;
    for (i = 0; i < N; i++)
    {
        for (j = 0; j < N; j++)
        {
            grid[i][j] = 0;
        }
    }
}
// 随机数字
void putRandomData(void)
{
    int r, c, x;
    x = rand() % 2 * 2 + 2;
    do
    {
        r = rand() % N;
        c = rand() % N;
    } while (grid[r][c] != 0);
    grid[r][c] = x;
}
// 获取最大值
int getMax(void)
{
    int i, j, max = 0;
    for (i = 0; i < N; i++)
        for (j = 0; j < N; j++)
            if (max < grid[i][j])
                max = grid[i][j];
    return max;
}
// 移动相加,返回1表示有移动，返回0表示无移动
int add(void)
{
    int i, j, cr, w, F = 0;
    if (D == 1) // top
    {
        for (i = 1; i < N; i++)
            for (j = 0; j < N; j++)
            {
                cr = i;
                w = 0; // 0:未合并  1：合并过
                while (cr >= 1 && grid[cr][j] != 0)
                {
                    if (grid[cr - 1][j] == 0) // 上方有空位，上移
                    {
                        grid[cr - 1][j] = grid[cr][j];
                        grid[cr][j] = 0;
                        F = 1;
                    }
                    else // 上方无空位
                    {
                        if (grid[cr - 1][j] == grid[cr][j] && w == 0) // 相等，相加
                        {
                            grid[cr - 1][j] = grid[cr - 1][j] * 2;
                            grid[cr][j] = 0;
                            w = 1;
                            F = 1;
                        }
                        else // 不等
                        {
                            break;
                        }
                    }
                    cr--;
                }
            }
    }
    if (D == 2) // down
    {
        for (i = N - 2; i >= 0; i--)
            for (j = 0; j < N; j++)
            {
                cr = i;
                w = 0;
                while (cr <= N - 2 && grid[cr][j] != 0)
                {
                    if (grid[cr + 1][j] == 0) // 下方有空位，下移
                    {
                        grid[cr + 1][j] = grid[cr][j];
                        grid[cr][j] = 0;
                        F = 1;
                    }
                    else // 下方无空位
                    {
                        if (grid[cr + 1][j] == grid[cr][j] && w == 0) // 相等，相加
                        {
                            grid[cr + 1][j] = grid[cr + 1][j] * 2;
                            grid[cr][j] = 0;
                            w = 1;
                            F = 1;
                        }
                        else // 不等
                        {
                            break;
                        }
                    }
                    cr++;
                }
            }
    }
    if (D == 3) // left
    {
        for (i = 0; i < N; i++)
            for (j = 1; j < N; j++)
            {
                cr = j;
                w = 0;
                while (cr >= 1 && grid[i][cr] != 0)
                {
                    if (grid[i][cr - 1] == 0) // 左方有空位，左移
                    {
                        grid[i][cr - 1] = grid[i][cr];
                        grid[i][cr] = 0;
                        F = 1;
                    }
                    else // 左方无空位
                    {
                        if (grid[i][cr - 1] == grid[i][cr] && w == 0) // 相等，相加
                        {
                            grid[i][cr - 1] = grid[i][cr - 1] * 2;
                            grid[i][cr] = 0;
                            w = 1;
                            F = 1;
                        }
                        else // 不等
                        {
                            break;
                        }
                    }
                    cr--;
                }
            }
    }
    if (D == 4) // right
    {
        for (i = 0; i < N; i++)
            for (j = N - 2; j >= 0; j--)
            {
                cr = j;
                w = 0;
                while (cr <= N - 2 && grid[i][cr] != 0)
                {
                    if (grid[i][cr + 1] == 0) // 右方有空位，右移
                    {
                        grid[i][cr + 1] = grid[i][cr];
                        grid[i][cr] = 0;
                        F = 1;
                    }
                    else // 右方无空位
                    {
                        if (grid[i][cr + 1] == grid[i][cr] && w == 0) // 相等，相加
                        {
                            grid[i][cr + 1] = grid[i][cr + 1] * 2;
                            grid[i][cr] = 0;
                            w = 1;
                            F = 1;
                        }
                        else // 不等
                        {
                            break;
                        }
                    }
                    cr++;
                }
            }
    }
    return F;
}
// 在数字全满下，检查是否还有合并的可能，有则返回1；
int canAdd(void)
{
    int i, j, F = 0;
    for (i = 0; i < N; i++)
        for (j = 0; j < N - 1; j++)
            if (grid[i][j] == grid[i][j + 1])
                F = 1;

    for (j = 0; j < N; j++)
        for (i = 0; i < N - 1; i++)
            if (grid[i][j] == grid[i + 1][j])
                F = 1;
    return F;
}

void game_init(void)
{
    cellW = get_screen_width() / N;
    cellH = get_screen_height() / N;
    fullScreenText("Press D-Pad\nto start");
}

static int status = 0;

void game_loop(void)
{
    int mov, key, isf;
    key = getKey(); // 读取操作键
    if (key == 0)
        return; // 不是上下左右键，重新读取键盘
    switch (status)
    {
    case 0:
        // 初次状态
        srand(cpu_ticks_ms());
        putRandomData(); // 随机第一个数
        putRandomData(); // 随机第二个数
        displayData();   // 显示
        status = 1;
        break;

    case 1:
        mov = add(); // 根据方向键合并相加,返回1表示有移动
        if (mov == 1)
            displayData(); // 显示
        if (getMax() == M) // 判断是否胜利
        {
            fullScreenText("You WIN!\n\nPress D-Pad\nto start again");
            status = 2;
            break;
        }
        isf = isNotFull();        // 返回1表示还有空位
        if (isf == 1 && mov == 1) // 有空位且有移动再随机
        {
            putRandomData(); // 再随机
            displayData();   // 显示
        }
        if (isf == 0) // 没有空间则游戏结束
        {
            if (!canAdd())
            {
                // game over
                fullScreenText("You LOSE!\n\nPress D-Pad\nto start again");
                status = 2;
                break;
            }
        }
        break;

    case 2:
        clearData();
        fullScreenText("Press D-Pad\nto start");
        status = 0;

    default:
        break;
    }
}
