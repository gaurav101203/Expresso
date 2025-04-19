
# # !pip install langchain_google_vertexai langchain_community langgraph nltk

# # !pip install --upgrade google-auth google-auth-oauthlib google-api-python-client google.cloud

# # !gcloud auth login

# # !gcloud config set project rag-model-448019

# # gcloud projects add-iam-policy-binding rag-model-448019 --member="serviceAccount:rag-model@rag-model-448019.iam.gserviceaccount.com" --role="roles/aiplatform.user"

# # !pip install unstructured unstructured[pdf] gradio

# import os
# os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "D:/bfn/RAG/rag-model-448019-fe37e29d6e38.json"


# from google.oauth2 import service_account
# from google.auth.transport.requests import Request

# credentials = service_account.Credentials.from_service_account_file(
#     "D:/bfn/RAG/rag-model-448019-fe37e29d6e38.json",
#     scopes=["https://www.googleapis.com/auth/cloud-platform"]
# )
# credentials.refresh(Request())

# from google.cloud import aiplatform as vertexai

# vertexai.init(
#     project="rag-model-448019",  # Replace with your Google Cloud project ID
#     location="us-central1",
#     credentials=credentials # Replace with your preferred region
# )

# from langchain_google_vertexai import ChatVertexAI

# llm = ChatVertexAI(model="gemini-2.0-flash")

# from langchain_google_vertexai import VertexAIEmbeddings

# embeddings = VertexAIEmbeddings(model="textembedding-gecko@003")

# from langchain_core.vectorstores import InMemoryVectorStore

# vector_store = InMemoryVectorStore(embeddings)

# import nltk

# import pdfplumber
# from langchain import hub
# from langchain_core.documents import Document
# from langchain_text_splitters import RecursiveCharacterTextSplitter
# from langgraph.graph import START, StateGraph
# from typing_extensions import List, TypedDict
# import gradio as gr
# import shutil

# # Define the directory to save uploaded files
# UPLOAD_DIRECTORY = "./uploads"
# os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)

# def save_file(file):
#     try:
#         # Extract the base file name
#         base_filename = os.path.basename(file.name)
#         # Define the target file path
#         target_path = os.path.join(UPLOAD_DIRECTORY, base_filename)
#         # Copy the file to the target directory
#         shutil.copy(file.name, target_path)

#         with pdfplumber.open(target_path) as pdf:
#             text = ""
#             for page in pdf.pages:
#                 text += page.extract_text()  # Combine text from all pages

#         text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
#         all_splits = text_splitter.split_text(text)

#         documents = [Document(page_content=chunk) for chunk in all_splits]

#         # Index chunks
#         _ = vector_store.add_documents(documents=documents)
        
#         return f"File saved and processed successfully"
#     except Exception as e:
#         return f"Error saving file: {str(e)}"
       
# # Define prompt for question-answering
# prompt = hub.pull("rlm/rag-prompt")


# # Define state for application
# class State(TypedDict):
#     question: str
#     context: List[Document]
#     answer: str

# # Define application steps
# def retrieve(state: State):
#     retrieved_docs = vector_store.similarity_search(state["question"])
#     return {"context": retrieved_docs}


# def generate(state: State):
#     docs_content = "\n\n".join(doc.page_content for doc in state["context"])
#     messages = prompt.invoke({"question": state["question"], "context": docs_content})
#     response = llm.invoke(messages)
#     return {"answer": response.content , "context": docs_content}

# # Compile application and test
# graph_builder = StateGraph(State).add_sequence([retrieve, generate])
# graph_builder.add_edge(START, "retrieve")
# graph = graph_builder.compile()


# def chatbot_interface(question):
#     try:
#         response = graph.invoke({"question": question})
#         answer = response.get("answer","context")

#         return answer
#     except Exception as e:
#         return f"Error: {e}", None

# # Gradio Interface
# with gr.Blocks() as demo:
#     with gr.Tab("Upload Files"):
#         upload_file = gr.File(label="Upload PDF File")
#         upload_output = gr.Textbox(label="Upload Status", interactive=False)
#         upload_button = gr.Button("Upload and Process")

