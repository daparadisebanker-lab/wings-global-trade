import urllib.request
import json

url = "https://rsstxmptehndaipscaou.supabase.co/auth/v1/token?grant_type=password"
data = json.dumps({"email": "test@test.com", "password": "password123"}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={
    "apikey": "sb_publishable_RD1Nn8iu0fZJ0BOKRm10Eg_A5y0_ob0",
    "Content-Type": "application/json"
})

try:
    with urllib.request.urlopen(req) as response:
        print("Status:", response.status)
        print("Data:", response.read().decode())
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code)
    print("Error Data:", e.read().decode())
except Exception as e:
    print("Error:", e)
