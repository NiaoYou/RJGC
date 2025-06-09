import os
from openai import OpenAI
import json
import asyncio
from services.conversation_manager import get_conversation_history, append_message

# 初始化DeepSeek OpenAI兼容客户端
client = OpenAI(
    api_key=os.getenv("DEEPSEEK_API_KEY"),  # 推荐设置环境变量
    base_url="https://api.deepseek.com",  # DeepSeek API地址
)

def call_llm(prompt: str, system_prompt: str = "你是一个资深的系统架构专家", conversation_id: str = None) -> str:
    try:
        # 组装 messages
        messages = []
        if conversation_id:
            messages.extend(get_conversation_history(conversation_id))
        
        messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        # 调用 DeepSeek API
        completion = client.chat.completions.create(
            model="deepseek-chat",  # 使用 DeepSeek V3 模型
            messages=messages,
        )
        reply = completion.choices[0].message.content.strip()

        # 记录对话历史
        if conversation_id:
            append_message(conversation_id, "user", prompt)
            append_message(conversation_id, "assistant", reply)

        return reply
    
    except Exception as e:
        print("❌ 模型调用失败：", e)
        raise RuntimeError(f"模型调用失败：{e}")

def generate_architecture(requirement_text: str, conversation_id: str = None) -> tuple[str, str]:
    prompt = f"""你是系统架构专家，请根据以下软件需求生成架构建议和数据库设计DDL：
需求描述：
{requirement_text}

请严格按照以下格式输出：
【架构设计】
...
【数据库设计】
...
"""
    result = call_llm(prompt, conversation_id=conversation_id)

    if "数据库设计" in result:
        parts = result.split("数据库设计")
        return parts[0].replace("【架构设计】", "").strip(), parts[1].strip()

    return result.strip(), ""

async def generate_architecture_stream(requirement_text: str, conversation_id: str = None):
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
        # 组装 messages
        messages = []
        if conversation_id:
            messages.extend(get_conversation_history(conversation_id))
        
        messages.append({"role": "system", "content": "你是一个资深的系统架构专家"})
        messages.append({"role": "user", "content": prompt})

        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=messages,
            stream=True  # 启用流式输出
        )
        
        full_reply = ""  # 用于记录 assistant 回复内容
        
        for chunk in response:
            if chunk.choices and chunk.choices[0].delta.content:
                content = chunk.choices[0].delta.content
                full_reply += content
                yield f"data: {json.dumps({'content': content})}\n\n"
                await asyncio.sleep(0.01)  # 小延迟，避免过快

        # 记录对话历史
        if conversation_id:
            append_message(conversation_id, "user", prompt)
            append_message(conversation_id, "assistant", full_reply)
        
    except Exception as e:
        print(f"流式生成失败: {e}")
        yield f"data: {json.dumps({'error': str(e)})}\n\n"
