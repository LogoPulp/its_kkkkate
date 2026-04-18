
import requests
import json
import time
import os

TOKEN = "VPhFBTY5SmKJQVysdXWY"
API_TOKEN_URL = f"https://www.donationalerts.com/api/v1/token/widget?token={TOKEN}"
# The specific widget ID from the user's URL
API_GOAL_URL = "https://www.donationalerts.com/api/v1/goal/9398744"
OUTPUT_PATH = "assets/goal.json"

def fetch_goal():
    print(f"[*] Fetching goal data from DonationAlerts...")
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json',
            'Referer': f'https://www.donationalerts.com/widget/goal/9398744?token={TOKEN}'
        }
        
        # Step 1: Get the JWT token
        print("[*] Exchanging token for JWT...")
        token_response = requests.get(API_TOKEN_URL, headers=headers)
        token_response.raise_for_status()
        token_data = token_response.json()
        jwt_token = token_data.get('data', {}).get('token')
        
        if not jwt_token:
            print("[!] Failed to obtain JWT token.")
            return False
            
        # Step 2: Fetch goal data using the JWT
        print("[*] Fetching goal details with JWT...")
        headers['Authorization'] = f"Bearer {jwt_token}"
        goal_response = requests.get(API_GOAL_URL, headers=headers)
        goal_response.raise_for_status()
        goal_json = goal_response.json()
        
        # The structure is {"data": {...goal details...}}
        if 'data' in goal_json:
            goal = goal_json['data']
            result = {
                "title": goal.get("title", "Goal"),
                "amount": goal.get("amount", 0),
                "goal_amount": goal.get("goal_amount", 0),
                "currency": goal.get("currency", "RUB"),
                "percent": goal.get("percent", 0),
                "updated_at": int(time.time())
            }
            
            os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
            with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
                json.dump(result, f, ensure_ascii=False, indent=2)
            
            print(f"[+] Successfully updated goal: {result['title']} ({result['percent']}%)")
            return True
    except Exception as e:
        print(f"[!] Error fetching goal: {e}")
    return False

if __name__ == "__main__":
    fetch_goal()
