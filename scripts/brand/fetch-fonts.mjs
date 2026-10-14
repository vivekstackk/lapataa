// Downloads OFL-licensed Devanagari source fonts used as the starting
// point for the Lapata wordmark. Run once: node scripts/brand/fetch-fonts.mjs
import { writeFile } from "node:fs/promises"

const families = [
  ["Amita", "400"],
  ["Amita", "700"],
  ["Kalam", "300"],
  ["Kalam", "400"],
]

for (const [family, weight] of families) {
  const css = await (
    await fetch(`https://fonts.googleapis.com/css2?family=${family}:wght@${weight}`)
  ).text()
  const url = css.match(/url\((https:[^)]+\.ttf)\)/)?.[1]
  if (!url) {
    console.log("no ttf for", family, weight)
    continue
  }
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer())
  await writeFile(`scripts/brand/fonts/${family}-${weight}.ttf`, buf)
  console.log("saved", family, weight, buf.length)
}
