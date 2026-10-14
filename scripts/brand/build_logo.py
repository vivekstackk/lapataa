"""
Builds the Lapata brand vectors.

Source of truth for every logo asset in the app:
  - public/brand/*.svg
  - src/app/icon.svg
  - src/components/brand/logo-paths.ts

Method
  1. Take the real outlines for  ल ा प त ा  from Kalam (SIL OFL 1.1).
     The word has no conjuncts or reordering, so cmap order == visual order.
  2. Clip off the font's stock headline bar (shirorekha) with exact Bezier
     splitting, leaving only the hand-drawn letter bodies.
  3. Draw ONE continuous custom headline stroke across all letters: rounded
     pen landing, pressure swell, and a long tapering swash that trails away
     ("lapata" = missing, drifting off).
  4. Derive a compact mark from the first letter + the same stroke.

Run:  python scripts/brand/build_logo.py
Needs: fontTools, and the fonts fetched by scripts/brand/fetch-fonts.mjs
"""
import json
import math
import os

from fontTools.pens.basePen import BasePen
from fontTools.ttLib import TTFont

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FONT = os.path.join(ROOT, "scripts", "brand", "fonts", "Kalam-300.ttf")
TEXT = "लापता"
CLIP_Y = 586  # font's headline bar bottom edge is at 588; cut just below it
INDIGO = "#1B1F6B"


# ---------------------------------------------------------------- outlines
class SegPen(BasePen):
    """Collect contours as explicit line / quadratic segments."""

    def __init__(self, gs):
        super().__init__(gs)
        self.contours = []
        self._cur = None
        self._pt = None

    def _moveTo(self, p):
        self._cur = []
        self._pt = p
        self._start = p

    def _lineTo(self, p):
        self._cur.append(("L", self._pt, p))
        self._pt = p

    def _qCurveToOne(self, c, p):
        self._cur.append(("Q", self._pt, c, p))
        self._pt = p

    def _closePath(self):
        if self._pt != self._start:
            self._cur.append(("L", self._pt, self._start))
        self.contours.append(self._cur)
        self._cur = None

    def _endPath(self):
        self._closePath()


def lerp(a, b, t):
    return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)


def split_quad(p0, c, p1, t):
    a, b = lerp(p0, c, t), lerp(c, p1, t)
    m = lerp(a, b, t)
    return (p0, a, m), (m, b, p1)


def quad_y_roots(y0, yc, y1, y):
    # y(t) = (1-t)^2 y0 + 2(1-t)t yc + t^2 y1
    a = y0 - 2 * yc + y1
    b = 2 * (yc - y0)
    c = y0 - y
    roots = []
    if abs(a) < 1e-9:
        if abs(b) > 1e-9:
            roots.append(-c / b)
    else:
        d = b * b - 4 * a * c
        if d >= 0:
            s = math.sqrt(d)
            roots += [(-b + s) / (2 * a), (-b - s) / (2 * a)]
    return sorted(t for t in roots if 1e-6 < t < 1 - 1e-6)


def pieces(seg, y):
    """Split a segment at y; return list of (segment, is_inside)."""
    if seg[0] == "L":
        _, p0, p1 = seg
        if (p0[1] - y) * (p1[1] - y) < 0:
            t = (y - p0[1]) / (p1[1] - p0[1])
            m = lerp(p0, p1, t)
            m = (m[0], y)
            return [(("L", p0, m), p0[1] < y), (("L", m, p1), p1[1] < y)]
        mid = (p0[1] + p1[1]) / 2
        return [(seg, mid <= y)]
    _, p0, c, p1 = seg
    ts = quad_y_roots(p0[1], c[1], p1[1], y)
    out, rest, t_prev = [], seg, 0.0
    cur = (p0, c, p1)
    for t in ts:
        local = (t - t_prev) / (1 - t_prev)
        left, right = split_quad(*cur, local)
        out.append(left)
        cur = right
        t_prev = t
    out.append(cur)
    res = []
    for q in out:
        mid = (q[0][1] + 2 * q[1][1] + q[2][1]) / 4
        res.append((("Q", q[0], q[1], q[2]), mid <= y))
    return res


