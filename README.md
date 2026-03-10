# Medical Chatbot

A medical Q&A chatbot that uses a FAISS vector store (from PDFs in `data/`) and Groq-hosted LLM to answer questions.

---

## How to Run the Application

### 1. Create a virtual environment and install dependencies

**Option A – pip (recommended)**

```bash
cd medical-chatbot-main
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate
pip install -r requirements.txt
```

**Option B – Pipenv**

Install [Pipenv](https://pipenv.pypa.io/en/latest/installation.html), then:

```bash
pipenv install -r requirements.txt
# or the minimal set (include sentence-transformers for embeddings):
# pipenv install langchain langchain_community langchain_huggingface faiss-cpu pypdf huggingface_hub streamlit langchain-groq python-dotenv sentence-transformers
pipenv shell
```

### 2. Set your Groq API key

The app uses **Groq** for the LLM. Get a free API key at [console.groq.com](https://console.groq.com) and either:

- **Environment variable:**  
  `GROQ_API_KEY=your_key_here` (export in terminal or set in your OS).
- **Or use a `.env` file:**  
  Create a `.env` in the project root (same folder as `medibot.py`) with:
  ```env
  GROQ_API_KEY=your_groq_api_key_here
  ```
  The app will load it if you uncomment the `load_dotenv` lines in `medibot.py` (see below).

### 3. Build the vector store (first time only)

If the folder `vectorstore/db_faiss` does not exist, generate it from the PDFs in `data/`:

```bash
python create_memory_for_llm.py
```

This reads PDFs from `data/`, chunks them, and saves the FAISS index to `vectorstore/db_faiss`. Run from the project root so paths are correct.

### 4. Install sentence-transformers (required for embeddings)

The app uses HuggingFace embeddings backed by `sentence-transformers`. If you see *"Could not import sentence_transformers"*, run:

```bash
pip install sentence-transformers
```

### 5. Start the app (choose one)

**Option A – React dashboard (recommended)**

1. Start the API backend (from project root):
   ```bash
   pip install fastapi uvicorn
   uvicorn api:app --reload --port 8000
   ```
2. In another terminal, start the dashboard:
   ```bash
   cd dashboard
   npm install
   npm run dev
   ```
3. Open **http://localhost:5173** in your browser for the dashboard.

**Option B – Streamlit UI**

```bash
python -m streamlit run medibot.py
```

Then open the URL shown (usually `http://localhost:8501`).

---

## Optional: Load `.env` in the app

To use a `.env` file for `GROQ_API_KEY`, uncomment these lines at the top of `medibot.py`:

```python
from dotenv import load_dotenv, find_dotenv
load_dotenv(find_dotenv())
```

---

## Alternative: Pipenv-only setup (original)

### Prerequisite: Install Pipenv
[Install Pipenv Documentation](https://pipenv.pypa.io/en/latest/installation.html)

### Install Required Packages

```bash
pipenv install langchain langchain_community langchain_huggingface faiss-cpu pypdf
pipenv install huggingface_hub
pipenv install streamlit



