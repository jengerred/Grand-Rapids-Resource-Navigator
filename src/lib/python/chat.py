import requests
import time
import sys
import os
import json

class RateLimiter:
    def __init__(self, limit: int = 1):
        self.limit = limit
        self.last_request = 0

    def check(self) -> bool:
        current_time = time.time()
        if current_time - self.last_request < 1.0 / self.limit:
            print("Rate limit exceeded")
            return False
        self.last_request = current_time
        return True

def get_response(message: str, is_spanish: bool) -> dict:
    rate_limiter = RateLimiter(limit=1)
    
    if not rate_limiter.check():
        return {
            "response": "",
            "error": "Rate limit exceeded. Please try again in a moment."
        }

    try:
        # Get environment variables
        ollama_url = os.getenv('OLLAMA_API_URL', 'http://localhost:11434')
        model_name = os.getenv('OLLAMA_MODEL', 'llama3.2')
        
        # Prepare the system prompt based on language
        system_prompt = (
            "You are a helpful assistant that helps people find local resources in Grand Rapids.\n"
            "Use the provided resource data to help users find what they need.\n"
            "Be concise and helpful.\n"
            "Always respond in Spanish.\n" if is_spanish else "Always respond in English.\n"
            "Do not switch languages."
        )

        # Create the full prompt
        prompt = f"{system_prompt}\n\nUser: {message}\nAssistant:"

        # Make API call to Ollama
        response = requests.post(
            f"{ollama_url}/api/generate",
            json={
                "model": model_name,
                "prompt": prompt,
                "stream": False
            }
        )
        
        print(f"\n=== OLLAMA API RESPONSE ===")
        print(f"Status code: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        print(f"Response text: {response.text}")
        print(f"=== END OF OLLAMA API RESPONSE ===")
        
        if response.status_code != 200:
            return {
                "response": "",
                "error": f"Ollama API error: {response.text}"
            }

        data = response.json()
        print(f"\n=== OLLAMA JSON DATA ===")
        print(f"Raw data: {data}")
        print(f"Response field: {data.get('response', 'No response field found')}")
        print(f"=== END OF OLLAMA JSON DATA ===")
        
        response_text = data.get("response", "").strip()
        if not response_text:
            return {
                "response": "",
                "error": "Empty response from Ollama"
            }
        
        return {
            "response": response_text,
            "error": None
        }

    except Exception as e:
        print(f"\n=== OLLAMA API ERROR ===")
        print(f"Error making request to Ollama API: {e}")
        print(f"Error details: {str(e)}")
        print(f"=== END OF OLLAMA API ERROR ===")
        return {
            "response": "",
            "error": f"Failed to connect to AI service: {str(e)}"
        }

if __name__ == "__main__":
    try:
        # Get message and language from environment variables
        message = os.environ.get('MESSAGE', '')
        is_spanish_env = os.environ.get('IS_SPANISH', 'false')
        is_spanish = is_spanish_env.lower() == 'true'
        
        print(f"\n=== START OF REQUEST ===")
        print(f"Received message: {message}")
        print(f"Raw IS_SPANISH env var: {is_spanish_env}")
        print(f"Is Spanish (processed): {is_spanish}")
        print(f"Environment variables: {os.environ}")
        print(f"Environment variables: {os.environ}")

        # Get response
        result = get_response(message, is_spanish)
        
        # Print JSON response
        print("=== RAW RESULT ===")
        print(str(result))
        print("=== JSON DUMP ===")
        json_response = json.dumps(result)
        print(json_response)
        print("=== END OF JSON DUMP ===")
        print(json_response)
        
        # Ensure we only output the JSON once
        sys.stdout.flush()
        print(json_response)
        sys.stdout.flush()
        
        # Also print for debugging
        print(f"=== FINAL JSON OUTPUT ===")
        print(json_response)
        print("=== END OF FINAL JSON OUTPUT ===")
        
        # Exit with success status
        sys.exit(0)
    except Exception as e:
        # Handle any unexpected errors
        print("=== ERROR CASE ===")
        error_response = {
            "response": "",
            "error": f"Unexpected error: {str(e)}"
        }
        print("=== ERROR JSON ===")
        print(json.dumps(error_response))
        print("=== END OF ERROR JSON ===")
        print(json.dumps(error_response))
        
        # Ensure we only output the JSON once
        sys.stdout.flush()
        print(json.dumps(error_response))
        sys.stdout.flush()
        
        # Also print for debugging
        print(f"=== FINAL ERROR JSON ===")
        print(json.dumps(error_response))
        print("=== END OF FINAL ERROR JSON ===")
        
        # Exit with error status
        sys.exit(1)
    print(f"=== END OF REQUEST ===")

    try:
        # Get response
        response = get_response(message, is_spanish)
        
        # Print response in JSON format
        print(json.dumps(response))
        
    except Exception as e:
        print(f"\n=== GENERAL ERROR ===")
        print(f"Unexpected error: {e}")
        print(f"Error type: {type(e)}")
        print(f"Error details: {str(e)}")
        print(f"=== END OF GENERAL ERROR ===")
        print(json.dumps({
            "response": "",
            "error": f"An unexpected error occurred: {str(e)}"
        }))
