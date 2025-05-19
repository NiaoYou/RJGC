import requests
import os

# 从环境变量读取 OLLAMA 接口配置
OLLAMA_URL = os.getenv("LLM_API_URL", "http://localhost:11434/api/generate")
LLM_MODEL = os.getenv("LLM_MODEL", "llama3")

def generate_tests(code: str) -> str:
    """
    调用本地大模型（如Ollama），为输入的Python模块代码生成 pytest 单元测试代码。
    """
    prompt = f"""
    你是一个专业的Python测试工程师。请基于以下 FastAPI 模块代码，生成完整的 pytest 单元测试文件。
    要求如下：
    - 使用 pytest 框架
    - 包含合理的测试覆盖
    - 如果存在数据库依赖，请使用 mock 或 fixture 模拟
    - 用中文添加必要的注释解释测试意图

    以下是代码：
    ```python
    {code}
    请返回：
    # test_*.py 单元测试文件内容
    """
    payload = {
        "model": LLM_MODEL,
        "prompt": prompt,
        "stream": False
    }

    try:
        response = requests.post(OLLAMA_URL, json=payload)
        response.raise_for_status()
        result = response.json()
        return result.get("response", "").strip()
    except requests.RequestException as e:
        raise RuntimeError(f"调用大模型失败: {e}")