def clip_contour(contour, y):
    subs = []
    for seg in contour:
        subs += pieces(seg, y)
    if all(inside for _, inside in subs):
        return [s for s, _ in subs]
    if not any(inside for _, inside in subs):
        return None
    # rotate so we start on the first inside piece after an outside piece
    n = len(subs)
    start = next(i for i in range(n) if subs[i][1] and not subs[i - 1][1])
    subs = subs[start:] + subs[:start]
    out = []
    pos = None
    for seg, inside in subs:
        if not inside:
            continue
        s = seg[1]
        if pos is not None and (abs(pos[0] - s[0]) > 1e-6 or abs(pos[1] - s[1]) > 1e-6):
            out.append(("L", pos, s))
        out.append(seg)
        pos = seg[-1]
    first = out[0][1]
    if abs(pos[0] - first[0]) > 1e-6 or abs(pos[1] - first[1]) > 1e-6:
        out.append(("L", pos, first))
    return out


def bbox_h(contour):
    ys = []
    for s in contour:
        for p in s[1:]:
            ys.append(p[1])
    return max(ys) - min(ys)


# ------------------------------------------------------------ transforms
class Xf:
    """font units (y up) -> svg units (y down), with scale + offset."""

    def __init__(self, scale, ox, oy):
        self.s, self.ox, self.oy = scale, ox, oy

    def __call__(self, p):
        return (self.ox + p[0] * self.s, self.oy - p[1] * self.s)


def fmt(v):
    r = round(v, 1)
    return str(int(r)) if r == int(r) else f"{r}"


def seg_path(contours, xf):
    d = []
    for c in contours:
        p0 = xf(c[0][1])
        d.append(f"M{fmt(p0[0])} {fmt(p0[1])}")
        for s in c:
            if s[0] == "L":
                p = xf(s[2])
                d.append(f"L{fmt(p[0])} {fmt(p[1])}")
            elif s[0] == "Q":
                cc, p = xf(s[2]), xf(s[3])
                d.append(f"Q{fmt(cc[0])} {fmt(cc[1])} {fmt(p[0])} {fmt(p[1])}")
            else:  # cubic
                c1, c2, p = xf(s[2]), xf(s[3]), xf(s[4])
                d.append(
                    f"C{fmt(c1[0])} {fmt(c1[1])} {fmt(c2[0])} {fmt(c2[1])} {fmt(p[0])} {fmt(p[1])}"
                )
        d.append("Z")
    return "".join(d)


# --------------------------------------------------------- the custom stroke
def catmull_to_cubics(pts):
    """Smooth open curve through pts as cubic segments."""
    out = []
    n = len(pts)
    for i in range(n - 1):
        p0 = pts[i - 1] if i > 0 else pts[i]
        p1, p2 = pts[i], pts[i + 1]
        p3 = pts[i + 2] if i + 2 < n else pts[i + 1]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        out.append((c1, c2, p2))
    return out


def stroke_contour(bottom, top):
    """Closed shape: bottom edge L->R, pointed tip, top edge R->L, round cap."""
    segs = []
    start = bottom[0]
    for c1, c2, p in catmull_to_cubics(bottom):
        segs.append(("C", start, c1, c2, p))
        start = p
    # the last bottom point == last top point (pointed tip)
    rev = list(reversed(top))
    for c1, c2, p in catmull_to_cubics(rev):
        segs.append(("C", start, c1, c2, p))
        start = p
    # round pen-landing cap on the left
    cap_c = (bottom[0][0] - 46, (bottom[0][1] + top[0][1]) / 2)
    segs.append(("Q", start, cap_c, bottom[0]))
    return segs


