import requests
from django.conf import settings

def get_spotify_token():
    url = 'https://accounts.spotify.com/api/token'
    data = {'grant_type': 'client_credentials'}
    auth = (settings.SPOTIFY_CLIENT_ID, settings.SPOTIFY_CLIENT_SECRET)

    response = requests.post(url, data=data, auth=auth)
    return response.json().get('access_token')

def search_movie_ost(movie_title, limit=5):
    token = get_spotify_token()
    headers = {'Authorization': f'Bearer {token}'}
    params = {'q': movie_title, 'type': 'track', 'limit': limit}

    response = requests.get('https://api.spotify.com/v1/search', headers=headers, params=params)
    if response.status_code != 200:
        return []

    results = []
    for item in response.json().get('tracks', {}).get('items', []):
        results.append({
            'title': item['name'],
            'preview_url': item['preview_url'],
            'spotify_url': item['external_urls']['spotify'],
        })
    return results