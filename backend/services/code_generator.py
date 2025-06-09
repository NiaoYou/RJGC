import os
from openai import OpenAI
import json
import asyncio
from services.conversation_manager import get_conversation_history, append_message

client = OpenAI(
    api_key=os.getenv("DEEPSEEK_API_KEY"),
    base_url="https://api.deepseek.com",
)

def generate_module_code(description: str, conversation_id: str = None) -> str:
    prompt = f"""你是一个资深后端开发，请根据以下模块描述生成 FastAPI 模块代码，包含路由和服务逻辑。
模块描述：
{description}

请返回完整的 Python 源代码。
"""
    messages = []
    if conversation_id:
        messages.extend(get_conversation_history(conversation_id))

    messages.append({"role": "system", "content": "你是一个资深的后端开发师"})
    messages.append({"role": "user", "content": prompt})

    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=messages
    )

    reply = response.choices[0].message.content.strip()

    if conversation_id:
        append_message(conversation_id, "user", prompt)
        append_message(conversation_id, "assistant", reply)

    return reply

async def generate_module_code_stream(description: str, conversation_id: str = None):
    prompt = f"""你是一个资深后端开发，请根据以下模块描述生成 FastAPI 模块代码，包含路由和服务逻辑。
模块描述：
{description}

请返回完整的 Python 源代码。
"""
    try:
        messages = []
        if conversation_id:
            messages.extend(get_conversation_history(conversation_id))

        messages.append({"role": "system", "content": "你是一个资深的后端开发师"})
        messages.append({"role": "user", "content": prompt})

        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=messages,
            stream=True
        )

        full_reply = ""

        for chunk in response:
            if chunk.choices and chunk.choices[0].delta.content:
                content = chunk.choices[0].delta.content
                full_reply += content
                yield f"data: {json.dumps({'content': content})}\n\n"
                await asyncio.sleep(0.01)

        if conversation_id:
            append_message(conversation_id, "user", prompt)
            append_message(conversation_id, "assistant", full_reply)

    except Exception as e:
        print(f"流式生成失败: {e}")
        yield f"data: {json.dumps({'error': str(e)})}\n\n"
