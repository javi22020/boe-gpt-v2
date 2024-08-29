from chromadb.api.types import Embeddings, Documents
import os, openai, uvicorn, logging
from tqdm import tqdm
from langchain_openai.embeddings.base import OpenAIEmbeddings
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pdfsboe.api import PDFSBOE
from pdfsboe.divide import get_documents_from_pdfs, divide_documents
from chromadb import HttpClient, EmbeddingFunction
os.makedirs("pdfs", exist_ok=True)
pdfsboe = PDFSBOE()
app = FastAPI()
chroma = HttpClient(host="127.0.0.1", port=8000)

class LocalEmbeddings(EmbeddingFunction):
    def __init__(self) -> None:
        super().__init__()
        self.embed_client = openai.OpenAI(
            base_url="http://127.0.0.1:5550",
            api_key="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"
        )
        self.embed = OpenAIEmbeddings(client=self.embed_client)
    def __call__(self, input: Documents) -> Embeddings:
        emb = self.embed.embed_documents(texts=input)
        embs = []
        for e in emb:
            embs.extend(e)
        return embs

embeddings = LocalEmbeddings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/heartbeat")
def heartbeat():
    return {"message": "Alive"}

@app.get("/collections")
def get_collections():
    return JSONResponse([c.name for c in chroma.list_collections()])

@app.post("/send_to_chroma/{date}")
async def send_to_chroma(date: str):
    os.makedirs(f"pdfs/{date}", exist_ok=True)
    collection = chroma.get_or_create_collection(date)
    if len(os.listdir(f"pdfs/{date}")) == pdfsboe.get_n_pdfs_date(date):
        print("Already downloaded")
    else:
        for name, pdf in tqdm(pdfsboe.get_boe_by_date(date), desc="Downloading PDFs", unit="pdf"):
            with open(f"pdfs/{date}/{name}.pdf", "wb") as f:
                f.write(pdf)
    docs = get_documents_from_pdfs(f"pdfs/{date}")
    docs = divide_documents(docs)
    docs = [d for d in docs if d.page_content is not None]
    docs_names, docs_contents = [date + "_" + str(i) for i in range(len(docs))], [d.page_content for d in docs]
    embeds = embeddings(docs_contents)
    collection.add(ids=docs_names, embeddings=embeds)
    return {"message": "Success"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=6550)