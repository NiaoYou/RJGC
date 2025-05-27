import os
from openai import OpenAI

# 初始化DeepSeek OpenAI兼容客户端
client = OpenAI(
    api_key=os.getenv("DEEPSEEK_API_KEY"),  # 推荐设置环境变量
    base_url="https://api.deepseek.com",  # DeepSeek API地址
)

def call_llm(prompt: str, system_prompt: str = "你是一个资深的测试工程师") -> str:
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

def generate_tests(code: str) -> str:
    prompt = f"""请为以下 Python 模块代码生成 pytest 风格的单元测试用例：
```python
{code}
测试内容应包括接口调用、边界值处理、错误情况断言。
"""
    return call_llm(prompt)
