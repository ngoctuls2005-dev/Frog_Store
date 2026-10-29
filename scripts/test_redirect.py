import urllib.request
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
u = 'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFBkIVWwcW7oBlV8D8Otnz3YwmMskgctYCg8C9bMiUdDuhKDVVRZcEeV5zB1lPMlL7APY-9btilRxPrYiosrozV9ciL1tD4LktWSaSPHkv-jYrW9IhkjEvNsVSSlG96KI8='

try:
    req = urllib.request.Request(u, headers=headers)
    with urllib.request.urlopen(req, timeout=10) as res:
        print('Final URL:', res.geturl())
        html = res.read().decode('utf-8', errors='ignore')
        imgs = re.findall(r'(https?://[^\s"\'<>]+\.(?:jpg|jpeg|png|webp))', html)
        print('Images:', imgs[:8])
except Exception as e:
    print('Err:', e)
