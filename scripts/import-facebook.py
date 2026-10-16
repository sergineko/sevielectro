"""Import only photos selected and downloaded from the public company page."""
from pathlib import Path
from urllib.parse import urlparse, parse_qs
from PIL import Image, ImageOps, ImageDraw
import json, shutil

root=Path(__file__).resolve().parent.parent
output=root/'public/media/social'; output.mkdir(parents=True,exist_ok=True)
names={26:'oficinas-iluminacion',21:'zona-atencion',28:'iluminacion-salon',29:'luminarias-lineales',24:'recepcion-comercial',0:'instalacion-industrial',3:'canalizacion-electrica',7:'bandejas-cableado'}
captures=json.loads((root/'migration/facebook-captures.json').read_text(encoding='utf-8'))
metadata={}; sources=[]
sheet=Image.new('RGB',(1200,660),'#edf3f6'); draw=ImageDraw.Draw(sheet)
for i,capture in enumerate(captures):
    name='facebook-'+names[capture['index']]+'.jpg'
    original=output/name
    shutil.copyfile(capture['path'],original)
    with Image.open(original) as raw:
        image=ImageOps.exif_transpose(raw).convert('RGB'); width,height=image.size
        thumb=image.copy(); thumb.thumbnail((900,900))
        thumb.save(output/(name+'.webp'),'WEBP',quality=86,method=6)
        preview=image.copy(); preview.thumbnail((285,285))
        x=(i%4)*300; y=(i//4)*330
        sheet.paste(preview,(x+(290-preview.width)//2,y))
        draw.text((x+4,y+290),name[:40],fill='#122c3e')
    photo_id=parse_qs(urlparse(capture['source']).query)['fbid'][0]
    source='https://www.facebook.com/photo.php?fbid='+photo_id
    metadata[name]={'src':'/media/social/'+name+'.webp','width':width,'height':height,'original':'/media/social/'+name}
    sources.append({'local':'/media/social/'+name,'source':source,'width':width,'height':height})
(root/'src/data/social-media.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2),encoding='utf-8')
(root/'migration/social-sources.json').write_text(json.dumps({'account':'https://www.facebook.com/Sevielectro/','assets':sources},ensure_ascii=False,indent=2),encoding='utf-8')
sheet.save(root/'migration/facebook-contact-sheet.jpg')
print(f'Imported {len(metadata)} company photos, with local originals and thumbnails.')
