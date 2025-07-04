# Python Backend for Resource Locator

This backend provides AI-powered chat functionality for the Resource Locator application.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Copy `.env.example` to `.env` and add your OpenAI API key:
```bash
cp .env.example .env
```

4. Run the server:
```bash
uvicorn main:app --reload
```

The server will run on `http://localhost:8000`

## API Endpoints

- POST `/chat` - Chat endpoint for AI responses
  - Request body: `{ "message": "string", "is_spanish": boolean }`
  - Response: `{ "response": "string", "error": "string" }`
