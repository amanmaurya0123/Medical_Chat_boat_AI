"""
FastAPI backend for the Medical Chatbot dashboard.
Run with: uvicorn api:app --reload --port 8000
"""
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv, find_dotenv
load_dotenv(find_dotenv())
load_dotenv(os.path.join(os.path.dirname(__file__), "data", ".env"))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# LangChain imports (lazy to avoid import at startup before env is loaded)
vectorstore = None
qa_chain = None

CUSTOM_PROMPT_TEMPLATE = """
Use the pieces of information provided in the context to answer user's question.
If you dont know the answer, just say that you dont know, dont try to make up an answer.
Dont provide anything out of the given context

Context: {context}
Question: {question}

Start the answer directly. No small talk please.
"""

def get_qa_chain():
    global qa_chain, vectorstore
    if qa_chain is not None:
        return qa_chain
    from langchain_huggingface import HuggingFaceEmbeddings
    from langchain_classic.chains.retrieval_qa.base import RetrievalQA
    from langchain_community.vectorstores import FAISS
    from langchain_core.prompts import PromptTemplate
    from langchain_groq import ChatGroq

    groq_key = os.environ.get("GROQ_API_KEY")
    if not groq_key:
        raise ValueError("GROQ_API_KEY is not set")
    DB_FAISS_PATH = os.path.join(os.path.dirname(__file__), "vectorstore", "db_faiss")
    embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    vectorstore = FAISS.load_local(DB_FAISS_PATH, embedding_model, allow_dangerous_deserialization=True)
    prompt = PromptTemplate(template=CUSTOM_PROMPT_TEMPLATE, input_variables=["context", "question"])
    qa_chain = RetrievalQA.from_chain_type(
        llm=ChatGroq(
            model_name="llama-3.1-8b-instant",  # Groq production model; alt: llama-3.3-70b-versatile
            temperature=0.0,
            groq_api_key=groq_key,
        ),
        chain_type="stuff",
        retriever=vectorstore.as_retriever(search_kwargs={"k": 3}),
        return_source_documents=True,
        chain_type_kwargs={"prompt": prompt},
    )
    return qa_chain


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Optional: preload chain on startup (can be slow)
    yield
    # cleanup if needed
    pass


app = FastAPI(title="Medical Chatbot API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    answer: str
    sources: list[str]


@app.get("/")
def root():
    return {
        "app": "Medical Chatbot API",
        "docs": "/docs",
        "health": "/health",
        "chat": "POST /chat",
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    if not req.message or not req.message.strip():
        raise HTTPException(status_code=400, detail="message is required")
    try:
        chain = get_qa_chain()
        response = chain.invoke({"query": req.message.strip()})
        result = response.get("result", "")
        docs = response.get("source_documents", [])
        sources = []
        for d in docs:
            if hasattr(d, "page_content") and d.page_content:
                sources.append(d.page_content[:300] + ("..." if len(d.page_content) > 300 else ""))
        return ChatResponse(answer=result, sources=sources)
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
