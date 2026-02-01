"""
Test script for chatbot with keywords and navigation
"""
import requests
import json

API_URL = "http://localhost:8000"

def test_chatbot():
    """Test chatbot with various messages"""
    
    test_cases = [
        "about",
        "profile",
        "tentang",
        "calculator",
        "hitung hpp",
        "menu",
        "makanan",
        "murah",
        "mahal",
        "premium",
        "halo",
    ]
    
    for message in test_cases:
        print(f"\n{'='*60}")
        print(f"Testing message: '{message}'")
        print('='*60)
        
        try:
            response = requests.post(
                f"{API_URL}/api/chatbot",
                json={"message": message},
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"Response: {data['response']}")
                
                if data.get('recommendations'):
                    print(f"\nRecommendations ({len(data['recommendations'])}):")
                    for rec in data['recommendations']:
                        print(f"  - {rec['name']} (HPP: {rec['hpp_per_unit']})")
                        if rec.get('keywords'):
                            print(f"    Keywords: {rec['keywords']}")
                
                if data.get('navigation_suggestions'):
                    print(f"\nNavigation Suggestions ({len(data['navigation_suggestions'])}):")
                    for nav in data['navigation_suggestions']:
                        print(f"  - {nav['button_text']} -> {nav['section_path']}")
            else:
                print(f"Error: {response.status_code}")
                print(response.text)
                
        except Exception as e:
            print(f"Exception: {e}")

if __name__ == "__main__":
    test_chatbot()
