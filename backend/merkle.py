import hashlib
from .models import MerkleModel, MerkleTx, MerkleLeaf, MerkleBranch, MerkleRoot

DEFAULT_TXS = [
    "alice \u2192 bob   \u26d3 4.20",
    "bob \u2192 carol   \u26d3 1.15",
    "carol \u2192 dave  \u26d3 9.07",
    "dave \u2192 erin   \u26d3 0.33",
]


def _sha256(data: str) -> str:
    return hashlib.sha256(data.encode()).hexdigest()


def build_merkle(transactions: list | None = None) -> MerkleModel:
    if transactions is None:
        transactions = DEFAULT_TXS

    # Leaf hashes — real SHA-256 truncated to 16 hex chars for display
    leaf_hashes = [_sha256(tx)[:16] for tx in transactions]

    txs = [
        MerkleTx(id=f"TX-{i}", label=tx, leaf=i)
        for i, tx in enumerate(transactions)
    ]

    leaves = [
        MerkleLeaf(id=f"L{i}", hash=leaf_hashes[i])
        for i in range(len(transactions))
    ]

    # Branch hashes: SHA-256 of the two child leaf hashes concatenated
    h01 = _sha256(leaf_hashes[0] + leaf_hashes[1])[:16]
    h23 = _sha256(leaf_hashes[2] + leaf_hashes[3])[:16]

    branches = [
        MerkleBranch(id="H01", hash=h01, frm=["L0", "L1"]),
        MerkleBranch(id="H23", hash=h23, frm=["L2", "L3"]),
    ]

    # Root: SHA-256 of both branch hashes; "0x" prefix matches frontend display
    root_hash = "0x" + _sha256(h01 + h23)[:16]
    root = MerkleRoot(id="ROOT", hash=root_hash, frm=["H01", "H23"])

    return MerkleModel(
        txs=txs,
        leaves=leaves,
        branches=branches,
        root=root,
        hex="0123456789abcdef",
    )
