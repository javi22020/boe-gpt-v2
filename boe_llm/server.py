from llama_cpp.server.app import create_app
from llama_cpp.server.settings import ModelSettings, ServerSettings
import uvicorn, os
app = create_app(
    server_settings=ServerSettings(
        host="0.0.0.0",
        port=4550
    ),
    model_settings=[
        ModelSettings(
            model="model/" + os.listdir("model")[0],
            model_alias="default",
            n_gpu_layers=-1
        )
    ]
)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=4550)