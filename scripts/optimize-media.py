"""Create delivery copies; imported original files remain untouched."""
from PIL import Image, ImageOps
from pathlib import Path
import json
root=Path(__file__).resolve().parent.parent
output=root/'public/media/optimized'; output.mkdir(parents=True,exist_ok=True)
inventory=json.loads((root/'migration/inventory.json').read_text(encoding='utf-8'))
metadata={}
for asset in inventory['assets']:
    name=asset['local'].rsplit('/',1)[-1]
    path=root/'public'/asset['local'].lstrip('/')
    with Image.open(path) as image:
        image=ImageOps.exif_transpose(image)
        size=image.size
        image.thumbnail((1600,1200))
        target=output/(path.name+'.webp')
        if not target.exists(): image.save(target,'WEBP',quality=84,method=6)
        metadata[name]={'src':'/media/optimized/'+target.name,'width':size[0],'height':size[1],'original':asset['local']}
(root/'src/data').mkdir(exist_ok=True)
social_metadata=root/'src/data/social-media.json'
if social_metadata.exists(): metadata.update(json.loads(social_metadata.read_text(encoding='utf-8')))
(root/'src/data/media.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2),encoding='utf-8')
expected={Path(asset['src']).name for asset in metadata.values()}
for old in output.glob('*.webp'):
    if old.name not in expected:
        assert old.resolve().parent==output.resolve()
        old.unlink()
redirects=['/index.php / 301','/wp-sitemap.xml /sitemap.xml 301','/sitemap_index.xml /sitemap.xml 301']
from urllib.parse import urlparse
mapped=set()
for asset in inventory['assets']:
    source_path=urlparse(asset['source']).path
    redirects.append(source_path+' '+asset['local']+' 301'); mapped.add(source_path)
for image in inventory['images']:
    for variant in image.get('srcset','').split(','):
        parts=variant.strip().split()
        if not parts: continue
        source_path=urlparse(parts[0]).path
        if source_path in mapped: continue
        name=Path(urlparse(image['src']).path).name
        if name in metadata:
            redirects.append(source_path+' '+metadata[name]['original']+' 301'); mapped.add(source_path)
(root/'public/_redirects').write_text('\n'.join(redirects)+'\n',encoding='utf-8')
print(f'{len(metadata)} media files optimized; original URLs mapped.')
