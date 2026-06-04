import math
from .models import ShorModel, ShorPower, QFTBar, ShorStep, ShorResult
def run_shor(N=15, a=7):
    r, val = 1, a % N
    while val != 1:
        r += 1
        val = (val*a) % N
    qubits = math.ceil(math.log2(N))
    Q = 2**qubits
    powers = [ShorPower(x=x, v=pow(a,x,N)) for x in range(Q//2)]
    step = Q//r
    qft_peaks = list(range(0, Q, step))
    qft_bars = []
    for k in range(Q):
        h = 1.0 if k % step == 0 else round(0.04+(k*13%7)/140.0, 4)
        qft_bars.append(QFTBar(k=k, h=h))
    half_r = r//2
    x_raw = pow(a, half_r)
    f1 = math.gcd(x_raw-1, N)
    f2 = math.gcd(x_raw+1, N)
    peaks_str = ",".join(str(p) for p in qft_peaks)
    steps = [
        ShorStep(n="01", title="choose base",     body=f"pick a = {a}, coprime to N={N}  \u00b7  gcd({a},{N})=1"),
        ShorStep(n="02", title="superposition",   body=f"load counting register into equal superposition of 0\u2026{N-1}"),
        ShorStep(n="03", title="modular exp",     body=f"compute |x, {a}\u02e3 mod {N}\u27e9 in parallel across all x"),
        ShorStep(n="04", title="quantum fourier", body="apply QFT \u2014 interference concentrates amplitude"),
        ShorStep(n="05", title="measure period",  body=f"measurement peaks at {peaks_str}  \u2192  period r = {r}"),
        ShorStep(n="06", title="classical post",  body=f"r even \u2713  \u00b7  {a}^(r/2)={x_raw} \u2262 \u22121 mod {N} \u2713"),
        ShorStep(n="07", title="extract factors", body=f"gcd({x_raw-1},{N})={f1}   gcd({x_raw+1},{N})={f2}   \u2192   {N} = {f1} \u00d7 {f2}"),
    ]
    result = ShorResult(
        factored=f"N = {N}  =  {f1} \u00d7 {f2}",
        complexity="O(log\u00b3 N) steps",
        verdict="PRIVATE KEY RECOVERED",
    )
    return ShorModel(a=a, period=r, qubits=qubits, Q=Q, powers=powers, qftPeaks=qft_peaks, qftBars=qft_bars, steps=steps, result=result)
