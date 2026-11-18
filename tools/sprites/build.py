import sys, os, json, colorsys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ffs import *
from ffs import _segments
import numpy as np
from PIL import Image

REPO = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'public', 'sprites')
OUT = REPO
manifest = []

def save(img, rel, **meta):
    p = os.path.join(OUT, rel); os.makedirs(os.path.dirname(p), exist_ok=True)
    img.save(p, optimize=True)
    meta.update(file='sprites/'+rel, size=list(img.size))
    manifest.append(meta)
    return p

def garment_mask(img, top_frac=0.0, head_drop_frac=0.0):
    a = np.asarray(img).astype(np.float32)/255
    r,g,b,al = a[...,0],a[...,1],a[...,2],a[...,3]
    mx = np.maximum(np.maximum(r,g),b); mn = np.minimum(np.minimum(r,g),b)
    S = np.where(mx>0,(mx-mn)/np.maximum(mx,1e-6),0); V = mx
    # hue in degrees
    hsv = np.asarray(img.convert('RGB').convert('HSV')).astype(np.float32)
    H = hsv[...,0]/255*360
    m = np.clip((0.24 - S)/0.08, 0, 1) * np.clip((V - 0.50)/0.12, 0, 1)
    warm = (H > 5) & (H < 55) & (S > 0.10)   # skin, cream torso, wood, gold
    m[warm] = 0
    m *= (al > 0.05)
    hard = m > 0.35
    h = img.size[1]
    ys = np.where(al.any(1))[0] if al.any() else [0]
    top = ys[0]; bot = ys[-1]
    lab, n = ndi.label(hard, structure=np.ones((3,3)))
    if n:
        areas = ndi.sum(hard, lab, range(1,n+1)); cy = ndi.center_of_mass(hard, lab, range(1,n+1))
        tot = areas.sum()
        drop = [i+1 for i in range(n) if areas[i] < 0.015*tot and cy[i][0] < top + head_drop_frac*(bot-top)] if head_drop_frac else []
        drop += [i+1 for i in range(n) if areas[i] < 6]
        if drop:
            dm = np.isin(lab, drop)
            dm = ndi.binary_dilation(dm, iterations=1)
            m[dm] = 0
    if top_frac:
        m[: int(top + top_frac*(bot-top))] = 0
    out = np.zeros(a.shape, np.uint8); out[...,:3] = 255; out[...,3] = (np.clip(m,0,1)*al*255).astype(np.uint8)
    return Image.fromarray(out, 'RGBA')

def tint(img, mask, hexcol):
    c = np.array([int(hexcol[i:i+2],16) for i in (1,3,5)], np.float32)/255
    a = np.asarray(img).astype(np.float32)/255; mk = np.asarray(mask).astype(np.float32)[...,3:4]/255
    t = a.copy(); t[...,:3] = a[...,:3]*c
    o = a.copy(); o[...,:3] = a[...,:3]*(1-mk) + t[...,:3]*mk
    return Image.fromarray((np.clip(o,0,1)*255).astype(np.uint8),'RGBA')

def sheet_parts(name, n, key='g', whiten=False, rows=1):
    rg = key_sheet(f'sheets/{name}.jpg', key=key, whiten=whiten)
    if rows == 1:
        return split3(rg, n)
    a = rg[...,3] > 40
    occ = a.any(1); segs = [s for s in _segments(occ) if a[s[0]:s[1]].sum() > 2000]
    # merge to `rows` row bands by largest gaps
    while len(segs) > rows:
        gaps = [segs[i+1][0]-segs[i][1] for i in range(len(segs)-1)]
        i = int(np.argmin(gaps)); segs[i:i+2] = [(segs[i][0], segs[i+1][1])]
    parts = []
    per = n//rows
    for s0,s1 in segs:
        sub = rg.copy(); sub[:max(0,s0-2)] = 0; sub[s1+2:] = 0
        parts += split3(sub, per)
    return parts

def layout(parts, cw, ch, maxh, maxw, align='bottom', per_item=False, pad=6):
    if per_item:
        scales = [min(maxh/p.shape[0], maxw/p.shape[1]) for p in parts]
    else:
        s = min(maxh/max(p.shape[0] for p in parts), maxw/max(p.shape[1] for p in parts))
        scales = [s]*len(parts)
    outs = []
    for p, s in zip(parts, scales):
        img, info = place(p, cw, ch, None, baseline_pad=pad, scale=s)
        if align == 'top':
            x,y,w,h = info['drawn']
            img2 = Image.new('RGBA',(cw,ch),(0,0,0,0)); img2.alpha_composite(img.crop((0,y,cw,y+h)),(0,pad+4))
            img = img2; info['drawn'] = [x,pad+4,w,h]
        outs.append((img, info))
    return outs

