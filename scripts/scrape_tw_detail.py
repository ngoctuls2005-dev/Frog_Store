import urllib.request
import re

headers = {'User-Agent': 'Mozilla/5.0'}
u = 'https://www.tw-frogs.com/product/21/data/41'
req = urllib.request.Request(u, headers=headers)
with urllib.request.urlopen(req, timeout=10) as res:
    html = res.read().decode('utf-8', errors='ignore')
    all_imgs = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', html)
    print("IMG tags:", all_imgs)

