from chromadb.api.types import Embeddings, Documents
import os, uvicorn, logging
from tqdm import tqdm
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pdfsboe.api import PDFSBOE
from pdfsboe.divide import get_documents_from_pdfs, divide_documents
from langchain_openai.embeddings.base import OpenAIEmbeddings
from chromadb import HttpClient, EmbeddingFunction
os.makedirs("pdfs", exist_ok=True)
pdfsboe = PDFSBOE()
app = FastAPI()
chroma = HttpClient(host="chroma", port=8000)
logger = logging.getLogger(__name__)

embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

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

@app.post("/send_to_chroma/{date}")
async def send_to_chroma(date: str):
    os.makedirs(f"pdfs/{date}", exist_ok=True)
    collection = chroma.get_or_create_collection("docs")
    if len(os.listdir(f"pdfs/{date}")) == pdfsboe.get_n_pdfs_date(date):
        logger.info("PDFs already downloaded")
    else:
        for name, pdf in tqdm(pdfsboe.get_boe_by_date(date), desc="Downloading PDFs", unit="pdf"):
            with open(f"pdfs/{date}/{name}.pdf", "wb") as f:
                f.write(pdf)
        logger.info("PDFs downloaded")
    docs = get_documents_from_pdfs(f"pdfs/{date}")
    logger.info(f"Got {len(docs)} documents")
    docs = divide_documents(docs)
    logger.info(f"Got {len(docs)} documents after division")
    docs = [d for d in docs if d.page_content is not None]
    docs_names, docs_contents = [date + "_" + str(i) for i in range(len(docs))], [d.page_content for d in docs]
    embeds = embeddings.embed_documents(texts=docs_contents)
    collection.add(ids=docs_names, embeddings=embeds)
    return {"message": "Success"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=6550)