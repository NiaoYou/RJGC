from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import requirement, requirementgen, architecture, codegen, testing, agent

app = FastAPI(title="AI开发助手API")

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源，生产环境应该限制
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(requirement.router, prefix="/api/requirement", tags=["需求管理"])
app.include_router(requirementgen.router, prefix="/api/requirementgen", tags=["需求生成"])
app.include_router(architecture.router, prefix="/api/architecture", tags=["架构设计"])
app.include_router(codegen.router, prefix="/api/codegen", tags=["代码生成"])
app.include_router(testing.router, prefix="/api/test", tags=["测试生成"])
app.include_router(agent.router, prefix="/api/agent", tags=["智能助手"])  # 添加agent路由

@app.get("/")
def read_root():
    return {"message": "欢迎使用AI开发助手API"}