def headline_stroke(x0, x_stems_end, tail):
    """
    One continuous shirorekha.  Bottom edge stays at/below the letter-top so
    every stem tucks cleanly into it; thickness swells like pen pressure, then
    lifts into a tapering swash that rises and drifts away.  All control
    points are proportional to the span so it works for the word and the mark.
    """
    span = x_stems_end - x0
    t = tail
    bottom = [
        (x0, 598),
        (x0 + 0.10 * span, 576),
        (x0 + 0.38 * span, 572),
        (x0 + 0.70 * span, 575),
        (x_stems_end, 574),
        (x_stems_end + 0.28 * t, 590),
        (x_stems_end + 0.62 * t, 624),
        (x_stems_end + t, 690),
    ]
    top = [
        (x0, 642),
        (x0 + 0.10 * span, 636),
        (x0 + 0.38 * span, 640),
        (x0 + 0.70 * span, 644),
        (x_stems_end, 652),
        (x_stems_end + 0.28 * t, 664),
        (x_stems_end + 0.62 * t, 676),
        (x_stems_end + t, 690),
    ]
    return stroke_contour(bottom, top)


# ------------------------------------------------------------------- build
def load_letters():
    f = TTFont(FONT)
    cmap, gs = f.getBestCmap(), f.getGlyphSet()
    letters, x = [], 0
    for ch in TEXT:
        name = cmap[ord(ch)]
        pen = SegPen(gs)
        gs[name].draw(pen)
        clipped = []
        for c in pen.contours:
            r = clip_contour(c, CLIP_Y)
            if r and bbox_h(r) > 6:  # drop stray bar slivers
                clipped.append(r)
        letters.append({"ch": ch, "x": x, "contours": clipped, "adv": gs[name].width})
        x += gs[name].width
    return letters, x


def signed_area(contour):
    # sample curves coarsely; sign is all we need
    pts = []
    for seg in contour:
        a = seg[1]
        pts.append(a)
        if seg[0] in ("Q", "C"):
            pts.append(seg[2])
            if seg[0] == "C":
                pts.append(seg[3])
    area = 0.0
    for i in range(len(pts)):
        x0, y0 = pts[i]
        x1, y1 = pts[(i + 1) % len(pts)]
        area += x0 * y1 - x1 * y0
    return area / 2


def reverse_contour(contour):
    out = []
    for seg in reversed(contour):
        if seg[0] == "L":
            out.append(("L", seg[2], seg[1]))
        elif seg[0] == "Q":
            out.append(("Q", seg[3], seg[2], seg[1]))
        else:
            out.append(("C", seg[4], seg[3], seg[2], seg[1]))
    return out


def match_winding(stroke, reference_contours):
    # outer contours of the letters share one direction; copy it
    ref = max(reference_contours, key=lambda c: abs(signed_area(c)))
    if (signed_area(stroke) > 0) != (signed_area(ref) > 0):
        return reverse_contour(stroke)
    return stroke


def shift(contours, dx):
    out = []
    for c in contours:
        nc = []
        for s in c:
            nc.append((s[0],) + tuple((p[0] + dx, p[1]) for p in s[1:]))
        out.append(nc)
    return out


def extents(contours):
    xs, ys = [], []
    for c in contours:
        for s in c:
            for p in s[1:]:
                xs.append(p[0])
                ys.append(p[1])
    return min(xs), min(ys), max(xs), max(ys)


def build_wordmark():
    letters, total = load_letters()
    body = []
    for l in letters:
        body += shift(l["contours"], l["x"])
    # last stem's right edge sits near the end of the word's advance
    stroke = match_winding(headline_stroke(8, total + 10, 820), body)
    allc = body + [stroke]
    x0, y0, x1, y1 = extents(allc)
    pad = 60
    s = 0.1  # 1000 font units -> 100 svg units
    w, h = (x1 - x0 + 2 * pad) * s, (y1 - y0 + 2 * pad) * s
    xf = Xf(s, (pad - x0) * s, (y1 + pad) * s)
    d = seg_path(allc, xf)
    return {"d": d, "w": round(w, 1), "h": round(h, 1)}


def build_mark():
    letters, _ = load_letters()
    la = letters[0]
    body = la["contours"]
    bx0, by0, bx1, by1 = extents(body)
    stroke = match_winding(headline_stroke(8, bx1 + 6, 330), body)
    allc = body + [stroke]
    x0, y0, x1, y1 = extents(allc)
    side = max(x1 - x0, y1 - y0)
    pad = side * 0.16
    box = side + 2 * pad
    s = 100.0 / box
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    xf = Xf(s, 50 - cx * s, 50 + cy * s)
    d = seg_path(allc, xf)
    return {"d": d}


