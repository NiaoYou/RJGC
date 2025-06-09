# services/conversation_manager.py

from collections import defaultdict

# 简单内存版，后续可替换为 Redis 或数据库
_conversations = defaultdict(list)

def get_conversation_history(conversation_id: str):
    return _conversations[conversation_id]

def append_message(conversation_id: str, role: str, content: str):
    _conversations[conversation_id].append({"role": role, "content": content})

def clear_conversation(conversation_id: str):
    _conversations.pop(conversation_id, None)
