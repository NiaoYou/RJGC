from db import engine
from models.base import Base

# 导入所有模型，确保它们注册到 Base.metadata 中
import models.user
import models.requirement
import models.task

def init():
    print("🔧 正在创建数据库表结构...")
    Base.metadata.create_all(bind=engine)
    print("✅ 数据库初始化完成！")

if __name__ == "__main__":
    init()
