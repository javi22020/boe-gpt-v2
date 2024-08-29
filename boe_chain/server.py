from fastapi import FastAPI, Body
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import json
import uvicorn
from chain import BOEGPTChain
import asyncio
import yaml

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

chain = BOEGPTChain("default")

@app.post("/chat/{query}")
async def chat(query: str):
    r = chain.query(query)
    return JSONResponse(content=r)

@app.post("/chat_stream/{query}")
async def stream_chat(query: str):
    async def event_generator():
        for chunk in chain.query_stream(query):
            yield f"data: {chunk}\n\n"
            await asyncio.sleep(0)
    
    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.get("/conversations")
def get_conversations():
    return JSONResponse(json.load(open("conversations.json", "r", encoding="utf-8")))

@app.get("/heartbeat")
def heartbeat():
    return {"message": "Alive"}

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=3550, reload=True)