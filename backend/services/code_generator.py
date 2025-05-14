import requests
import os

OLLAMA_URL = os.getenv("LLM_API_URL", "http://localhost:11434/api/generate")
LLM_MODEL = os.getenv("LLM_MODEL", "llama3")

def generate_module_code(description: str) -> str:
    prompt = f"""
你是一个Python开发专家。请根据以下模块描述，生成符合FastAPI框架结构的模块代码（包括API路由函数）：

模块描述：
{description}
"""

    payload = {
        "model": LLM_MODEL,
        "prompt": prompt,
        "stream": False
    }

    response = requests.post(OLLAMA_URL, json=payload)
    response.raise_for_status()
    return response.json()["response"].strip()
