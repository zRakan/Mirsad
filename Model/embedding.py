from langchain_huggingface import HuggingFaceEmbeddings
embeddings = HuggingFaceEmbeddings(model_name="prithivida/miniDense_arabic_v1")

from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams

client = QdrantClient(host='localhost', port=6333)

COLLECTION = "companies"

# If collection is not exist, create a new one
if(not client.collection_exists(COLLECTION)):
    client.create_collection(collection_name=COLLECTION, vectors_config=VectorParams(size=384, distance=Distance.COSINE))

vector_store = QdrantVectorStore.from_existing_collection(embedding=embeddings, collection_name=COLLECTION)

# Add documents
from langchain_core.documents import Document
import json
from uuid import uuid4

documents = []
uuids = []

with open("data/companies.json", encoding="utf8") as file:
    json_data = json.load(file)

    for data in json_data:
        # Arabic document
        documents.append(Document(page_content=f"{data["nameAR"]}", metadata={ "id": data["id"] }))
        uuids.append(str(uuid4()))

        # English document
        documents.append(Document(page_content=f"{data["nameEN"]}", metadata={ "id": data["id"] }))
        uuids.append(str(uuid4()))

vector_store.add_documents(documents=documents, ids=uuids)
print("All documents added successfully!")