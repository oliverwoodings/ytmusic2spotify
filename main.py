import json
from ytmusicapi import YTMusic

ytmusic = YTMusic('headers_auth.json')

search_results = ytmusic.get_library_artists(2000, 'a_to_z')

print(json.dumps(search_results))
