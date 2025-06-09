import os
from openai import OpenAI
import json
import asyncio
from services.conversation_manager import get_conversation_history, append_message

client = OpenAI(
    api_key=os.getenv("DEEPSEEK_API_KEY"),
    base_url="https://api.deepseek.com",
)

def generate_tests(code: str, conversation_id: str = None) -> str:
    prompt = f"""请为以下 Python 模块代码生成 pytest 风格的单元测试用例：
{code}
测试内容应包括接口调用、边界值处理、错误情况断言。
"""
    messages = []
    if conversation_id:
        messages.extend(get_conversation_history(conversation_id))
    messages.append({"role": "system", "content": "你是一个资深的测试工程师"})
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

async def generate_tests_stream(code: str, conversation_id: str = None):
    prompt = f"""请为以下 Python 模块代码生成 pytest 风格的单元测试用例：

    {code}
    测试内容应包括接口调用、边界值处理、错误情况断言。
    """
    try:
        messages = []
        if conversation_id:
            messages.extend(get_conversation_history(conversation_id))

        messages.append({"role": "system", "content": "你是一个资深的测试工程师"})
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