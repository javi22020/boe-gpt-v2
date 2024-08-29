from llama_cpp.server.app import create_app
from llama_cpp.server.settings import ModelSettings, ServerSettings
import uvicorn, os, yaml, logging
from fastapi.middleware.cors import CORSMiddleware

logger = logging.getLogger(__name__)
config = yaml.safe_load(open("config.yaml", "r", encoding="utf-8"))
models = [m.lower().removesuffix("-q4_k_m.gguf") for m in os.listdir("model") if m.endswith(".gguf")]

app = create_app(
    server_settings=ServerSettings(
        host="0.0.0.0",
        port=4550
    ),
    model_settings=[
        ModelSettings(
            model="model/" + os.listdir("model")[config["model"]],
            model_alias="gpt-4o-mini",
            n_gpu_layers=-1
        )
    ]
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/heartbeat")
def heartbeat():
    return {"message": "Alive"}

@app.get("/downloaded_models")
def get_models():
    return {"models": models}

@app.get("/selected_model")
def get_model():
    return {"model_index": config["model"]}

@app.post("/set_model/{i}")
def set_model(i: int):
    if 0 <= i < len(models):
        settings = yaml.safe_load(open("config.yaml", "r", encoding="utf-8"))
        settings["model"] = i
        yaml.safe_dump(settings, open("config.yaml", "w", encoding="utf-8"))
        return {"message": "Success, restart to apply changes"}
    else:
        return {"message": "Invalid model index"}, 400

if __name__ == "__main__":
    uvicorn.run("llm_server:app", host="0.0.0.0", port=4550, reload=True)
    logger.info("Server started")