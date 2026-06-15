from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
import httpx

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

SPRING_BOOT_URL = "http://localhost:8081"   # PostgreSQL-backed (users, workflows, steps, progress)
NODE_URL        = "http://localhost:8082"   # MongoDB-backed (reminders, activity log)

# Paths whose first segment matches these go to the Node service; everything else
# goes to Spring Boot.
NODE_PREFIXES = ("reminders", "activity")


def pick_backend(path: str) -> str:
    first = path.split("/", 1)[0]
    return NODE_URL if first in NODE_PREFIXES else SPRING_BOOT_URL

@app.get("/")
async def root():
    return {"status": "gateway running"}

@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
async def proxy(path: str, request: Request):
    # Handle OPTIONS preflight — just return 200
    if request.method == "OPTIONS":
        return Response(status_code=200)

    target_url = f"{pick_backend(path)}/{path}"
    body = await request.body()
    headers = {k: v for k, v in request.headers.items() if k.lower() != "host"}

    async with httpx.AsyncClient() as client:
        response = await client.request(
            method=request.method,
            url=target_url,
            headers=headers,
            content=body,
            params=request.query_params,
        )

    return Response(
        content=response.content,
        status_code=response.status_code,
        media_type=response.headers.get("content-type"),
    )