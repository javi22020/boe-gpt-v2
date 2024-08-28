import uvicorn
from llama_cpp.server.app import create_app
from llama_cpp.server.settings import ModelSettings, ServerSettings
app = create_app(
    server_settings=ServerSettings(
        host="0.0.0.0",
        port=5550
    ),
    model_settings=[
        ModelSettings(
            model="model/nomic-embed-text-v1.5.Q4_K_M.gguf",
            model_alias="nomic-embed-text-v1.5",
            n_gpu_layers=-1
        )
    ]
)
@app.get("/heartbeat")
def heartbeat():
    return {"message": "Alive"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5550)