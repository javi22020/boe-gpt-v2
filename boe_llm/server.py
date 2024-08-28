from llama_cpp.server.app import create_app
from llama_cpp.server.settings import ModelSettings, ServerSettings
import uvicorn, os, yaml
config = yaml.safe_load(open("config.yaml", "r", encoding="utf-8"))
models = [m for m in os.listdir("model") if m.endswith(".gguf")]
app = create_app(
    server_settings=ServerSettings(
        host="0.0.0.0",
        port=4550
    ),
    model_settings=[
        ModelSettings(
            model="model/" + os.listdir("model")[config["model"]],
            model_alias="default",
            n_gpu_layers=-1
        )
    ]
)

@app.get("/heartbeat")
def heartbeat():
    return {"message": "Alive"}

@app.get("/models")
def get_models():
    return {"models": os.listdir("model")}

@app.post("/set_model/{i}")
def set_model(i: int):
    settings = yaml.safe_load(open("config.yaml", "r", encoding="utf-8"))
    settings["model"] = i
    yaml.safe_dump(settings, open("config.yaml", "w", encoding="utf-8"))
    return {"message": "Success, restart to apply changes"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=4550)