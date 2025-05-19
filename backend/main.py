# @Author  : eco
# @Date    ：2025/5/13 15:57
# @Function: 应用主入口

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import (
    user,
    requirement,
    architecture,
    codegen,
    testing,
    requirementgen,
    document
)

app = FastAPI(
    title="软件工程平台 API",
    description="支持多Agent + 本地大模型协作的智能开发平台",
    version="1.0.0"
)

# 跨域设置（如前后端分离）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 建议生产环境中指定域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册API路由
app.include_router(user.router, prefix="/api/user", tags=["用户"])
app.include_router(requirement.router, prefix="/api/requirement", tags=["需求"])
app.include_router(architecture.router, prefix="/api/architecture", tags=["架构生成"])
app.include_router(codegen.router, prefix="/api/codegen", tags=["代码生成"])
app.include_router(testing.router, prefix="/api/test", tags=["测试生成"])
app.include_router(requirementgen.router, prefix="/api/requirementgen", tags=["需求生成"])
app.include_router(document.router, prefix="/api/document", tags=["文档管理"])

# 启动提示
@app.get("/")
def read_root():
    return {"message": "欢迎使用软工平台 API。请访问 /docs 查看接口文档"}
