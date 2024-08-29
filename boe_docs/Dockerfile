FROM python:3.10-slim

WORKDIR /app

COPY . /app

RUN python3 -m venv venv

RUN . venv/bin/activate && \
    pip install --upgrade pip setuptools wheel && \
    pip install -r requirements.txt

EXPOSE 6550:6550

CMD . venv/bin/activate && python3 docs_server.py