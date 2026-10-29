import urllib.request
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
u = 'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQH5hPKfXLHGxIwOZfwgN1KhXDAEKeEdCBMxF7wE9LNMTfnKjW1gQ1RrNyTuoC9XDydNCIaSu_8xNVtcPkmvAGwV54GLc1WshrAh2qbHO8_7gnAOKGv2MF8dIksuuI6o4hegP03Qv1YOAJC2J6meDZZ-j51UAKKYI99tbfW0uwjQuFIv'

try:
    req = urllib.request.Request(u, headers=headers)
    with urllib.request.urlopen(req, timeout=10) as res:
        final_url = res.geturl()
        print('Final URL:', final_url)
        html = res.read().decode('utf-8', errors='ignore')
        imgs = re.findall(r'https?://[^\s"\'<>]+\.(?:jpg|jpeg|png|webp)', html)
        print(f'Found {len(imgs)} images:')
        for img in imgs[:10]:
            print(' ', img)
except Exception as e:
    print('Error:', e)
