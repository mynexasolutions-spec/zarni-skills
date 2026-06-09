from google import genai

client = genai.Client(api_key="AIzaSyAjDRBlU9OeMZo4p6YgFmgrD2-CmaEACQo")

try:
    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents="Hello! What can you do?"
    )
    print(response.text)
except Exception as e:
    print(f"Error: {e}")