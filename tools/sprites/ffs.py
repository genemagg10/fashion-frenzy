import numpy as np, json, os, sys
from PIL import Image
from scipy import ndimage as ndi

def key_sheet(path, band=3, key='g', whiten=False):
    im = np.asarray(Image.open(path).convert('RGB')).astype(np.float32)
    if key=='m':  # magenta: swap so that 'g' slot is the min(r,b) magenta strength
        im = im[...,[1,0,2]]  # r<->g ; key channel now G position holds old R
        # magenta strength = min(r,b)-g ; emulate with r'=old g, g'=min(old r, old b)
        im2 = im.copy(); im2[...,1] = np.minimum(im[...,1], im[...,2]); im2[...,2] = im[...,0]
        orig = np.asarray(Image.open(path).convert('RGB')).astype(np.float32)
        return _key_core(orig, im2, band, key, whiten)
    return _key_core(im, im, band, key, whiten)

def _key_core(orig, im, band, key, whiten):
    r,g,b = im[...,0],im[...,1],im[...,2]
    d = g - np.maximum(r,b)
    # estimate key colour from border pixels
    def _b(a): return np.concatenate([a[:6].reshape(-1,3), a[-6:].reshape(-1,3), a[:,:6].reshape(-1,3), a[:,-6:].reshape(-1,3)])
    border=_b(im); bo=_b(orig)
    bd = border[:,1]-np.maximum(border[:,0],border[:,2])
    K = np.median(border[bd>80],axis=0)
    KO = np.median(bo[bd>80],axis=0)
    Kd = K[1]-max(K[0],K[2])
    hi, lo = 0.62*Kd, 0.22*Kd
    hard = (d > hi) & (g > 0.6*K[1])
    lab, n = ndi.label(hard)
    sizes = ndi.sum(hard, lab, range(1,n+1))
    keep = np.zeros(n+1,bool); keep[1:] = sizes >= 60
    dist = np.sqrt(((im-K)**2).sum(-1))
    mdist = ndi.mean(dist, lab, range(1,n+1))
    keep[1:] |= (mdist < 75)
    hard = keep[lab]
    # key-like stragglers anywhere (pixels very close to the key colour)
    hard |= (dist < 60) & (d > hi)
    near = ndi.binary_dilation(hard, iterations=band) & ~hard
    near |= (d > 0.42*Kd) & (dist < 120) & ~hard & ndi.binary_dilation(hard, iterations=6)
    alpha = np.ones(d.shape, np.float32)
    alpha[hard] = 0
    ramp = np.clip((hi - d)/(hi-lo), 0, 1)
    alpha[near] = ramp[near]
    out = orig.copy()
    # unpremultiply against key colour in band
    a = alpha[...,None]
    sel = near & (alpha > 0.02)
    fg = (orig - (1-a)*KO)/np.maximum(a,1e-3)
    out[sel] = np.clip(fg[sel],0,255)
    # despill in a slightly wider band
    wide = ndi.binary_dilation(hard, iterations=band+2) & ~hard
    wide |= (d > 0.42*Kd) & (dist < 120) & ~hard & ndi.binary_dilation(hard, iterations=6)
    o = out
    if key=='g':
        gm = np.maximum(o[...,0],o[...,2])
        spill = wide & (o[...,1] > gm)
        o[...,1][spill] = gm[spill]
        if whiten:  # white garments: kill any green cast on light pixels anywhere
            mx = o.max(-1); gm2 = np.maximum(o[...,0],o[...,2])
            ws = (mx > 150) & (o[...,1] > gm2+2) & ~hard
            o[...,1][ws] = gm2[ws]+2
    else:
        m = np.minimum(o[...,0],o[...,2]); ex = np.clip(m - o[...,1],0,None)
        sp = wide & (ex>0)
        o[...,0][sp] -= ex[sp]; o[...,2][sp] -= ex[sp]
    if whiten and key=='g':
        mxo = orig.max(-1)
        sheer = (d > 14) & (mxo > 120) & ~hard & (alpha > 0.5)
        asr = np.clip(1 - (d - 10)/(Kd*0.55), 0.4, 1.0)
        a3 = asr[...,None]
        fg2 = np.clip((orig - (1-a3)*KO)/a3, 0, 255)
        out[sheer] = fg2[sheer]
        alpha[sheer] = np.minimum(alpha[sheer], asr[sheer])
        gm2 = np.maximum(out[...,0],out[...,2]); ws = sheer & (out[...,1] > gm2+2)
        out[...,1][ws] = gm2[ws]+2
    alpha[alpha<0.06] = 0
    rgba = np.dstack([np.clip(out,0,255), alpha*255]).astype(np.uint8)
    return rgba

