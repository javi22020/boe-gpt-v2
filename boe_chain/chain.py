from langchain_openai.chat_models.base import ChatOpenAI
from langchain.chains.retrieval import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.prompts.prompt import PromptTemplate
from langchain_chroma.vectorstores import Chroma
from langchain_openai.embeddings.base import OpenAIEmbeddings
from langchain_core.runnables.history import RunnableWithMessageHistory
from chromadb import HttpClient
Chroma._LANGCHAIN_DEFAULT_COLLECTION_NAME = "docs"
session = {}

def get_history(session_id: int):
    if id not in session:
        session[session_id] = []
    return session[session_id]

class BOEGPTChain:
    def __init__(self, model: str) -> None:
        api_key="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"
        self.llm = ChatOpenAI(
            # base_url="http://127.0.0.1:4550",
            model=model,
            api_key=api_key,
            streaming=True
        )
        self.prompt_docs = PromptTemplate.from_template(open("prompt_docs.md", "r", encoding="utf-8").read())
        self.chroma = Chroma(client=HttpClient(host="127.0.0.1", port=8000), collection_name="docs", embedding_function=OpenAIEmbeddings(api_key=api_key))
        self.chroma._LANGCHAIN_DEFAULT_COLLECTION_NAME = "docs"
        self.doc_chain = create_stuff_documents_chain(
            llm=self.llm,
            prompt=self.prompt_docs
        )
        self.retrieval_chain = create_retrieval_chain(
            retriever=self.chroma.as_retriever(),
            combine_docs_chain=self.doc_chain
        )
        self.chain = RunnableWithMessageHistory(
            self.retrieval_chain,
            get_history
        )
    
    def query(self, query: str, session_id: int = 1) -> str:
        return self.chain.invoke(input={"input": query}, config={"configurable": {"session_id": session_id}})["answer"]
    
    def query_stream(self, query: str, session_id: int = 1):
        for r in self.chain.stream(input={"input": query}, config={"configurable": {"session_id": session_id}}):
            if isinstance(r, dict) and "answer" in r:
                yield r["answer"]