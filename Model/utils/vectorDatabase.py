# Vector Database
from qdrant_client import QdrantClient
client = QdrantClient(host='localhost', port=6333)

from langchain_huggingface import HuggingFaceEmbeddings
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")

from langchain_qdrant import QdrantVectorStore
#vector_store = QdrantVectorStore(client=client, collection_name="companies", embedding=embeddings)
vector_store = QdrantVectorStore.from_existing_collection(embedding=embeddings, collection_name="companies")


def retrieveQuery(query):
    documents = vector_store.similarity_search_with_score(query, k=1)
    if(len(documents) == 0):
        return None, 0.0

    return documents[0]