def split_old(rgba, expected=None, join=4, minfrac=0.03):
    a = rgba[...,3] > 70
    m = ndi.binary_dilation(a, iterations=join)
    lab, n = ndi.label(m)
    objs = ndi.find_objects(lab)
    areas = ndi.sum(a, lab, range(1,n+1))
    big = [i for i in range(n) if areas[i] >= minfrac*areas.max()]
    # attach small to nearest big by bbox x-centre
    cx = {i:(objs[i][1].start+objs[i][1].stop)/2 for i in range(n)}
    groups = {i:[i] for i in big}
    for i in range(n):
        if i in big or areas[i] < 4: continue
        j = min(big, key=lambda k: abs(cx[k]-cx[i]))
        # only attach if overlapping x-range of that big comp (sparkles), else drop
        s = objs[j][1]
        if s.start-20 <= cx[i] <= s.stop+20: groups[j].append(i)
    res = []
    for j in sorted(big, key=lambda k: cx[k]):
        mask = np.isin(lab, [x+1 for x in groups[j]])
        crop = rgba.copy(); crop[...,3] = np.where(mask, crop[...,3], 0)
        ys, xs = np.where(crop[...,3] > 0)
        res.append(crop[ys.min():ys.max()+1, xs.min():xs.max()+1])
    if expected and len(res) != expected:
        print(f'  WARNING: found {len(res)} components, expected {expected}', file=sys.stderr)
    return res

def place(sprite, canvas_w, canvas_h, target_h, baseline_pad=6, max_w=None, scale=None):
    im = Image.fromarray(sprite)
    w,h = im.size
    s = scale if scale else target_h/h
    if max_w and w*s > max_w: s = max_w/w
    nw, nh = max(1,round(w*s)), max(1,round(h*s))
    # premultiplied resize to avoid dark/green halos
    arr = np.asarray(im).astype(np.float32)
    pm = arr.copy(); pm[...,:3] *= arr[...,3:4]/255
    pmi = Image.fromarray(np.clip(pm,0,255).astype(np.uint8)).resize((nw,nh), Image.LANCZOS)
    p = np.asarray(pmi).astype(np.float32)
    al = p[...,3:4]
    p[...,:3] = np.where(al>0, p[...,:3]*255/np.maximum(al,1), 0)
    p[...,3] = np.where(p[...,3] < 10, 0, p[...,3])
    small = Image.fromarray(np.clip(p,0,255).astype(np.uint8))
    can = Image.new('RGBA', (canvas_w, canvas_h), (0,0,0,0))
    x = (canvas_w - nw)//2
    y = canvas_h - baseline_pad - nh
    can.alpha_composite(small, (x, max(0,y)))
    return can, dict(scale=round(s,4), drawn=[x,max(0,y),nw,nh])

