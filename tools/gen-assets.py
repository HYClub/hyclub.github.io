#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
gen-assets.py —— 一次性资源生成器（不属于构建流程）

生成两类图片到 public/img/：

  1) cover-<id>.webp   1200x750  项目卡片封面
     只为**有真实截图**的项目生成。没有截图的项目不配图 ——
     卡片改为纯排版（见 src/js/components.js 的 card--plain），
     硬凑一张占位图不如不放。

  2) og-<id>.jpg       1200x630  分享预览图
     有截图的用截图做底 + 标题；没有截图的用一张纯排版分享卡
     （深色底 + 主题色细线 + 项目名）。分享卡是链接预览用的版式，
     不是给项目编一张假截图。

  3) og.jpg            1200x630  站点分享预览图

用法：  python tools/gen-assets.py
依赖：  Pillow，以及 Windows 字体 msyh.ttc / msyhbd.ttc

注意：项目名与主题色在此脚本中重复声明了一次（另一处是 src/data/projects.js）。
      这是有意的取舍 —— 资源只需生成一次，不值得为它引入构建期依赖。
      改完名字或主题色，重跑本脚本即可。
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / ".asset-src"
OUT = ROOT / "public" / "img"

COVER_W, COVER_H = 1200, 750
OG_W, OG_H = 1200, 630

FONT_CJK_BOLD = "C:/Windows/Fonts/msyhbd.ttc"
FONT_CJK = "C:/Windows/Fonts/msyh.ttc"
FONT_MONO = "C:/Windows/Fonts/consola.ttf"

BASE = (8, 11, 17)

# id, 中文名, 英文名, 主题色, 截图文件（None = 没有真实截图，只生成纯排版分享卡）
PROJECTS = [
    ("deep-sea-sonar", "深海声呐员", "Deep Sea Sonar", "#3ec9d6", "sonar-level.jpg"),
    ("snow-bros", "雪人兄弟", "Snow Bros", "#8fd8ff", None),
    ("stock-persona", "股神异闻录", "Stock Persona", "#e0455f", "sp-shot6.jpg"),
    ("vgame", "AI 影游平台", "vgame", "#a06bff", None),
    ("hyc-framework", "HYC 游戏框架", "HYC Framework", "#4f8cff", None),
    ("dsgs", "DSH 游戏工作室", "DSH Game Studios", "#3ddc97", None),
    ("vgame-toolkit", "影游开发套件", "vgame-toolkit", "#ffcf4d", None),
    ("steamcmd-gui", "SteamCMD 界面", "SteamCMD GUI", "#6fa8c8", None),
]

# 用到真实截图的项目，截图不入库（.asset-src/ 已 gitignore）。
# 缺失时脚本会打印这些地址，手动下载到 .asset-src/ 再重跑即可。
SOURCES = {
    "sonar-level.jpg": "https://raw.githubusercontent.com/HYClub/DeepseaSonar-Demo/main/screenshots/Level.jpg",
    "sp-shot6.jpg": "https://raw.githubusercontent.com/HYClub/stock-persona/gh-pages/img/shot-6.jpg",
}


def hex_rgb(value: str) -> tuple[int, int, int]:
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    try:
        return ImageFont.truetype(path, size)
    except OSError:
        return ImageFont.truetype(FONT_CJK, size)


def load_shot(name: str) -> Image.Image:
    path = SRC / name
    if not path.exists():
        url = SOURCES.get(name, "(来源未知)")
        raise SystemExit(
            f"缺少原始截图：{path}\n请先下载到该路径再重跑本脚本：\n  {url}"
        )
    return Image.open(path).convert("RGB")


def crop_to(image: Image.Image, width: int, height: int) -> Image.Image:
    """居中裁剪到目标比例，再缩放到目标尺寸。"""
    target = width / height
    w, h = image.size
    if w / h > target:
        nw = int(h * target)
        image = image.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    else:
        nh = int(w / target)
        image = image.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
    return image.resize((width, height), Image.LANCZOS)