def svg(w, h, d, fill, bg=None, title="लापता — Lapata"):
    rect = f'<rect width="{w}" height="{h}" fill="{bg}"/>' if bg else ""
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" '
        f'role="img" aria-label="{title}">'
        f"<title>{title}</title>{rect}"
        f'<path fill="{fill}" d="{d}"/></svg>\n'
    )


def main():
    wm = build_wordmark()
    mk = build_mark()
    out = os.path.join(ROOT, "public", "brand")
    os.makedirs(out, exist_ok=True)
    variants = {"indigo": INDIGO, "black": "#0B0B0F", "white": "#FBF8F1"}
    for name, col in variants.items():
        open(os.path.join(out, f"lapata-wordmark-{name}.svg"), "w", encoding="utf-8").write(
            svg(wm["w"], wm["h"], wm["d"], col)
        )
        open(os.path.join(out, f"lapata-mark-{name}.svg"), "w", encoding="utf-8").write(
            svg(100, 100, mk["d"], col, title="Lapata mark")
        )
    # app icon: ivory mark on indigo tile
    icon_d = mk["d"]
    open(os.path.join(ROOT, "src", "app", "icon.svg"), "w", encoding="utf-8").write(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">'
        f'<rect width="100" height="100" rx="22" fill="{INDIGO}"/>'
        f'<g transform="translate(50 50) scale(.78) translate(-50 -50)"><path fill="#FBF8F1" d="{icon_d}"/></g></svg>\n'
    )
    ts = os.path.join(ROOT, "src", "components", "brand", "logo-paths.ts")
    os.makedirs(os.path.dirname(ts), exist_ok=True)
    open(ts, "w", encoding="utf-8").write(
        "// GENERATED by scripts/brand/build_logo.py — do not edit by hand.\n"
        "// Custom Devanagari wordmark for लापता (Lapata).\n"
        f"export const WORDMARK_PATH = {json.dumps(wm['d'])}\n"
        f"export const WORDMARK_VIEWBOX = {{ width: {wm['w']}, height: {wm['h']} }} as const\n"
        f"export const MARK_PATH = {json.dumps(mk['d'])}\n"
    )
    # preview board
    def g(x, y, sc, d, fill):
        return f'<g transform="translate({x} {y}) scale({sc})"><path fill="{fill}" d="{d}"/></g>'
    board = (
        '<svg xmlns="http://www.w3.org/2000/svg" width="1500" height="1000" viewBox="0 0 1500 1000">'
        '<rect width="1500" height="1000" fill="#F6F2EA"/>'
        + g(90, 70, 3.8, wm["d"], INDIGO)
        + '<rect y="480" width="1500" height="520" fill="#0E1030"/>'
        + g(90, 530, 2.4, wm["d"], "#FBF8F1")
        + g(1000, 520, 3.2, mk["d"], "#FBF8F1")
        + '<g transform="translate(1180 560) scale(2.2)"><rect width="100" height="100" rx="22" fill="#1B1F6B"/>'
        + f'<g transform="translate(50 50) scale(.78) translate(-50 -50)"><path fill="#FBF8F1" d="{mk["d"]}"/></g></g>'
        + g(90, 760, 1.0, wm["d"], "#FBF8F1")
        + g(90, 860, 0.5, wm["d"], "#FBF8F1")
        + '<rect x="560" y="740" width="500" height="200" fill="#F6F2EA"/>'
        + g(590, 780, 0.9, wm["d"], INDIGO)
        + g(590, 860, 0.45, wm["d"], "#0B0B0F")
        + "</svg>"
    )
    open(os.path.join(ROOT, "scripts", "brand", "board.svg"), "w", encoding="utf-8").write(board)
    print("wordmark viewBox", wm["w"], wm["h"], "path bytes", len(wm["d"]), "mark bytes", len(mk["d"]))


if __name__ == "__main__":
    main()
