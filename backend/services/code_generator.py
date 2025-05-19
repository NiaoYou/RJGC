import os
from openai import OpenAI

# 初始化阿里云百炼 OpenAI 兼容客户端
client = OpenAI(
    api_key=os.getenv("DASHSCOPE_API_KEY"),  # 推荐设置环境变量
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
)

def call_llm(prompt: str, system_prompt: str = "你是一个资深的后端开发师") -> str:
    try:
        completion = client.chat.completions.create(
            model="qwen-plus",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
            # extra_body={"enable_thinking": False},  # 如果你用的是 Qwen3 可启用
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        print("❌ 模型调用失败：", e)
        raise RuntimeError(f"模型调用失败：{e}")

def generate_module_code(description: str) -> str:
    prompt = f"""你是一个资深后端开发，请根据以下模块描述生成 FastAPI 模块代码，包含路由和服务逻辑。
模块描述：
{description}

请返回完整的 Python 源代码。
"""
    return call_llm(prompt)