#     with gr.Tab("Ask Questions"):
#         question_input = gr.Textbox(label="Ask a Question")
#         answer_output = gr.Textbox(label="Answer", interactive=False)
#         question_button = gr.Button("Get Answer")
#     upload_button.click(save_file, inputs=upload_file, outputs=upload_output)
#     question_button.click(chatbot_interface, inputs=question_input, outputs=answer_output)
# demo.launch(share=True)



import os
from pymongo import MongoClient
from langchain import hub
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langgraph.graph import START, StateGraph
from typing_extensions import List, TypedDict
import gradio as gr
from datetime import datetime

# Your custom vector store and embedding model
from langchain_core.vectorstores import InMemoryVectorStore  # Replace with actual import
from langchain_google_vertexai.embeddings import VertexAIEmbeddings
from langchain_google_vertexai import ChatVertexAI  # Or your LLM model

# MongoDB setup
client = MongoClient("mongodb://localhost:27017/")
db = client["bfn"]
collections = ["categories", "products", "shipments", "users"]

# Vector Store Setup
embedding_model = VertexAIEmbeddings(model="textembedding-gecko@003")
vector_store = InMemoryVectorStore(embedding=embedding_model)

# Load documents from MongoDB and index them
def fetch_and_index_documents():
    all_documents = []
    for coll_name in collections:
        coll = db[coll_name]
        for record in coll.find():
            content = extract_text_from_record(record)
            metadata = {"collection": coll_name, "_id": str(record.get("_id"))}
            all_documents.append(Document(page_content=content, metadata=metadata))

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    split_docs = []
    for doc in all_documents:
        chunks = text_splitter.split_text(doc.page_content)
        split_docs.extend([Document(page_content=chunk, metadata=doc.metadata) for chunk in chunks])

    vector_store.add_documents(split_docs)

def extract_text_from_record(record):
    ignore_fields = ["_id", "__v"]
    text_parts = []
    for key, value in record.items():
        if key in ignore_fields:
            continue
        if isinstance(value, (str, int, float)):
            text_parts.append(f"{key}: {value}")
        elif isinstance(value, list):
            text_parts.append(f"{key}: {', '.join(map(str, value))}")
        elif isinstance(value, dict):
            nested = ", ".join(f"{k}: {v}" for k, v in value.items())
            text_parts.append(f"{key}: {nested}")
        elif isinstance(value, datetime):
            text_parts.append(f"{key}: {value.strftime('%Y-%m-%d')}")
        else:
            text_parts.append(f"{key}: {str(value)}")
    return "\n".join(text_parts)

# Build vector index once
fetch_and_index_documents()

# Load prompt & model
prompt = hub.pull("rlm/rag-prompt")
llm = ChatVertexAI(model="gemini-2.0-flash")

# RAG State and Functions
class State(TypedDict):
    question: str
    context: List[Document]
    answer: str

def retrieve(state: State):
    retrieved_docs = vector_store.similarity_search(state["question"])
    return {"context": retrieved_docs}

def generate(state: State):
    docs_content = "\n\n".join(doc.page_content for doc in state["context"])
    messages = prompt.invoke({"question": state["question"], "context": docs_content})
    response = llm.invoke(messages)
    return {"answer": response.content, "context": docs_content}

# RAG graph
graph_builder = StateGraph(State).add_sequence([retrieve, generate])
graph_builder.add_edge(START, "retrieve")
graph = graph_builder.compile()

# Interface
def chatbot_interface(question):
    try:
        response = graph.invoke({"question": question})
        return response.get("answer", "No answer found.")
    except Exception as e:
        return f"Error: {e}"

# Gradio UI
with gr.Blocks() as demo:
    with gr.Tab("Ask Questions"):
        question_input = gr.Textbox(label="Ask a Question")
        answer_output = gr.Textbox(label="Answer", interactive=False)
        question_button = gr.Button("Get Answer")

    question_button.click(chatbot_interface, inputs=question_input, outputs=answer_output)

demo.launch(share=True)