GOWNS_A = ['ball-gown','princess-gown','mermaid-gown','sunset-chiffon','garden-roses','starry-gown']
GOWNS_B = ['butterfly-cape','tiered-ruffle','ice-crystal','candy-party','peacock-train','cherry-kimono']
EVERY_C = ['sunny-dress','rain-coat','twirl-set','hero-cape','garden-gown']
EVERY_D = ['puff-pencil','palazzo','crop-jacket','pleat-parade','jumpsuit']
NAMES = {'ball-gown':'Tulle Ball Gown','princess-gown':'Princess Gown','mermaid-gown':'Mermaid Gown','sunset-chiffon':'Sunset Chiffon','garden-roses':'Flower Garden Gown','starry-gown':'Starry Night Gown','butterfly-cape':'Butterfly Cape Dress','tiered-ruffle':'Ruffled Tier Gown','ice-crystal':'Ice Crystal Gown','candy-party':'Candy Party Dress','peacock-train':'Peacock Train','cherry-kimono':'Cherry Blossom Wrap','sunny-dress':'Sunny Dress','rain-coat':'Rain Coat','twirl-set':'Twirl Set','hero-cape':'Hero Cape','garden-gown':'Garden Gown','puff-pencil':'Puff & Pencil','palazzo':'Palazzo Day','crop-jacket':'Cropped Jacket','pleat-parade':'Pleat Parade','jumpsuit':'One-Piece Wonder'}
SIG = {'ball-gown':'blush','princess-gown':'sky','mermaid-gown':'sea','sunset-chiffon':'sunset (rose to butter fade)','garden-roses':'sage with rose embroidery','starry-gown':'navy with gold stars','butterfly-cape':'lilac','tiered-ruffle':'peach/coral','ice-crystal':'sky (icy pale)','candy-party':'candy pastels (blush/mint/butter stripes)','peacock-train':'leaf (emerald) with jewel eyes','cherry-kimono':'blush with cherry obi','sunny-dress':'butter','rain-coat':'sea','twirl-set':'rose','hero-cape':'navy dress + cherry cape','garden-gown':'blush','puff-pencil':'lilac','palazzo':'marigold + cream','crop-jacket':'cherry','pleat-parade':'sage','jumpsuit':'plum'}
groups = [('a',GOWNS_A),('b',GOWNS_B),('c',EVERY_C),('d',EVERY_D)]

only = set(sys.argv[1:])
def want(k): return not only or k in only

if want('models'):
    for g, ids in groups:
        parts = sheet_parts(f'models_sig_{g}', len(ids))
        if g == 'b':  # sheer wing cape / ice sleeve show the green through: use the sheer-aware key for those two
            pw = sheet_parts('models_sig_b', len(ids), whiten=True)
            parts[0] = pw[0]; parts[2] = pw[2]
        for (img,info), gid in zip(layout(parts,256,352,336,250,per_item=True), ids):
            save(img, f'models/signature/{gid}.png', category='model-signature', garment=gid, name=NAMES[gid], color=SIG[gid], tintable=False, anchor='bottom-center', baseline_y=346, usage='Runway / rival / showcase figure in its signature colorway. Draw at (x - w/2, floorY - 346).')
        parts = sheet_parts(f'models_tint_{g}', len(ids), whiten=True)
        for (img,info), gid in zip(layout(parts,256,352,336,250,per_item=True), ids):
            save(img, f'models/tint/{gid}.png', category='model-tint-base', garment=gid, name=NAMES[gid], color='white (tint base)', tintable=True, mask=f'sprites/models/tint/{gid}.mask.png', anchor='bottom-center', baseline_y=346, usage='Player-designed look: draw this, then multiply the chosen palette color through the matching .mask.png (see README).')
            mk = garment_mask(img, head_drop_frac=0.40)
            save(mk, f'models/tint/{gid}.mask.png', category='model-tint-mask', garment=gid, color=None, anchor='bottom-center', baseline_y=346, usage='Alpha = how much of the palette color to apply at that pixel (garment fabric only; skin, hair, gold trim excluded).')

if want('garments'):
    for g, ids in groups:
        parts = sheet_parts(f'garments_{g}', len(ids), whiten=True)
        for (img,info), gid in zip(layout(parts,256,320,300,248,align='top'), ids):
            save(img, f'garments/{gid}.png', category='garment', garment=gid, name=NAMES[gid], color='white (tint base)', tintable=True, mask=f'sprites/garments/{gid}.mask.png', anchor='top-center (neckline at y=10)', usage='Garment alone (no body): sketchbook pages, shelf, cards, pattern preview. Tint with the mask.')
            save(garment_mask(img), f'garments/{gid}.mask.png', category='garment-mask', garment=gid, color=None, anchor='top-center', usage='Tint mask for the garment sprite.')

