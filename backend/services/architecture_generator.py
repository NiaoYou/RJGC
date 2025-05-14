import requests
import os

OLLAMA_URL = os.getenv("LLM_API_URL", "http://localhost:11434/api/generate")
LLM_MODEL = os.getenv("LLM_MODEL", "llama3")

def generate_architecture(requirement_text: str) -> tuple[str, str]:
    prompt = f"""
你是资深系统架构师。请根据以下软件需求生成：
1. 系统分层/微服务架构建议
2. 数据库结构设计（ER关系说明与SQL建表语句）

需求如下：
{requirement_text}
"""

    payload = {
        "model": LLM_MODEL,
        "prompt": prompt,
        "stream": False
    }

    response = requests.post(OLLAMA_URL, json=payload)
    response.raise_for_status()
    result = response.json()["response"]

    # 简单拆分为两部分
    if "数据库结构" in result:
        parts = result.split("数据库结构")
        return parts[0].strip(), parts[1].strip()
    return result.strip(), ""
