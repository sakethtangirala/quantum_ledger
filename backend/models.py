from __future__ import annotations
from pydantic import BaseModel, Field, ConfigDict
from typing import List


# ── RSA ──────────────────────────────────────────────────────────────────────

class RSAComponent(BaseModel):
    sym: str
    val: str
    label: str


class RSAModel(BaseModel):
    p: int
    q: int
    N: int
    e: int
    d: int
    phi: int
    message: int
    cipher: int
    components: List[RSAComponent]


# ── Shor ─────────────────────────────────────────────────────────────────────

class ShorPower(BaseModel):
    x: int
    v: int


class QFTBar(BaseModel):
    k: int
    h: float


class ShorStep(BaseModel):
    n: str
    title: str
    body: str


class ShorResult(BaseModel):
    factored: str
    complexity: str
    verdict: str


class ShorModel(BaseModel):
    a: int
    period: int
    qubits: int
    Q: int
    powers: List[ShorPower]
    qftPeaks: List[int]
    qftBars: List[QFTBar]
    steps: List[ShorStep]
    result: ShorResult


# ── Merkle ────────────────────────────────────────────────────────────────────
# NOTE: "from" is a Python keyword, so the Python field is named `frm` and
# serialization_alias="from" ensures JSON output matches the frontend spec.

class MerkleTx(BaseModel):
    id: str
    label: str
    leaf: int


class MerkleLeaf(BaseModel):
    id: str
    hash: str


class MerkleBranch(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id: str
    hash: str
    frm: List[str] = Field(serialization_alias="from")


class MerkleRoot(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id: str
    hash: str
    frm: List[str] = Field(serialization_alias="from")


class MerkleModel(BaseModel):
    txs: List[MerkleTx]
    leaves: List[MerkleLeaf]
    branches: List[MerkleBranch]
    root: MerkleRoot
    hex: str


# ── Compare ───────────────────────────────────────────────────────────────────

class CompareEntry(BaseModel):
    name: str
    basis: str
    classical: str
    quantum: str
    vuln: int
    verdict: str


class CompareModel(BaseModel):
    rsa: CompareEntry
    merkle: CompareEntry


# ── Sandbox ───────────────────────────────────────────────────────────────────

class RSASandboxRequest(BaseModel):
    p: int
    q: int
    message: int


class RSASandboxResponse(BaseModel):
    p: int
    q: int
    N: int
    phi: int
    e: int
    d: int
    message: int
    cipher: int
    decrypted: int


class MerkleSandboxRequest(BaseModel):
    transactions: List[str]


class ShorSandboxRequest(BaseModel):
    N: int
    a: int
