from chromadb.api.types import Embeddings, Documents
import os, openai
from tqdm import tqdm
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pdfsboe.api import PDFSBOE
from pdfsboe.divide import get_documents_from_pdfs, divide_documents
from chromadb import HttpClient, EmbeddingFunction
os.makedirs("pdfs", exist_ok=True)
pdfsboe = PDFSBOE()
app = FastAPI()
chroma = HttpClient(host="chroma", port=8000)

class LocalEmbeddings(EmbeddingFunction):
    def __init__(self) -> None:
        super().__init__()
        self.embed = openai.OpenAI(
            base_url="http://embed:5550",
            api_key="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"
        )
    def __call__(self, input: Documents) -> Embeddings:
        return self.embed.embeddings.create(input, model="nomic-embed-text-v1.5").data[0].embedding

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

@app.post("/send_to_chroma")
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