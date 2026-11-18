import json,os,sys,glob
from collections import Counter
sys.path.insert(0,'/workspace/fashion-frenzy-sprites')
from ffs import contact, checker
from PIL import Image
sys.argv=['x','none']
exec(open('/workspace/fashion-frenzy-sprites/build.py').read().split("GOWNS_A =")[0])
R='/workspace/ff-assets/public/sprites'; O='/workspace/fashion-frenzy-sprites'
parts=json.load(open(R+'/_manifest_part_all.json')); os.remove(R+'/_manifest_part_all.json')
palette=[{'id':'blush','hex':'#F4B8C8'},{'id':'rose','hex':'#E56B93'},{'id':'cherry','hex':'#C23B4B'},{'id':'peach','hex':'#F3A57A'},{'id':'butter','hex':'#F6D56B'},{'id':'marigold','hex':'#E8943A'},{'id':'sage','hex':'#A8C3A0'},{'id':'leaf','hex':'#3E8F62'},{'id':'sky','hex':'#8EC6E6'},{'id':'sea','hex':'#2F7C8A'},{'id':'navy','hex':'#24315C'},{'id':'lilac','hex':'#CDB4E4'},{'id':'plum','hex':'#7A4E8A'},{'id':'cream','hex':'#F7F1E6'},{'id':'cocoa','hex':'#6B4332'},{'id':'ink','hex':'#2C3338'}]
m={
 'name':'Fashion Frenzy sprite pack v1',
 'style':'High-detail cozy pixel-art chibi (big sparkly eyes, soft shading, colored outlines), generated from one shared style reference, keyed from #00FF00 (plants from #FF00FF).',
 'basePath':"public/sprites/ -> load with `${import.meta.env.BASE_URL}sprites/<file minus the leading 'sprites/'>` (file paths below are relative to public/).",
 'rendering':'Sources are soft-edged pixel art (not a strict 1px grid): draw at 1x or downscale with imageSmoothingEnabled=true; avoid upscaling past ~1.5x. Anchor is bottom-center unless noted; baseline_y is the floor/cut line inside the canvas, so draw at (x - width/2, floorY - baseline_y).',
 'colorway':{
   'approach':'tint-base + mask',
   'why':'16 palette colors x 22 garments (352 combos) plus 9 fabrics is too many to pre-render consistently. Each tintable sprite is drawn in white fabric with grey-lavender shading and ships a .mask.png whose alpha marks fabric pixels only (skin, hair, eyes, gold trim, jewels, pins, form and wood excluded). Multiplying the palette hex through the mask gives the exact palette color with shading kept.',
   'recipe_js':"function tinted(base, mask, hex){ const c=document.createElement('canvas'); c.width=base.width; c.height=base.height; const x=c.getContext('2d'); x.drawImage(base,0,0); x.globalCompositeOperation='multiply'; x.fillStyle=hex; x.fillRect(0,0,c.width,c.height); x.globalCompositeOperation='destination-in'; x.drawImage(mask,0,0); const o=document.createElement('canvas'); o.width=c.width; o.height=c.height; const y=o.getContext('2d'); y.drawImage(base,0,0); y.drawImage(c,0,0); return o; } // cache per sprite+color",
   'fabrics':"Patterns (stripes, polka, floral, denim, sequins, velvet, tulle, rainbow): after the multiply step, draw the pattern tile onto the tinted layer with globalCompositeOperation='source-atop' at ~35-60% alpha (it stays clipped to the fabric), then composite over the base.",
   'signature':'models/signature/* are fixed, pre-colored showcase versions (one colorway each): rivals, title/cover, lookbook, anywhere the player did not choose a color.',
   'not_tintable':'forms/form-*.png sewing-step states are undyed muslin by design.'
 },
 'palette':palette,
 'counts':dict(Counter(p['category'] for p in parts)),
 'files':parts,
}
json.dump(m,open(R+'/manifest.json','w'),indent=1)
print(len(parts), m['counts'])
for f in glob.glob(O+'/contact-*.png'): os.remove(f)
nm=lambda d: sorted(p for p in glob.glob(R+d+'/*.png') if '.mask' not in p)
contact(nm('/models/signature'), O+'/contact-models-signature.png', cols=6)
contact(nm('/models/tint'), O+'/contact-models-tint-base.png', cols=6)
contact(nm('/garments'), O+'/contact-garments.png', cols=6)
contact(nm('/forms'), O+'/contact-dress-forms.png', cols=7)
contact(nm('/customers/full')+nm('/pip'), O+'/contact-customers-full-and-pip.png', cols=8)
contact(nm('/customers/bust'), O+'/contact-customer-busts.png', cols=8)
contact(nm('/runway')+nm('/props'), O+'/contact-runway-and-props.png', cols=7)
ms=sorted(glob.glob(R+'/models/tint/*.mask.png'))
W,H=256,352; sh=Image.new('RGBA',(W*6,H*4),(60,40,90,255))
for k,p in enumerate(ms): sh.alpha_composite(Image.open(p),((k%6)*W,(k//6)*H))
sh.resize((sh.width//2,sh.height//2)).save(O+'/contact-models-tint-masks.png')
cols=['#E56B93','#8EC6E6','#3E8F62','#F6D56B','#7A4E8A','#C23B4B','#24315C','#F3A57A']
ids=[p.split('/')[-1][:-4] for p in nm('/models/tint')]
sheet=checker(W*len(cols),H*len(ids))
for r,i in enumerate(ids):
    b=Image.open(f'{R}/models/tint/{i}.png'); mk=Image.open(f'{R}/models/tint/{i}.mask.png')
    for c,col in enumerate(cols): sheet.alpha_composite(tint(b,mk,col),(c*W,r*H))
sheet.resize((sheet.width//3,sheet.height//3),Image.LANCZOS).save(O+'/contact-tint-demo-models.png')
gids=[p.split('/')[-1][:-4] for p in nm('/garments')]
GW,GH=256,320; sheet=checker(GW*6,GH*4)
for k,g in enumerate(gids):
    b=Image.open(f'{R}/garments/{g}.png'); mk=Image.open(f'{R}/garments/{g}.mask.png')
    sheet.alpha_composite(tint(b,mk,cols[k%8]),((k%6)*GW,(k//6)*GH))
sheet.resize((sheet.width//2,sheet.height//2),Image.LANCZOS).save(O+'/contact-tint-demo-garments.png')
FW,FH=240,352; fids=[p.split('/')[-1][:-4] for p in nm('/forms') if '/form-' not in p]
sheet=checker(FW*6,FH*4)
for k,g in enumerate(fids):
    b=Image.open(f'{R}/forms/{g}.png'); mk=Image.open(f'{R}/forms/{g}.mask.png')
    sheet.alpha_composite(tint(b,mk,cols[(k+3)%8]),((k%6)*FW,(k//6)*FH))
sheet.resize((sheet.width//2,sheet.height//2),Image.LANCZOS).save(O+'/contact-tint-demo-forms.png')
