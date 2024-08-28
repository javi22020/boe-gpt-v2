import os
from langchain_community.document_loaders.pdf import PDFMinerLoader
from langchain_core.documents.base import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
def get_documents_from_pdfs(folder: str):
    docs = []
    for root, dirs, files in os.walk(folder):
        for file in files:
            if file.endswith(".pdf"):
                loader = PDFMinerLoader(file_path=os.path.join(root, file))
                doc = loader.load()[0]
                doc.metadata = {
                    "filename": file.replace(".pdf", ""),
                    "date": root.split("/")[-1]
                }
                docs.append(doc)
    return [d for d in docs if d.page_content is not None]

def divide_documents(documents: list[Document]):
    splitter = RecursiveCharacterTextSplitter()
    docs = splitter.split_documents(documents=documents)
    return [d for d in docs if d is not None]

