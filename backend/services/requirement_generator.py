import os
from openai import OpenAI

# 初始化DeepSeek OpenAI兼容客户端
client = OpenAI(
    api_key=os.getenv("DEEPSEEK_API_KEY"),  # 推荐设置环境变量
    base_url="https://api.deepseek.com",  # DeepSeek API地址
)

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

    response = client.chat.completions.create(
        model="deepseek-chat",  # 使用DeepSeek-V3模型
        messages=[
            {"role": "system", "content": "你是一个专业的系统分析师"},
            {"role": "user", "content": prompt}
        ]
    )

    return response.choices[0].message.content.strip()
