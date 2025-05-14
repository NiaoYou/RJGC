from models.user import Base as UserBase
from models.requirement import Base as ReqBase
from models.task import Base as TaskBase
from db import engine

def init():
    UserBase.metadata.create_all(bind=engine)
    ReqBase.metadata.create_all(bind=engine)
    TaskBase.metadata.create_all(bind=engine)
    print("✅ 数据库初始化完成")

if __name__ == "__main__":
    init()
