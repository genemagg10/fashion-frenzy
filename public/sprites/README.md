# Fashion Frenzy sprite pack (v1)

Cozy pixel-art chibi sprites for the art swap. Every file is listed in `manifest.json`, with its category, garment or customer id, color, canvas size, anchor/baseline and how to use it.

| Folder | What | Canvas | Anchor |
|---|---|---|---|
| `models/signature/<garment>.png` | Full model wearing each of the 22 garments in one fixed "signature" colorway. Use for rivals, the title, lookbook and covers. | 256×352 | bottom-center, feet at y=346 |
| `models/tint/<garment>.png` + `.mask.png` | The same 22 looks in **white**, plus a fabric mask, for player-chosen colors | 256×352 | bottom-center, feet at y=346 |
| `garments/<garment>.png` + `.mask.png` | Garment alone, no body: for sketchbook pages, patterns, the shelf and cards | 256×320 | top-center, neckline at y≈10 |
| `forms/form-<state>.png` | Sewing steps on the dress form: empty → draped-pinned → pattern-pinned → half-sewn → finished-simple. These are undyed muslin and are not tinted. | 240×352 | bottom-center, feet at y=346 |
| `forms/<garment>.png` + `.mask.png` | Each finished garment on the dress form, in white, with a mask | 240×352 | bottom-center, feet at y=346 |
| `customers/full/<id>.png` | Lila, Theo, Noor, Jo, Amos, Bea, Rio and Sasha, plus Jules (show host) | 256×352 | bottom-center, feet at y=346 |
| `customers/bust/<id>-<happy\|love\|thinking\|disappointed>.png` | Reaction portraits | 256×256 | bottom-center, chest cut at y=250 |
| `pip/pip-<happy\|love\|thinking\|disappointed\|surprised\|cheer>.png` | Pip, the tomato-pincushion helper | 192×192 | bottom-center |
| `runway/` | 2 photographers, a flash FX, a trophy and 8 crowd busts | 256×288, 192², 224² | bottom-center |
| `props/` | Clothes rack, mirror, monstera, window flowers, sewing machine, fabric bolts and a pincushion kit | 256×256 | bottom-center, y=250 |

Garment ids match `SketchId` on `cursor/pixel-chibi-4499`: ball-gown, princess-gown, mermaid-gown, sunset-chiffon, garden-roses, starry-gown, butterfly-cape, tiered-ruffle, ice-crystal, candy-party, peacock-train, cherry-kimono, sunny-dress, rain-coat, twirl-set, hero-cape, garden-gown, puff-pencil, palazzo, crop-jacket, pleat-parade, jumpsuit.

## Colors: tint-base + mask

The game has 16 palette colors × 22 garments, plus 9 fabrics. That's too many combinations to pre-render consistently. So each tintable sprite is white fabric with soft grey-lavender shading, and it comes with a `.mask.png`. The mask's alpha marks the fabric only. Skin, hair, eyes, gold trim, jewels, pins, the form and the wood are all excluded. Multiplying a palette hex through the mask gives exactly that palette color and keeps the shading.

```js
function tinted(base, mask, hex) {          // HTMLImageElement x2, '#E56B93'
  const c = document.createElement('canvas'); c.width = base.width; c.height = base.height;
  const x = c.getContext('2d');
  x.drawImage(base, 0, 0);
  x.globalCompositeOperation = 'multiply'; x.fillStyle = hex; x.fillRect(0, 0, c.width, c.height);
  x.globalCompositeOperation = 'destination-in'; x.drawImage(mask, 0, 0);   // keep fabric only
  const o = document.createElement('canvas'); o.width = c.width; o.height = c.height;
  const y = o.getContext('2d'); y.drawImage(base, 0, 0); y.drawImage(c, 0, 0);
  return o;                                  // cache per sprite+color
}
```

**Fabrics.** After the multiply step, draw the pattern tile (stripes, dots, florals, sequins and so on) onto the tinted layer with `globalCompositeOperation = 'source-atop'` at 35–60% alpha. The mask keeps the pattern clipped to the fabric. Then draw the layer over the base.

Very light colors (cream, blush) come out close to the white base. Very dark ones (ink, navy) keep their shading but read darker, which is expected with multiply.

## Regenerating

`tools/sprites/` has the pipeline: chroma key with soft edges and unpremultiply, despill, a sheer-fabric pass, watershed slicing, baseline placement and mask generation. The raw generated sheets live outside the repo, on the box at `/workspace/fashion-frenzy-sprites/sheets/`.
