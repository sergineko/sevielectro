"""Archive the public source and media of the existing SeviElectro site."""
from html.parser import HTMLParser
from html import unescape
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import urlparse, unquote
import json, re, concurrent.futures

ROOT=Path(__file__).resolve().parent.parent
ARCHIVE=ROOT/'migration'; ARCHIVE.mkdir(exist_ok=True)
MEDIA=ROOT/'public'/'media'/'original'; MEDIA.mkdir(parents=True,exist_ok=True)
def fetch(url):
    with urlopen(Request(url,headers={'User-Agent':'SeviElectro-Astro-Migration/1.0'}),timeout=40) as response: return response.read()
class Inventory(HTMLParser):
    def __init__(self): super().__init__(); self.images=[]; self.links=[]; self.ids=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='img': self.images.append(a)
        if tag=='a' and a.get('href'): self.links.append(a['href'])
        if a.get('id'): self.ids.append(a['id'])
def main():
    source=fetch('https://sevielectro.com/').decode('utf-8')
    (ARCHIVE/'original-home.html').write_text(source,encoding='utf-8')
    parser=Inventory(); parser.feed(source)
    css_urls=re.findall(r'https://sevielectro.com/wp-content/uploads/elementor/css/[^\s\x22\x27<>]+',source)
    all_css=''
    for url in dict.fromkeys(css_urls):
        css=fetch(unescape(url)).decode(); all_css+='\n'+css
    (ARCHIVE/'original-styles.css').write_text(all_css,encoding='utf-8')
    urls=set()
    for img in parser.images:
        if img.get('src','').startswith('https://sevielectro.com/wp-content/uploads/'): urls.add(img['src'])
    for url in parser.links:
        if '/wp-content/uploads/' in url and re.search(r'\.(jpe?g|png|webp|svg)$',url,re.I): urls.add(url)
    for url in re.findall(r'https://sevielectro.com/wp-content/uploads/[^\s\x22\x27()<>]+',all_css):
        if re.search(r'\.(jpe?g|png|webp|svg)$',url,re.I): urls.add(url)
    def download(url):
        name=unquote(urlparse(url).path.rsplit('/',1)[-1]); target=MEDIA/name
        if not target.exists(): target.write_bytes(fetch(url))
        return {'source':url,'local':'/media/original/'+name,'bytes':target.stat().st_size}
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool: assets=list(pool.map(download,sorted(urls)))
    data={'source':'https://sevielectro.com/','images':parser.images,'links':list(dict.fromkeys(parser.links)),'anchors':parser.ids,'assets':assets}
    (ARCHIVE/'inventory.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'images':parser.images,'links':data['links'],'anchors':parser.ids,'assets':assets},ensure_ascii=False,indent=2))
if __name__=='__main__': main()
