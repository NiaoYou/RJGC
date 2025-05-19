# @Author  : eco
# @Date    ：2025/5/19 15:42
# @Function: 需求生成模块/不同于需求获取
import requests
import os

OLLAMA_URL = os.getenv("LLM_API_URL", "http://localhost:11434/api/generate")
LLM_MODEL = os.getenv("LLM_MODEL", "llama3")

def generate_requirement(topic: str) -> str:
    prompt = f"""
你是一个资深系统分析师，请根据以下模块主题，生成详细的模块功能需求说明，输出格式应当简洁明了，便于开发者实现代码模块。

主题：{topic}

请包含以下内容：
1. 模块名称
2. 模块功能概述
3. 接口设计（包括 HTTP 方法、路径、请求参数、返回结构）
4. 其他注意事项（如鉴权、异常处理等）
"""

    payload = {
        "model": LLM_MODEL,
        "prompt": prompt,
        "stream": False
    }

    response = requests.post(OLLAMA_URL, json=payload)
    response.raise_for_status()
    return response.json()["response"].strip()