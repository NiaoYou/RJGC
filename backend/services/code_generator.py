import os
from openai import OpenAI
import json
import asyncio

# 初始化DeepSeek OpenAI兼容客户端
client = OpenAI(
    api_key=os.getenv("DEEPSEEK_API_KEY"),  # 推荐设置环境变量
    base_url="https://api.deepseek.com",  # DeepSeek API地址
)

def call_llm(prompt: str, system_prompt: str = "你是一个资深的前后端全栈开发师") -> str:
    try:
        completion = client.chat.completions.create(
            model="deepseek-chat",  # 使用DeepSeek-V3模型
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        print("❌ 模型调用失败：", e)
        raise RuntimeError(f"模型调用失败：{e}")

def generate_module_code(description: str) -> str:
    prompt = f"""你是一个前后端全栈开发，请根据以下模块描述生成 FastAPI 模块代码，包含路由和服务逻辑。
模块描述：
{description}

请返回完整的 Python 源代码。
"""
    return call_llm(prompt)

async def generate_module_code_stream(description: str):
    """流式生成代码"""
    prompt = f"""你是一个前后端全栈开发，请根据以下模块描述生成 FastAPI 模块代码，包含路由和服务逻辑。
模块描述：
{description}

请返回完整的 Python 源代码。
"""
    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": "你是一个资深的前后端全栈开发师"},
                {"role": "user", "content": prompt}
            ],
            stream=True  # 启用流式输出
        )
        
        for chunk in response:
            if chunk.choices and chunk.choices[0].delta.content:
                content = chunk.choices[0].delta.content
                yield f"data: {json.dumps({'content': content})}\n\n"
                await asyncio.sleep(0.01)  # 小延迟，避免过快
                
    except Exception as e:
        print(f"流式生成失败: {e}")
        yield f"data: {json.dumps({'error': str(e)})}\n\n"
