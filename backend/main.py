import math
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .rsa import build_rsa, compute_rsa
from .shor_simulation import run_shor
from .merkle import build_merkle, DEFAULT_TXS
from .models import CompareModel, CompareEntry, RSASandboxRequest, MerkleSandboxRequest, ShorSandboxRequest
app = FastAPI(title="Quantum Ledger API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
_COMPARE = CompareModel(
    rsa=CompareEntry(name="RSA-2048", basis="integer factorization", classical="super-polynomial", quantum="polynomial \u2014 O(log\u00b3 N)", vuln=100, verdict="BROKEN"),
    merkle=CompareEntry(name="Merkle / SHA-256", basis="one-way hashing", classical="pre-image resistant", quantum="Grover \u00bd key only \u2014 no period", vuln=24, verdict="RESILIENT"),
)
@app.get("/api/rsa")
async def get_rsa():
    try: return build_rsa().model_dump()
    except Exception as exc: return JSONResponse(status_code=500, content={"error": str(exc)})
@app.get("/api/shor")
async def get_shor():
    try: return run_shor(15, 7).model_dump()
    except Exception as exc: return JSONResponse(status_code=500, content={"error": str(exc)})
@app.get("/api/merkle")
async def get_merkle():
    try: return build_merkle(DEFAULT_TXS).model_dump(by_alias=True)
    except Exception as exc: return JSONResponse(status_code=500, content={"error": str(exc)})
@app.get("/api/compare")
async def get_compare():
    try: return _COMPARE.model_dump()
    except Exception as exc: return JSONResponse(status_code=500, content={"error": str(exc)})
@app.post("/api/sandbox/rsa")
async def sandbox_rsa(req: RSASandboxRequest):
    try: return compute_rsa(req.p, req.q, req.message).model_dump()
    except ValueError as exc: raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc: return JSONResponse(status_code=500, content={"error": str(exc)})
@app.post("/api/sandbox/merkle")
async def sandbox_merkle(req: MerkleSandboxRequest):
    try:
        if len(req.transactions) != 4: raise ValueError("exactly 4 transactions required")
        return build_merkle(req.transactions).model_dump(by_alias=True)
    except ValueError as exc: raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc: return JSONResponse(status_code=500, content={"error": str(exc)})
def _is_prime(n):
    if n < 2: return False
    if n == 2: return True
    if n % 2 == 0: return False
    for i in range(3, int(n**0.5)+1, 2):
        if n % i == 0: return False
    return True
@app.post("/api/sandbox/shor")
async def sandbox_shor(req: ShorSandboxRequest):
    try:
        N, a = req.N, req.a
        if N < 4: raise ValueError("N must be ≥ 4")
        if N > 1000: raise ValueError("keep N ≤ 1000 for the classical simulation")
        if _is_prime(N): raise ValueError(f"{N} is prime — Shor's factors composites, try {N-1} or {N+1}")
        if not (1 < a < N): raise ValueError(f"a must satisfy 1 < a < {N}")
        g = math.gcd(a, N)
        if g != 1: raise ValueError(f"gcd({a},{N}) = {g} ≠ 1 — choose a coprime to N (or you already found a factor: {g})")
        return run_shor(N, a).model_dump()
    except ValueError as exc: raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc: return JSONResponse(status_code=500, content={"error": str(exc)})
@app.get("/api/all")
async def get_all():
    try:
        return {
            "rsa": build_rsa().model_dump(),
            "shor": run_shor(15, 7).model_dump(),
            "merkle": build_merkle(DEFAULT_TXS).model_dump(by_alias=True),
            "compare": _COMPARE.model_dump(),
        }
    except Exception as exc: return JSONResponse(status_code=500, content={"error": str(exc)})
