import os
from openai import OpenAI
import json
import asyncio

# 初始化DeepSeek OpenAI兼容客户端
client = OpenAI(
    api_key=os.getenv("DEEPSEEK_API_KEY"),  # 推荐设置环境变量
    base_url="https://api.deepseek.com",  # DeepSeek API地址
)

def generate_requirement(topic: str) -> str:
    prompt = f"""
你是一个资深系统分析师，请根据以下模块主题，生成详细的模块功能需求说明文档，输出格式应简洁、系统化，便于开发人员快速理解并实现。

请按如下结构输出：
模块主题：{topic}
1. 模块名称  
2. 模块功能概述  
3. 接口设计（HTTP 方法、路径、请求参数、返回结构）  
4. 用例设计（用例编号、名称、主要参与者、前置条件、基本流程、扩展流程、后置结果）  
5. UML 建模建议（用例图、类图、可选的时序图/活动图描述）  
6. 其他注意事项（鉴权、异常处理、接口幂等性等
"""

    response = client.chat.completions.create(
        model="deepseek-chat",  # 使用DeepSeek-V3模型
        messages=[
            {"role": "system", "content": "你是一个专业的系统分析师"},
            {"role": "user", "content": prompt}
        ]
    )

    return response.choices[0].message.content.strip()

async def generate_requirement_stream(topic: str):
    """流式生成需求文档"""
    prompt = f"""
你是一个资深系统分析师，请根据以下模块主题，生成详细的模块功能需求说明文档，输出格式应简洁、系统化，便于开发人员快速理解并实现。

请按如下结构输出：
模块主题：{topic}
1. 模块名称  
2. 模块功能概述  
3. 接口设计（HTTP 方法、路径、请求参数、返回结构）  
4. 用例设计（用例编号、名称、主要参与者、前置条件、基本流程、扩展流程、后置结果）  
5. UML 建模建议（用例图、类图、可选的时序图/活动图描述）  
6. 其他注意事项（鉴权、异常处理、接口幂等性等
"""

    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": "你是一个专业的系统分析师"},
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
