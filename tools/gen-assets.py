#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
gen-assets.py —— 一次性资源生成器（不属于构建流程）

生成两类图片到 public/img/：
  1) cover-<id>.webp   1200x750  项目卡片封面
  2) og-<id>.png       1200x630  该项目的分享预览图
  3) og.png            1200x630  站点分享预览图

设计约定：工程类项目用「程序化几何母题 + 项目主题色」生成封面，保证整墙卡片
视觉统一；有官方截图的游戏项目直接用真实截图，让可玩的游戏更可信。

用法：  python tools/gen-assets.py
依赖：  Pillow（本机已有），Windows 字体 msyh.ttc / msyhbd.ttc

注意：项目名与主题色在此脚本中重复声明了一次（另一处是 src/data/projects.js）。
      这是有意的取舍 —— 资源只需生成一次，不值得为它引入构建期依赖。
      若改了主题色或名字，重跑本脚本即可。
"""

from __future__ import annotations

import math
import os
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / ".asset-src"
OUT = ROOT / "public" / "img"

COVER_W, COVER_H = 1200, 750
OG_W, OG_H = 1200, 630

FONT_CJK = "C:/Windows/Fonts/msyh.ttc"
FONT_CJK_BOLD = "C:/Windows/Fonts/msyhbd.ttc"
FONT_MONO = "C:/Windows/Fonts/consola.ttf"

BASE = (8, 11, 17)

# id, 中文名, 英文名, 主题色, 母题, 分类标签, 截图（None = 程序化生成）
PROJECTS = [
    ("deep-sea-sonar", "深海声呐员", "Deep Sea Sonar", "#3ec9d6", "waves", "GAME", "sonar-level.jpg"),
    ("snow-bros", "雪人兄弟", "Snow Bros", "#8fd8ff", "hex", "GAME", None),
    ("stock-persona", "股神异闻录", "Stock Persona", "#e0455f", "circuit", "GAME", "sp-shot6.jpg"),
    ("vgame", "AI 影游平台", "vgame", "#a06bff", "orbit", "GAME", None),
    ("hyc-framework", "HYC 游戏框架", "HYC Framework", "#4f8cff", "grid", "ENGINE", None),
    ("graphi-shader", "Graphi 着色器库", "Graphi ShaderLibrary", "#ff8a3d", "bars", "ENGINE", None),
    ("dsgs", "DSH 游戏工作室", "DSH Game Studios", "#3ddc97", "mesh", "ENGINE", None),
    ("vgame-toolkit", "影游开发套件", "vgame-toolkit", "#ffcf4d", "blocks", "ENGINE", None),
    ("steamcmd-gui", "SteamCMD 界面", "SteamCMD GUI", "#6fa8c8", "stripes", "TOOL", None),
]


def hex_rgb(value: str) -> tuple[int, int, int]:
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    try:
        return ImageFont.truetype(path, size)
    except OSError:
        return ImageFont.truetype(FONT_CJK, size)


def additive_glow(img: Image.Image, center, radius, color, strength=150) -> Image.Image:
    """在 img 上叠加一团径向辉光（加法混合），用来给纯色底加层次。"""
    mask = Image.new("L", img.size, 0)
    ImageDraw.Draw(mask).ellipse(
        [center[0] - radius, center[1] - radius, center[0] + radius, center[1] + radius],
        fill=strength,
    )
    mask = mask.filter(ImageFilter.GaussianBlur(radius * 0.55))
    layer = Image.new("RGB", img.size, color)
    glow = Image.new("RGB", img.size, (0, 0, 0))
    glow.paste(layer, (0, 0), mask)
    return ImageChops.add(img, glow)


def overlay(img: Image.Image, draw_fn) -> Image.Image:
    """把一张带 alpha 的绘制层合成回 img。"""
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw_fn(ImageDraw.Draw(layer), layer.size)
    return Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB")


def accent_alpha(color, alpha: int):
    return (*color, alpha)


def draw_grid(d: ImageDraw.ImageDraw, size, step=60, alpha=14):
    w, h = size
    for x in range(0, w + 1, step):
        d.line([(x, 0), (x, h)], fill=(255, 255, 255, alpha), width=1)
    for y in range(0, h + 1, step):
        d.line([(0, y), (w, y)], fill=(255, 255, 255, alpha), width=1)


# --------------------------------------------------------------------------
# 母题：每个项目一种几何图形，用主题色低透明度绘制
# --------------------------------------------------------------------------

def motif_waves(d, size, color):
    w, h = size
    for i in range(9):
        y0 = h * (0.30 + i * 0.055)
        pts = [
            (x, y0 + math.sin(x / 95.0 + i * 0.7) * (22 + i * 4))
            for x in range(-20, w + 21, 8)
        ]
        d.line(pts, fill=accent_alpha(color, 46 + i * 5), width=2)


def motif_hex(d, size, color):
    w, h = size
    r = 46
    dx = r * 1.5
    dy = r * math.sqrt(3)
    col = 0
    x = -r
    while x < w + r:
        y = -dy if col % 2 else -dy / 2
        while y < h + dy:
            pts = [
                (x + r * math.cos(math.radians(60 * k + 30)),
                 y + r * math.sin(math.radians(60 * k + 30)))
                for k in range(6)
            ]
            d.polygon(pts, outline=accent_alpha(color, 34), width=2)
            y += dy
        x += dx
        col += 1


def motif_circuit(d, size, color):
    w, h = size
    step = 90
    for i in range(1, w // step + 1):
        x = i * step
        d.line([(x, 0), (x, h)], fill=accent_alpha(color, 26), width=1)
    for j in range(1, h // step + 1):
        y = j * step
        d.line([(0, y), (w, y)], fill=accent_alpha(color, 26), width=1)
    import random

    rnd = random.Random(7)
    for _ in range(46):
        x = rnd.randrange(step, w, step)
        y = rnd.randrange(step, h, step)
        horiz = rnd.random() < 0.5
        length = step * rnd.choice([1, 2])
        if horiz:
            d.line([(x, y), (x + length, y)], fill=accent_alpha(color, 70), width=3)
        else:
            d.line([(x, y), (x, y + length)], fill=accent_alpha(color, 70), width=3)
        d.ellipse([x - 5, y - 5, x + 5, y + 5], fill=accent_alpha(color, 120))


def motif_orbit(d, size, color):
    w, h = size
    cx, cy = w * 0.62, h * 0.5
    for i in range(7):
        rx = 70 + i * 62
        ry = rx * 0.42
        d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry],
                  outline=accent_alpha(color, 60 - i * 6), width=2)
        ang = math.radians(i * 52 + 20)
        px = cx + rx * math.cos(ang)
        py = cy + ry * math.sin(ang)
        d.ellipse([px - 6, py - 6, px + 6, py + 6], fill=accent_alpha(color, 190))


def motif_grid(d, size, color):
    w, h = size
    vx, vy = w * 0.5, h * 0.22
    for i in range(-9, 10):
        d.line([(vx + i * 46, vy), (vx + i * 200, h)], fill=accent_alpha(color, 40), width=2)
    y = vy + 30
    step = 22
    while y < h:
        d.line([(0, y), (w, y)], fill=accent_alpha(color, 34), width=1)
        step *= 1.28
        y += step


def motif_bars(d, size, color):
    w, h = size
    import random

    rnd = random.Random(11)
    n = 26
    bw = w / (n * 1.7)
    for i in range(n):
        x = 40 + i * (w - 80) / n
        bh = rnd.uniform(0.12, 0.72) * h
        d.rounded_rectangle(
            [x, h - 60 - bh, x + bw, h - 60],
            radius=bw / 2,
            fill=accent_alpha(color, 40 + int(bh / h * 90)),
        )


def motif_mesh(d, size, color):
    w, h = size
    import random

    rnd = random.Random(23)
    pts = [(rnd.uniform(0, w), rnd.uniform(0, h)) for _ in range(38)]
    for i, p in enumerate(pts):
        for q in pts[i + 1 :]:
            dist = math.dist(p, q)
            if dist < 210:
                a = int(70 * (1 - dist / 210))
                d.line([p, q], fill=accent_alpha(color, a), width=1)
    for p in pts:
        d.ellipse([p[0] - 3.5, p[1] - 3.5, p[0] + 3.5, p[1] + 3.5], fill=accent_alpha(color, 200))


def motif_blocks(d, size, color):
    w, h = size
    s = 74
    for row in range(-1, h // s + 2):
        for col in range(-1, w // s + 2):
            x = col * s + (row % 2) * (s / 2)
            y = row * s * 0.86
            d.polygon(
                [(x, y - s * 0.5), (x + s * 0.5, y - s * 0.25),
                 (x + s * 0.5, y + s * 0.25), (x, y)],
                outline=accent_alpha(color, 26),
            )
            d.polygon(
                [(x, y), (x + s * 0.5, y + s * 0.25),
                 (x + s * 0.5, y - s * 0.25), (x + s * 0.5, y - s * 0.25)],
                outline=accent_alpha(color, 0),
            )
            d.polygon(
                [(x, y), (x - s * 0.5, y - s * 0.25),
                 (x - s * 0.5, y + s * 0.25), (x, y + s * 0.5)],
                outline=accent_alpha(color, 18),
            )


def motif_stripes(d, size, color):
    w, h = size
    for i in range(-h, w + h, 34):
        d.line([(i, 0), (i + h, h)], fill=accent_alpha(color, 30), width=3)
    for i in range(-h, w + h, 170):
        d.line([(i, 0), (i + h, h)], fill=accent_alpha(color, 74), width=3)


def motif_rings(d, size, color):
    w, h = size
    cx, cy = w * 0.42, h * 0.46
    for i in range(14):
        r = 26 + i * 34
        a = max(0, 110 - i * 8)
        d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=accent_alpha(color, a), width=2)


MOTIFS = {
    "waves": motif_waves,
    "hex": motif_hex,
    "circuit": motif_circuit,
    "orbit": motif_orbit,
    "grid": motif_grid,
    "bars": motif_bars,
    "mesh": motif_mesh,
    "blocks": motif_blocks,
    "stripes": motif_stripes,
    "rings": motif_rings,
}


def vignette(img: Image.Image, strength=0.72) -> Image.Image:
    w, h = img.size
    mask = Image.new("L", (w, h), 0)
    pad = int(min(w, h) * 0.06)
    ImageDraw.Draw(mask).ellipse([-pad, -pad, w + pad, h + pad], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(min(w, h) * 0.20))
    dark = Image.new("RGB", (w, h), (0, 0, 0))
    shrink = mask.point(lambda v: int(255 - (255 - v) * strength))
    return Image.composite(img, dark, shrink)


def cover_mark(img: Image.Image, index: int, color) -> Image.Image:
    """封面只在右下角留一个编号，不写项目名。

    卡片正文里已经有大标题，封面上再写一遍就是重复；而封面左上/右上在卡片里
    会被状态标签占用，所以编号放右下角。
    """
    d = ImageDraw.Draw(img, "RGBA")
    w, h = img.size

    # 底部轻微压暗，让封面与卡片正文过渡自然，也让编号更清楚
    grad = Image.new("L", (1, h), 0)
    for y in range(h):
        t = max(0.0, (y - h * 0.60) / (h * 0.40))
        grad.putpixel((0, y), int(min(1.0, t * t) * 130))
    grad = grad.resize((w, h))
    img = Image.composite(Image.new("RGB", (w, h), (4, 6, 10)), img, grad)
    d = ImageDraw.Draw(img, "RGBA")

    f_num = font(FONT_MONO, 30)
    num = f"{index:02d}"
    tw = d.textlength(num, font=f_num)
    x = w - 60 - tw
    y = h - 78
    d.text((x, y), num, font=f_num, fill=(255, 255, 255, 92))
    # 编号前的主题色短线
    d.rounded_rectangle([x - 46, y + 15, x - 10, y + 18], radius=2, fill=accent_alpha(color, 190))

    return img


def build_cover(pid, name, name_en, color_hex, motif, kicker, shot, index) -> Image.Image:
    color = hex_rgb(color_hex)

    if shot:
        src = Image.open(SRC / shot).convert("RGB")
        # 中心裁剪到目标比例
        target = COVER_W / COVER_H
        w, h = src.size
        if w / h > target:
            nw = int(h * target)
            src = src.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
        else:
            nh = int(w / target)
            src = src.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
        img = src.resize((COVER_W, COVER_H), Image.LANCZOS)
        img = Image.blend(img, Image.new("RGB", img.size, (6, 8, 13)), 0.14)
    else:
        img = Image.new("RGB", (COVER_W, COVER_H), BASE)
        img = additive_glow(img, (COVER_W * 0.30, COVER_H * 0.30), 620, color, 86)
        img = additive_glow(img, (COVER_W * 0.92, COVER_H * 0.86), 420,
                            tuple(int(c * 0.55) for c in color), 60)
        img = overlay(img, lambda d, s: draw_grid(d, s, 60, 14))
        img = overlay(img, lambda d, s: MOTIFS[motif](d, s, color))
        img = vignette(img, 0.78)

    img = cover_mark(img, index, hex_rgb(color_hex))
    return img



def build_og(title, subtitle, color_hex, motif, index=None) -> Image.Image:
    color = hex_rgb(color_hex)
    img = Image.new("RGB", (OG_W, OG_H), BASE)
    img = additive_glow(img, (OG_W * 0.22, OG_H * 0.18), 540, color, 92)
    img = additive_glow(img, (OG_W * 0.96, OG_H * 0.95), 380,
                        tuple(int(c * 0.5) for c in color), 58)
    img = overlay(img, lambda d, s: draw_grid(d, s, 60, 12))
    img = overlay(img, lambda d, s: MOTIFS[motif](d, s, color))
    img = vignette(img, 0.66)

    d = ImageDraw.Draw(img, "RGBA")
    x = 78
    d.rounded_rectangle([x, 168, x + 70, 173], radius=2, fill=accent_alpha(color, 255))

    f_kick = font(FONT_MONO, 24)
    f_title = font(FONT_CJK_BOLD, 66 if len(title) <= 12 else 52)
    f_sub = font(FONT_CJK, 28)
    f_url = font(FONT_MONO, 26)

    if index is not None:
        d.text((x + 88, 156), f"HYCLUB / {index:02d}", font=f_kick, fill=accent_alpha(color, 240))
    else:
        # 等宽字体 consola 没有中文字形，这里只能用拉丁字符
        d.text((x + 88, 156), "HYCLUB / PROJECTS", font=f_kick, fill=accent_alpha(color, 240))

    d.text((x, 216), title, font=f_title, fill=(242, 246, 252, 255))
    d.text((x, 216 + (86 if len(title) <= 12 else 74)), subtitle, font=f_sub, fill=(154, 164, 182, 255))

    d.text((x, OG_H - 86), "huoyue.club", font=f_url, fill=(255, 255, 255, 96))
    return img


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)

    for i, (pid, name, name_en, color, motif, kicker, shot) in enumerate(PROJECTS, start=1):
        cover = build_cover(pid, name, name_en, color, motif, kicker, shot, i)
        cover.save(OUT / f"cover-{pid}.webp", "WEBP", quality=86, method=6)

        og = build_og(name, name_en, color, motif, index=i)
        og.save(OUT / f"og-{pid}.png", "PNG", optimize=True)
        print(f"  {pid:<18} cover + og")

    site = build_og("HYClub", "游戏 · 引擎 · 工具", "#4f8cff", "mesh")
    site.save(OUT / "og.png", "PNG", optimize=True)
    print("  site               og.png")


if __name__ == "__main__":
    main()