def checker(w,h,c=12):
    yy,xx = np.mgrid[0:h,0:w]
    v = np.where(((xx//c)+(yy//c))%2==0, 235, 200).astype(np.uint8)
    return Image.fromarray(np.dstack([v,v,v,np.full_like(v,255)]),'RGBA')

def contact(paths, out, cols=8, label=True, bg=None):
    from PIL import ImageDraw
    ims = [Image.open(p).convert('RGBA') for p in paths]
    cw = max(i.width for i in ims)+12; ch = max(i.height for i in ims)+28
    rows = (len(ims)+cols-1)//cols
    sheet = checker(cw*min(cols,len(ims)), ch*rows)
    d = ImageDraw.Draw(sheet)
    for k,(p,i) in enumerate(zip(paths,ims)):
        x = (k%cols)*cw+6; y=(k//cols)*ch+4
        sheet.alpha_composite(i,(x+(cw-12-i.width)//2,y))
        d.rectangle([x-2,y-2,x+cw-10,y+ch-24],outline=(150,150,150,255))
        if label: d.text((x,y+ch-24), os.path.basename(p)[:28], fill=(20,20,20,255))
    sheet.save(out)

def split(rgba, expected=None, minfrac=0.04):
    a = rgba[...,3] > 40
    col = a.sum(0).astype(float)
    # find segments separated by empty columns
    occ = col > 0
    segs=[]; x=0; W=len(col)
    while x<W:
        if occ[x]:
            s0=x
            while x<W and occ[x]: x+=1
            segs.append([s0,x])
        else: x+=1
    tot = col.sum()
    segs=[sg for sg in segs if col[sg[0]:sg[1]].sum() > 0.004*tot]
    # merge tiny segments (sparkles) into neighbours
    def mass(sg): return col[sg[0]:sg[1]].sum()
    big=max(mass(sg) for sg in segs)
    changed=True
    while changed:
        changed=False
        for i,sg in enumerate(segs):
            if mass(sg) < minfrac*big and len(segs)>1:
                j = i-1 if i==len(segs)-1 or (i>0 and sg[0]-segs[i-1][1] < segs[i+1][0]-sg[1]) else i+1
                segs[j]=[min(segs[j][0],sg[0]),max(segs[j][1],sg[1])]; segs.pop(i); changed=True; break
    # split merged figures at deepest valleys
    while expected and len(segs) < expected:
        widths=[sg[1]-sg[0] for sg in segs]
        i=int(np.argmax(widths)); s0,s1=segs[i]
        w=s1-s0; lo=s0+int(w*0.3); hi=s0+int(w*0.7)
        sm=np.convolve(col,np.ones(5)/5,'same')
        cut=lo+int(np.argmin(sm[lo:hi]))
        segs[i:i+1]=[[s0,cut],[cut,s1]]
    res=[]
    for s0,s1 in segs:
        crop=rgba[:,s0:s1].copy()
        # drop disconnected specks far from the main body
        m=crop[...,3]>40
        lab,n=ndi.label(ndi.binary_dilation(m,iterations=6))
        if n>1:
            ar=ndi.sum(m,lab,range(1,n+1)); mx=ar.max()
            keepl=[k+1 for k in range(n) if ar[k]>=0.02*mx]
            crop[...,3]=np.where(np.isin(lab,keepl),crop[...,3],0)
        ys,xs=np.where(crop[...,3]>0)
        res.append(crop[ys.min():ys.max()+1, xs.min():xs.max()+1])
    if expected and len(res)!=expected:
        print(f'  WARNING: found {len(res)} parts, expected {expected}', file=sys.stderr)
    return res

def _seam(alpha, lo, hi):
    H,W = alpha.shape
    cost = alpha[:,lo:hi].astype(float)+0.01
    M = cost.copy(); back=np.zeros_like(M,dtype=int)
    for y in range(1,H):
        prev=M[y-1]
        l=np.r_[np.inf,prev[:-1]]; r=np.r_[prev[1:],np.inf]
        st=np.vstack([l,prev,r]); k=st.argmin(0)
        M[y]+=st[k,np.arange(len(prev))]; back[y]=k-1
    x=int(M[-1].argmin()); xs=[0]*H
    for y in range(H-1,-1,-1):
        xs[y]=x+lo; x=int(np.clip(x+back[y,x],0,hi-lo-1))
    return np.array(xs)

def split2(rgba, expected=None, minfrac=0.04):
    a = rgba[...,3] > 40
    lab,n = ndi.label(a, structure=np.ones((3,3)))
    areas = ndi.sum(a, lab, range(1,n+1)); objs=ndi.find_objects(lab)
    big=[i for i in range(n) if areas[i]>=minfrac*areas.max()]
    masks={i:(lab==i+1) for i in big}
    for i in range(n):
        if i in big or areas[i]<3: continue
        cx=(objs[i][1].start+objs[i][1].stop)/2; cy=(objs[i][0].start+objs[i][0].stop)/2
        cands=[j for j in big if objs[j][1].start-15<=cx<=objs[j][1].stop+15 and objs[j][0].start-30<=cy<=objs[j][0].stop+30]
        if cands:
            j=min(cands,key=lambda j:abs((objs[j][1].start+objs[j][1].stop)/2-cx))
            masks[j]|=(lab==i+1)
    ml=[masks[j] for j in big]
    while expected and len(ml)<expected:
        ws=[np.where(m.any(0))[0] for m in ml]
        i=int(np.argmax([w[-1]-w[0] for w in ws])); m=ml[i]; x0,x1=ws[i][0],ws[i][-1]
        k=round((x1-x0)/(160))  # rough figures inside
        parts=max(2,min(k, expected-len(ml)+1))
        lo=x0+int((x1-x0)/parts*0.6); hi=x0+int((x1-x0)/parts*1.4)
        xs=_seam(m.astype(float),lo,hi)
        left=m & (np.arange(m.shape[1])[None,:]<xs[:,None]); right=m&~left
        ml[i:i+1]=[left,right]
    ml.sort(key=lambda m: np.where(m.any(0))[0].mean())
    res=[]
    for m in ml:
        crop=rgba.copy(); crop[...,3]=np.where(m,crop[...,3],0)
        # include soft edge pixels (alpha<=40) adjacent to mask
        soft=ndi.binary_dilation(m,iterations=2)&(rgba[...,3]>0)&(rgba[...,3]<=40)
        crop[...,3]=np.where(m|soft,rgba[...,3],0)
        ys,xs=np.where(crop[...,3]>0)
        res.append(crop[ys.min():ys.max()+1, xs.min():xs.max()+1])
    if expected and len(res)!=expected:
        print(f'  WARNING: found {len(res)} parts, expected {expected}', file=sys.stderr)
    return res

def _segments(occ):
    segs=[];x=0;W=len(occ)
    while x<W:
        if occ[x]:
            s0=x
            while x<W and occ[x]: x+=1
            segs.append((s0,x))
        else: x+=1
    return segs

def split3(rgba, expected, src_rgb=None, minseg=12):
    import cv2
    a = rgba[...,3] > 40
    ys = np.where(a.any(1))[0]; y0,y1 = ys[0], ys[-1]
    seeds=None
    for frac in (0.45,0.4,0.5,0.35,0.55,0.3,0.6,0.25,0.65,0.2):
        band = a[y0:y0+int((y1-y0)*frac)]
        segs=[s for s in _segments(band.any(0)) if s[1]-s[0]>=minseg and band[:,s[0]:s[1]].sum()>200]
        if len(segs)==expected: seeds=(segs,frac); break
    if seeds is None:
        print('  WARNING: no seed band found; falling back to split2', file=sys.stderr)
        return split2(rgba, expected)
    segs,frac=seeds
    H,W=a.shape
    markers=np.zeros((H,W),np.int32)
    yb=y0+int((y1-y0)*frac)
    for k,(s0,s1) in enumerate(segs):
        sub=np.zeros_like(a); sub[y0:yb, s0:s1]=a[y0:yb, s0:s1]
        markers[sub]=k+1
        # spine: vertical line under the torso centre anchors the lower body
        yy,xx=np.where(sub[max(y0,yb-int((y1-y0)*0.12)):yb])
        cx=int(np.median(xx)) if len(xx) else (s0+s1)//2
        col=a[yb:y1+1, cx-1:cx+2]
        markers[yb:y1+1, cx-1:cx+2][col]=k+1
    bg = ~ndi.binary_dilation(a, iterations=1)
    markers[bg]=expected+1
    img = rgba[...,:3].copy()
    img = np.ascontiguousarray(img[..., ::-1])
    cv2.watershed(img, markers)
    # fill -1 boundaries by nearest label
    lab=markers.copy(); lab[(lab==expected+1)|(lab<0)]=0
    idx = ndi.distance_transform_edt(lab==0, return_distances=False, return_indices=True)
    full = lab[idx[0],idx[1]]
    res=[]
    for k in range(1,expected+1):
        m = a & (full==k)
        l2,n2=ndi.label(m,structure=np.ones((3,3)))
        if n2>1:
            ar=ndi.sum(m,l2,range(1,n2+1)); mx=ar.max()
            m=np.isin(l2,[i+1 for i in range(n2) if ar[i]>=0.01*mx])
        soft=ndi.binary_dilation(m,iterations=2)&(rgba[...,3]>0)&~a
        crop=rgba.copy(); crop[...,3]=np.where(m|soft,rgba[...,3],0)
        yy,xx=np.where(crop[...,3]>0)
        res.append(crop[yy.min():yy.max()+1, xx.min():xx.max()+1])
    return res
