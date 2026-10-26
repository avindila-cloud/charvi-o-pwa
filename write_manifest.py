import json, os

data = {
    "name": "Charvi O — Penerjemah Kantonis",
    "short_name": "Charvi O",
    "start_url": "./",
    "scope": "./",
    "display": "standalone",
    "background_color": "#000000",
    "theme_color": "#000000",
    "icons": [
        {"src": "icon-192.png", "sizes": "192x192", "type": "image/png"},
        {"src": "icon-512.png", "sizes": "512x512", "type": "image/png"},
        {"src": "icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}
    ]
}

path = "/c/Users/My OvoneL is Awesome/charvi-o-pwa/manifest.json"
with open(path, "w") as f:
    json.dump(data, f, indent=2)
    f.write("\n")

print("Written:", path)
print("Exists:", os.path.exists(path))
