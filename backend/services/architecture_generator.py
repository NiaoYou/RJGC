import os
from openai import OpenAI
import json
import asyncio

# 初始化DeepSeek OpenAI兼容客户端
client = OpenAI(
    api_key=os.getenv("DEEPSEEK_API_KEY"),  # 推荐设置环境变量
    base_url="https://api.deepseek.com",  # DeepSeek API地址
)

def call_llm(prompt: str, system_prompt: str = "你是一个资深的系统架构专家") -> str:
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
    
def generate_architecture(requirement_text: str) -> tuple[str, str]:
    prompt = f"""你是系统架构专家，请根据以下软件需求生成架构建议和数据库设计DDL：
需求描述：
{requirement_text}

请严格按照以下格式输出：
【架构设计】
...
【数据库设计】
...
"""
    result = call_llm(prompt)

    if "数据库设计" in result:
        parts = result.split("数据库设计")
        return parts[0].replace("【架构设计】", "").strip(), parts[1].strip()

    return result.strip(), ""

async def generate_architecture_stream(requirement_text: str):
    """流式生成架构设计"""
    prompt = f"""你是系统架构专家，请根据以下软件需求生成架构建议和数据库设计DDL：
需求描述：
{requirement_text}

请严格按照以下格式输出：
【架构设计】
...
【数据库设计】
...
"""
    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": "你是一个资深的系统架构专家"},
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
