FROM nvidia/cuda:12.4.0-devel-ubuntu22.04

COPY . app/

WORKDIR /app

ENV CUDA_HOME="/usr/local/cuda"
ENV PATH="${CUDA_HOME}/bin:${PATH}"
ENV LD_LIBRARY_PATH="${CUDA_HOME}/lib64:${LD_LIBRARY_PATH}"
ENV CUDACXX="${CUDA_HOME}/bin/nvcc"
ENV CMAKE_ARGS="-DGGML_CUDA=on -DCMAKE_CUDA_COMPILER=${CUDA_HOME}/bin/nvcc -DLLAVA_BUILD=off"
ENV FORCE_CMAKE=1

RUN apt-get update && apt-get install -y \
    python3.10 \
    python3.10-venv \
    python3-pip \
    build-essential \
    cmake \
    ccache \
    wget \
    curl \
    git

RUN python3 -m venv venv
    
RUN . venv/bin/activate && \
    pip install --upgrade pip setuptools wheel && \
    CUDA_HOME=/usr/local/cuda  pip install llama-cpp-python \
    --extra-index-url https://abetlen.github.io/llama-cpp-python/whl/cu124 \
    && pip install -r requirements.txt

RUN mkdir model

EXPOSE 5550:5550

CMD sudo sh -c 'ulimit -l unlimited && . venv/bin/activate && python3 server.py'