if want('forms'):
    states = ['empty','draped-pinned','pattern-pinned','half-sewn','finished-simple']
    parts = sheet_parts('forms_states', 5)
    for (img,info), st in zip(layout(parts,240,352,336,236), states):
        save(img, f'forms/form-{st}.png', category='dress-form', garment=None, state=st, color='cream form, undyed muslin', tintable=False, anchor='bottom-center', baseline_y=346, usage='Generic studio sewing steps in undyed muslin (a toile/mock-up): empty form -> draped & pinned -> pattern pinned with tape -> half-sewn with needle -> finished simple dress. Not tintable (muslin is warm cream like the form); show the player color on the garment-specific forms/<garment>.png at the reveal.')
    for g, ids in groups:
        parts = sheet_parts(f'forms_{g}', len(ids), whiten=True)
        for (img,info), gid in zip(layout(parts,240,352,336,236), ids):
            save(img, f'forms/{gid}.png', category='dress-form', garment=gid, name=NAMES[gid], state='finished', color='white (tint base)', tintable=True, mask=f'sprites/forms/{gid}.mask.png', anchor='bottom-center', baseline_y=346, usage='Finished garment on the dress form (end of sewing / reveal). Tint with the mask.')
            save(garment_mask(img), f'forms/{gid}.mask.png', category='dress-form-mask', garment=gid, color=None, anchor='bottom-center', baseline_y=346, usage='Tint mask.')

CUST = {'customers_a':['lila','theo','noor','jo','amos'], 'customers_b':['bea','rio','sasha','jules']}
CDESC = {'lila':'Lila (puffs, pink tee dress)','theo':'Theo (glasses, teal hoodie)','noor':'Noor (green hijab, magenta dress)','jo':'Jo (locs, yellow tee, plum pants)','amos':'Amos (ponytail, cream shirt, navy)','bea':'Bea (blonde bun, purple dress, butter cardigan)','rio':'Rio (auburn curls, freckles, orange dress)','sasha':'Sasha (braid, cream sweater, teal skirt)','jules':'Jules (beret, show host with mic)'}
EXPR = ['happy','love','thinking','disappointed']
if want('customers'):
    for sh, ids in CUST.items():
        parts = sheet_parts(sh, len(ids))
        for (img,info), cid in zip(layout(parts,256,352,336,250), ids):
            save(img, f'customers/full/{cid}.png', category='customer-full', customer=cid, name=CDESC[cid], color='street clothes', anchor='bottom-center', baseline_y=346, usage='Customer walking in / standing at the counter.')
    for cid in CDESC:
        parts = sheet_parts(f'bust_{cid}', 4)
        for (img,info), ex in zip(layout(parts,256,256,244,250), EXPR):
            save(img, f'customers/bust/{cid}-{ex}.png', category='customer-bust', customer=cid, expression=ex, color=None, anchor='bottom-center (chest cut line at y=250)', baseline_y=250, usage='Reaction portrait: happy=good match, love=great match/secret wish, thinking=close, disappointed=off.')

if want('pip'):
    parts = sheet_parts('pip', 6)
    for (img,info), ex in zip(layout(parts,192,192,180,186), ['happy','love','thinking','disappointed','surprised','cheer']):
        save(img, f'pip/pip-{ex}.png', category='pip', expression=ex, color=None, anchor='bottom-center', baseline_y=186, usage='Pip the tomato-pincushion helper, next to hint text.')

if want('runway'):
    parts = sheet_parts('runway_photographers', 4)
    names = ['photographer-kneel','photographer-stand','fx-flash','trophy']
    outs = layout(parts[:2],256,288,272,250) + layout(parts[2:],192,192,176,176,per_item=True)
    for (img,info), nm in zip(outs, names):
        save(img, f'runway/{nm}.png', category='runway', id=nm, color=None, anchor='bottom-center', baseline_y=img.size[1]-6, usage={'photographer-kneel':'Photographer at the runway edge (flip horizontally for the other side).','photographer-stand':'Standing photographer.','fx-flash':'Camera flash burst; scale/fade in for a flash beat.','trophy':'Award / win card.'}[nm])
    parts = sheet_parts('runway_crowd', 8, rows=2)
    cn = ['crowd-girl-clap','crowd-boy-cheer','crowd-grandma','crowd-kid-lightstick','crowd-girl-hearteyes','crowd-boy-wave','crowd-teen-phone','crowd-dad-clap']
    for (img,info), nm in zip(layout(parts,224,224,212,218), cn):
        save(img, f'runway/{nm}.png', category='runway-crowd', id=nm, color=None, anchor='bottom-center (chest cut line)', baseline_y=218, usage='Audience bust for the runway front row; bob 2-4px for cheering.')

if want('props'):
    parts = split(key_sheet('sheets/props.jpg'), 6)
    names = ['clothes-rack','mirror',None,'sewing-machine','fabric-bolts','pincushion-kit']
    keep = [(p,n) for p,n in zip(parts,names) if n]
    pp = sheet_parts('props_plants', 2, key='m')
    outs = layout([p for p,_ in keep],256,256,240,248) 
    for (img,info),(p,nm) in zip(outs, keep):
        save(img, f'props/{nm}.png', category='prop', id=nm, color=None, anchor='bottom-center', baseline_y=250, usage='Shop decor.')
    for (img,info), nm in zip(layout(pp,256,256,240,248), ['plant-monstera','flowers-pot']):
        save(img, f'props/{nm}.png', category='prop', id=nm, color=None, anchor='bottom-center', baseline_y=250, usage='Shop decor (flowers-pot fits the "Window flowers" decor item).')

mf = os.path.join(OUT, f'_manifest_part_{"_".join(sorted(only)) or "all"}.json')
json.dump(manifest, open(mf,'w'), indent=1)
print(len(manifest), 'files')
