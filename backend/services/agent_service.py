import os
from openai import OpenAI
import json
import asyncio

# 初始化DeepSeek OpenAI兼容客户端
client = OpenAI(
    api_key=os.getenv("DEEPSEEK_API_KEY"),
    base_url="https://api.deepseek.com",
)

class AgentService:
    """统一的Agent服务类，处理不同场景下的AI交互"""
    
    def __init__(self):
        self.model = "deepseek-chat"
    
    async def generate_response_stream(self, 
                                      role, 
                                      input_text, 
                                      mode="single_chat", 
                                      context=None,
                                      conversation_id=None):
        """
        生成流式响应
        
        参数:
        - role: 角色类型 (analyst, architect, developer, tester)
        - input_text: 用户输入
        - mode: 交互模式 (single_chat, meeting_room)
        - context: 额外上下文信息，如会议室中其他角色的发言
        - conversation_id: 对话ID，用于维护对话状态
        """
        
        # 根据角色和模式选择合适的提示词
        system_prompt, user_prompt = self._get_prompts(role, input_text, mode, context)
        
        try:
            response = client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                stream=True
            )
            
            for chunk in response:
                if chunk.choices and chunk.choices[0].delta.content:
                    content = chunk.choices[0].delta.content
                    yield f"data: {json.dumps({'content': content})}\n\n"
                    await asyncio.sleep(0.01)
                    
        except Exception as e:
            print(f"流式生成失败: {e}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    def _get_prompts(self, role, input_text, mode, context):
        """根据角色和模式获取合适的提示词"""
        
        # 基础系统提示词
        base_system_prompts = {
            "analyst": "你是一个专业的系统分析师，你的职责是理解用户需求并提供详细的功能需求分析。请注意用户可能会对你的分析提出修改意见，你需要根据用户的反馈调整你的分析结果。",
            "architect": "你是一个资深的系统架构专家，你的职责是设计系统架构和数据库结构。请注意用户可能会对你的设计提出修改意见，你需要根据用户的反馈调整你的设计方案。",
            "developer": "你是一个资深的后端开发师，你的职责是编写实现代码。请注意用户可能会对你的代码提出修改意见，你需要根据用户的反馈调整你的代码实现。",
            "tester": "你是一个资深的测试工程师，你的职责是设计测试策略和测试用例。请注意用户可能会对你的测试方案提出修改意见，你需要根据用户的反馈调整你的测试计划。"
        }
        
        # 单聊模式的用户提示词 - 增加交互性提示
        single_chat_prompts = {
            "analyst": f"""
你是一个资深系统分析师，请根据以下模块主题，生成详细的模块功能需求说明文档，输出格式应简洁、系统化，便于开发人员快速理解并实现。

请按如下结构输出：
模块主题：{input_text}
1. 模块名称  
2. 模块功能概述  
3. 接口设计（HTTP 方法、路径、请求参数、返回结构）  
4. 用例设计（用例编号、名称、主要参与者、前置条件、基本流程、扩展流程、后置结果）  
5. UML 建模建议（用例图、类图、可选的时序图/活动图描述）  
6. 其他注意事项（鉴权、异常处理、接口幂等性等）

注意：如果用户对你的分析提出修改意见，请不要重新生成完整的需求文档，而是针对用户的反馈进行有针对性的调整和回应。
""",
            "architect": f"""你是系统架构专家，请根据以下软件需求生成架构建议和数据库设计DDL：
需求描述：
{input_text}

请严格按照以下格式输出：
【架构设计】
...
【数据库设计】
...
""",
            "developer": f"""你是一个资深后端开发，请根据以下模块描述生成 FastAPI 模块代码，包含路由和服务逻辑。
模块描述：
{input_text}

请返回完整的 Python 源代码。
""",
            "tester": f"""请为以下 Python 模块代码生成 pytest 风格的单元测试用例：
```python
{input_text}
```
测试内容应包括接口调用、边界值处理、错误情况断言。
"""
        }
        
        # 会议室模式的系统提示词
        meeting_system_prompts = {
            "analyst": "你是一个专业的系统分析师，正在参与一个团队会议，与架构师、开发工程师和测试工程师一起工作。你需要理解用户需求，与其他角色协作，并根据反馈调整你的分析。",
            "architect": "你是一个资深的系统架构专家，正在参与一个团队会议，与需求分析师、开发工程师和测试工程师一起工作。你需要基于需求分析设计系统架构，与其他角色协作，并根据反馈调整你的设计。",
            "developer": "你是一个资深的后端开发师，正在参与一个团队会议，与需求分析师、架构师和测试工程师一起工作。你需要基于需求和架构编写代码，与其他角色协作，并根据反馈调整你的实现。",
            "tester": "你是一个资深的测试工程师，正在参与一个团队会议，与需求分析师、架构师和开发工程师一起工作。你需要设计测试方案，与其他角色协作，并根据反馈调整你的测试计划。"
        }
        
        # 会议室模式的用户提示词 - 增强交互性和协作性
        meeting_room_prompts = {
            "analyst": f"""
你是需求分析师，正在与用户、架构师、开发工程师和测试工程师进行项目会议。
请根据整个对话上下文回应，而不是将每次输入视为新需求。

你的职责是：
1. 理解用户需求，提供详细的功能需求分析
2. 回应用户和其他角色对需求的疑问和建议
3. 确保需求的完整性、一致性和可行性
4. 根据讨论过程调整和完善需求

当前会议内容：
{input_text}

如果你是第一个发言，或者用户提出了新需求，请按以下结构输出：
1. 模块名称
2. 功能概述
3. 详细需求点
4. 用例描述
5. 接口建议

如果你是回应其他人的问题或建议，请直接针对性回答，不需要重复完整的需求分析。
如果讨论已经进行了多轮，请注意整合之前的讨论内容，而不是重新开始。
""",
            "architect": f"""
你是系统架构师，正在与用户、需求分析师、开发工程师和测试工程师进行项目会议。
请根据整个对话上下文回应，而不是将每次输入视为新架构设计任务。

你的职责是：
1. 基于需求分析师的需求，设计系统架构和数据库结构
2. 回应用户和其他角色对架构的疑问和建议
3. 确保架构设计的合理性、可扩展性和性能

当前会议内容：
{input_text}

如果需求分析师已经提供了需求分析，请按以下结构输出：
【架构设计】
1. 系统架构概述
2. 核心组件说明
3. 技术选型建议
4. 部署架构

【数据库设计】
1. ER图概述
2. 主要表结构
3. 索引设计

如果你是回应其他人的问题或建议，请直接针对性回答，不需要重复完整的架构设计。
""",
            "developer": f"""
你是开发工程师，正在与用户、需求分析师、架构师和测试工程师进行项目会议。
请根据整个对话上下文回应，而不是将每次输入视为新的代码生成任务。

你的职责是：
1. 基于需求分析和架构设计，编写实现代码
2. 回应用户和其他角色对代码实现的疑问和建议
3. 确保代码的质量、可维护性和性能

当前会议内容：
{input_text}

如果架构师已经提供了架构设计，请提供关键模块的代码实现，重点展示：
1. 核心数据结构
2. 主要API接口
3. 关键业务逻辑
4. 异常处理方案

如果你是回应其他人的问题或建议，请直接针对性回答，不需要提供完整的代码实现。
""",
            "tester": f"""
你是测试工程师，正在与用户、需求分析师、架构师和开发工程师进行项目会议。
请根据整个对话上下文回应，而不是将每次输入视为新的测试任务。

你的职责是：
1. 基于需求和代码实现，设计测试策略和测试用例
2. 回应用户和其他角色对测试的疑问和建议
3. 确保测试的全面性、有效性和自动化

当前会议内容：
{input_text}

如果开发工程师已经提供了代码实现，请提供测试方案，重点包括：
1. 测试策略概述
2. 单元测试用例
3. 集成测试方案
4. 性能测试考虑
5. 边界条件和异常测试

如果你是回应其他人的问题或建议，请直接针对性回答，不需要提供完整的测试方案。
"""
        }
        
        # 会议总结模式的系统提示词
        meeting_summary_prompts = {
            "analyst": "你是一个专业的系统分析师，负责整理和总结团队会议的成果。请根据会议内容，提炼出最终达成一致的方案，而不是简单复制对话内容。",
            "architect": "你是一个资深的系统架构专家，负责整理和总结团队会议的架构设计成果。请根据会议内容，提炼出最终达成一致的架构方案，而不是简单复制对话内容。",
            "developer": "你是一个资深的后端开发师，负责整理和总结团队会议的开发计划。请根据会议内容，提炼出最终达成一致的开发方案，而不是简单复制对话内容。",
            "tester": "你是一个资深的测试工程师，负责整理和总结团队会议的测试方案。请根据会议内容，提炼出最终达成一致的测试计划，而不是简单复制对话内容。"
        }
        
        # 根据模式选择合适的提示词
        if mode == "single_chat":
            system_prompt = base_system_prompts.get(role, "你是一个AI助手")
            user_prompt = single_chat_prompts.get(role, input_text)
        elif mode == "meeting_summary":
            system_prompt = meeting_summary_prompts.get(role, "你是一个AI助手，负责整理和总结团队会议的成果")
            user_prompt = f"""
请根据以下会议内容，生成一份完整的会议总结，包括最终确定的需求、架构、开发计划和测试方案。
不要简单复制对话内容，而是提炼出最终达成一致的方案，并按照以下结构组织：

1. 项目概述
2. 需求分析结果
3. 架构设计方案
4. 开发计划
5. 测试策略
6. 下一步行动计划

会议内容：
{input_text}

如果有上下文信息，请一并考虑：
{context if context else ""}
"""
        else:  # meeting_room模式
            system_prompt = meeting_system_prompts.get(role, "你是一个AI助手，正在参与一个团队会议")
            user_prompt = meeting_room_prompts.get(role, input_text)
            
            # 如果有上下文，添加到提示词中
            if context:
                user_prompt = f"{context}\n\n{user_prompt}"
        
        return system_prompt, user_prompt

# 创建单例实例
agent_service = AgentService()
