from PIL import Image, ImageOps, ImageDraw
from pathlib import Path
root=Path(__file__).resolve().parent.parent
files=list((root/'public/media/original').iterdir())
sheet=Image.new('RGB',(1200,((len(files)+5)//6)*170),'#edf1f5')
draw=ImageDraw.Draw(sheet)
for i,path in enumerate(files):
    raw=Image.open(path).convert('RGBA'); img=Image.new('RGBA',raw.size,'white'); img.alpha_composite(raw); img=img.convert('RGB'); img.thumbnail((185,130))
    x=(i%6)*200;y=(i//6)*170
    sheet.paste(img,(x+(190-img.width)//2,y))
    draw.text((x+3,y+133),path.name[:28],fill='#111111')
    draw.text((x+3,y+148),path.name[28:54],fill='#111111')
sheet.save(root/'migration/contact-sheet.jpg')