def tinted_background(width: int, height: int, color, strength: int = 34) -> Image.Image:
    """深色底 + 左上角一团很淡的主题色辉光。纯排版图的背景，不做任何图案。"""
    img = Image.new("RGB", (width, height), BASE)

    mask = Image.new("L", (width, height), 0)
    radius = int(max(width, height) * 0.72)
    ImageDraw.Draw(mask).ellipse(
        [-radius // 3, -radius // 2, radius, radius // 2], fill=strength * 6
    )
    mask = mask.filter(ImageFilter.GaussianBlur(radius * 0.42))

    glow = Image.new("RGB", (width, height), color)
    img.paste(glow, (0, 0), mask)
    return img


def draw_rule(draw: ImageDraw.ImageDraw, x: int, y: int, color, width: int = 70) -> None:
    draw.rounded_rectangle(
        [x, y, x + width, y + 5], radius=2, fill=(*color, 255)
    )


# ---------------------------------------------------------------- 封面
def build_cover(shot_name: str) -> Image.Image:
    """卡片封面：直接用真实截图，底部压暗一点以便与卡片正文衔接。"""
    img = crop_to(load_shot(shot_name), COVER_W, COVER_H)
    img = Image.blend(img, Image.new("RGB", img.size, (6, 8, 13)), 0.12)

    grad = Image.new("L", (1, COVER_H), 0)
    for y in range(COVER_H):
        t = max(0.0, (y - COVER_H * 0.62) / (COVER_H * 0.38))
        grad.putpixel((0, y), int(min(1.0, t * t) * 130))
    grad = grad.resize((COVER_W, COVER_H))
    return Image.composite(Image.new("RGB", (COVER_W, COVER_H), (4, 6, 10)), img, grad)


# ------------------------------------------------------------ 分享预览图
def build_og_text(title: str, subtitle: str, color_hex: str) -> Image.Image:
    """纯排版分享卡：深色底 + 主题色细线 + 标题。不画任何图案。"""
    color = hex_rgb(color_hex)
    img = tinted_background(OG_W, OG_H, color)
    d = ImageDraw.Draw(img, "RGBA")

    x = 78
    draw_rule(d, x, 168, color)

    f_kicker = font(FONT_MONO, 24)
    f_title = font(FONT_CJK_BOLD, 68 if len(title) <= 12 else 54)
    f_sub = font(FONT_CJK, 28)
    f_url = font(FONT_MONO, 26)

    d.text((x + 88, 156), "HYCLUB", font=f_kicker, fill=(*color, 240))
    d.text((x, 216), title, font=f_title, fill=(242, 246, 252, 255))
    d.text(
        (x, 216 + (86 if len(title) <= 12 else 74)),
        subtitle,
        font=f_sub,
        fill=(150, 160, 178, 255),
    )
    d.text((x, OG_H - 86), "huoyue.club", font=f_url, fill=(255, 255, 255, 96))
    return img


def build_og_shot(shot_name: str, title: str, color_hex: str) -> Image.Image:
    """有截图的用截图做底，压暗后在左下角写标题。"""
    color = hex_rgb(color_hex)
    img = crop_to(load_shot(shot_name), OG_W, OG_H)
    img = Image.blend(img, Image.new("RGB", img.size, BASE), 0.42)

    # 左侧压暗，保证文字可读
    grad = Image.new("L", (OG_W, 1), 0)
    for x in range(OG_W):
        t = max(0.0, 1.0 - x / (OG_W * 0.78))
        grad.putpixel((x, 0), int(min(1.0, t * t) * 215))
    grad = grad.resize((OG_W, OG_H))
    img = Image.composite(Image.new("RGB", (OG_W, OG_H), (4, 6, 10)), img, grad)

    d = ImageDraw.Draw(img, "RGBA")
    x = 78
    draw_rule(d, x, 168, color, 70)

    f_kicker = font(FONT_MONO, 24)
    f_title = font(FONT_CJK_BOLD, 68 if len(title) <= 12 else 54)
    f_url = font(FONT_MONO, 26)

    d.text((x + 88, 156), "HYCLUB", font=f_kicker, fill=(*color, 245))
    d.text((x, 216), title, font=f_title, fill=(242, 246, 252, 255))
    d.text((x, OG_H - 86), "huoyue.club", font=f_url, fill=(255, 255, 255, 110))
    return img


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)

    for pid, name, name_en, color, shot in PROJECTS:
        if shot:
            build_cover(shot).save(
                OUT / f"cover-{pid}.webp", "WEBP", quality=86, method=6
            )

        og = (
            build_og_shot(shot, name, color)
            if shot
            else build_og_text(name, name_en, color)
        )
        og.save(OUT / f"og-{pid}.jpg", "JPEG", quality=90, optimize=True, progressive=True)
        print(f"  {pid:<18} {'cover + og' if shot else 'og'}")

    build_og_text("HYClub", "游戏 · 引擎 · 工具 · AI", "#4f8cff").save(
        OUT / "og.jpg", "JPEG", quality=90, optimize=True, progressive=True
    )
    print("  site               og.jpg")


if __name__ == "__main__":
    main()
