from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.recordingPen import RecordingPen
text = "लापता"
svg = ['<svg xmlns="http://www.w3.org/2000/svg" width="1500" height="760" viewBox="0 0 1500 760"><rect width="1500" height="760" fill="#f6f2ea"/>']
y = 330
for name in ["Kalam-300","Kalam-400"]:
    f = TTFont(f"scripts/brand/fonts/{name}.ttf")
    cmap = f.getBestCmap(); gs = f.getGlyphSet()
    x = 0
    svg.append(f'<g transform="translate(60 {y}) scale(0.34 -0.34)">')
    for ch in text:
        g = cmap[ord(ch)]
        pen = SVGPathPen(gs); gs[g].draw(pen)
        svg.append(f'<path transform="translate({x} 0)" d="{pen.getCommands()}" fill="#1b1f6b" fill-opacity=".9"/>')
        x += gs[g].width
    for yy in (560, 585, 600):
        svg.append(f'<line x1="0" x2="2600" y1="{yy}" y2="{yy}" stroke="red" stroke-width="2"/>')
    svg.append('</g>')
    svg.append(f'<text x="60" y="{y+40}" font-size="20" font-family="monospace">{name} (red = y 560/585/600)</text>')
    y += 380
svg.append('</svg>')
open("scripts/brand/inspect.svg","w",encoding="utf-8").write("\n".join(svg))
# raw dump of Kalam-300 aa-matra and la
f = TTFont("scripts/brand/fonts/Kalam-300.ttf"); gs = f.getGlyphSet(); cm=f.getBestCmap()
for ch in "ा":
    rp = RecordingPen(); gs[cm[ord(ch)]].draw(rp)
    for op in rp.value: print(op)
