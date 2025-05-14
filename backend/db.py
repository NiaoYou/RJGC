# @Author  : eco
# @Date    ：2025/5/13 16:03
# @Function: MySQL数据库连接管理

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from config import DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME

# 构造 MySQL 连接字符串
DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"

# 创建 SQLAlchemy 引擎和会话工厂
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# FastAPI 依赖项：获取数据库会话
def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
