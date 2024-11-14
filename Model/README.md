# Mirsad  Model
This directory contains the code of model

## How to use?
1) `pip install -r requirements.txt` (*Prefer to use `venv`*)
2) Add companies list to `comapnies.json`
3) Make sure to run [Qdrant](https://qdrant.tech/) (Vector database)
4) Run `embedding.py` to embed the companies IDs
5) Run `fastapi dev ./main.py` for development environment