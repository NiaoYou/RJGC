# @Author  : eco
# @Date    ：2025/5/13 16:04
# @Function: 全局配置（MySQL/OLLAMA地址）
import os
from dotenv import load_dotenv

# 加载 .env 文件中的环境变量
load_dotenv()

# 数据库配置
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_USER = os.getenv("DB_USER", "root")
DB_PASS = os.getenv("DB_PASS", "password")
DB_NAME = os.getenv("DB_NAME", "softeng_platform")

