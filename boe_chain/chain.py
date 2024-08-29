import openai
from langchain_openai.chat_models.base import ChatOpenAI
from langchain.chains.retrieval import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.prompts.prompt import PromptTemplate
from langchain_chroma.vectorstores import Chroma
from langchain_community.embeddings.localai import LocalAIEmbeddings
from langchain_core.runnables.history import RunnableWithMessageHistory
from chromadb import HttpClient, EmbeddingFunction

from chromadb.api.types import Embeddings, Documents

session = {}

def get_history(id: int):
    if id not in session:
        session[id] = []
    return session[id]

class OpenAIEmbeddings(EmbeddingFunction):
    def __init__(self) -> None:
        super().__init__()
        self.embed = openai.OpenAI(
            # base_url="http://127.0.0.1:5550",
            api_key="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"
        )

    def __call__(self, input: Documents) -> Embeddings:
        return self.embed.embeddings.create(input=input, model="text-embedding-3-small").data[0].embedding

class BOEGPTChain:
    def __init__(self, model: str) -> None:
        api_key="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"
        self.llm = ChatOpenAI(
            base_url="http://127.0.0.1:4550",
            model=model,
            api_key=api_key
        )
        embed_client = openai.OpenAI(
            base_url="http://127.0.0.1:5550",
            api_key=api_key
        )
        self.prompt_docs = PromptTemplate.from_template(open("prompt_docs.md", "r", encoding="utf-8").read())
        self.chroma = Chroma(client=HttpClient(host="127.0.0.1", port=8000), collection_name="docs", embedding_function=OpenAIEmbeddings(client=embed_client))
        self.doc_chain = create_stuff_documents_chain(
            llm=self.llm,
            prompt=self.prompt_docs
        )
        self.retrieval_chain = create_retrieval_chain(
            retriever=self.chroma.as_retriever(),
            combine_docs_chain=self.doc_chain
        )
    
    def query(self, query: str) -> str:
        return self.retrieval_chain.invoke(input={"input": query})["answer"]
    
    def query_stream(self, query: str):
        for r in self.retrieval_chain.stream(input={"input": query}):
            if isinstance(r, dict) and "answer" in r:
                yield r["answer"]