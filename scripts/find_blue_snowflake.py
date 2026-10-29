import urllib.request
import urllib.parse
import json

queries = ['Litoria caerulea blue', 'Litoria caerulea spots', 'Ranoidea caerulea blue', 'Litoria caerulea white spots']
headers = {'User-Agent': 'FrogStoreBioBot/1.0 (contact@frogstore.vn)'}

for q in queries:
    url = f"https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(q)}&srnamespace=6&format=json&srlimit=5"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode('utf-8'))
        print(f"=== Query: {q} ===")
        results = data.get('query', {}).get('search', [])
        for r in results:
            title = r.get('title')
            info_url = f"https://commons.wikimedia.org/w/api.php?action=query&titles={urllib.parse.quote(title)}&prop=imageinfo&iiprop=url|size&format=json"
            info_req = urllib.request.Request(info_url, headers=headers)
            with urllib.request.urlopen(info_req, timeout=10) as i_resp:
                i_data = json.loads(i_resp.read().decode('utf-8'))
                for page in i_data.get('query', {}).get('pages', {}).values():
                    for info in page.get('imageinfo', []):
                        print(f"  {title}: {info.get('width')}x{info.get('height')} -> {info.get('url')}")
    except Exception as e:
        print(f"Error {q}: {e}")

