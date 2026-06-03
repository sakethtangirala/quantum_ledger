import sys
import os

# Ensure project root is on sys.path so `backend` package is importable
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.rsa import build_rsa
from backend.shor_simulation import run_shor
from backend.merkle import build_merkle, DEFAULT_TXS


def test_rsa():
    rsa = build_rsa()
    assert rsa.N == 15
    assert rsa.cipher == 13
    assert rsa.p == 3
    assert rsa.q == 5
    assert rsa.phi == 8
    assert rsa.d == 7
    assert len(rsa.components) == 5


def test_shor():
    shor = run_shor(15, 7)
    assert shor.period == 4
    assert shor.Q == 16
    assert shor.qubits == 4
    # Verify the correct factors appear in the result string
    assert "3" in shor.result.factored
    assert "5" in shor.result.factored
    # QFT peaks at 0, 4, 8, 12
    assert shor.qftPeaks == [0, 4, 8, 12]
    # Peak bars should have height 1.0
    peak_bars = {bar.k: bar.h for bar in shor.qftBars if bar.k in shor.qftPeaks}
    assert all(h == 1.0 for h in peak_bars.values())


def test_merkle():
    merkle = build_merkle(DEFAULT_TXS)
    assert merkle.root.hash.startswith("0x")
    assert len(merkle.root.hash) > 0
    assert len(merkle.leaves) == 4
    assert len(merkle.branches) == 2
    assert len(merkle.txs) == 4
    # Verify tree structure linkage
    assert merkle.branches[0].frm == ["L0", "L1"]
    assert merkle.branches[1].frm == ["L2", "L3"]
    assert merkle.root.frm == ["H01", "H23"]
    # Serialised output must use "from" key (not "frm")
    dumped = merkle.model_dump(by_alias=True)
    assert "from" in dumped["branches"][0]
    assert "from" in dumped["root"]
