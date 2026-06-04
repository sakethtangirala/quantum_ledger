import math
from .models import RSAModel, RSAComponent, RSASandboxResponse
def _is_prime(n):
    if n < 2: return False
    if n == 2: return True
    if n % 2 == 0: return False
    for i in range(3, int(n**0.5)+1, 2):
        if n % i == 0: return False
    return True
def _find_e(phi):
    for e in (3,5,7,11,13,17,19,23,29,31,37,41,43,47,65537):
        if e < phi and math.gcd(e, phi) == 1: return e
    e = 3
    while math.gcd(e, phi) != 1: e += 2
    return e
def compute_rsa(p, q, message):
    if not _is_prime(p): raise ValueError(f"{p} is not prime")
    if not _is_prime(q): raise ValueError(f"{q} is not prime")
    if p == q: raise ValueError("p and q must be distinct primes")
    N = p * q
    if not (0 < message < N): raise ValueError(f"message must satisfy 0 < message < {N} (= p·q)")
    phi = (p-1)*(q-1)
    if phi < 3: raise ValueError("phi(N) too small — choose larger primes")
    e = _find_e(phi)
    d = pow(e, -1, phi)
    cipher = pow(message, e, N)
    decrypted = pow(cipher, d, N)
    return RSASandboxResponse(p=p, q=q, N=N, phi=phi, e=e, d=d, message=message, cipher=cipher, decrypted=decrypted)
def build_rsa():
    p, q = 3, 5
    N = p*q
    phi = (p-1)*(q-1)
    e = 7
    d = pow(e, -1, phi)
    message = 7
    cipher = pow(message, e, N)
    components = [
        RSAComponent(sym="p", val=str(p), label="secret prime"),
        RSAComponent(sym="q", val=str(q), label="secret prime"),
        RSAComponent(sym="N", val=str(N), label="public modulus  N = p\u00b7q"),
        RSAComponent(sym="e", val=str(e), label="public exponent"),
        RSAComponent(sym="d", val=str(d), label="private exponent"),
    ]
    return RSAModel(p=p, q=q, N=N, e=e, d=d, phi=phi, message=message, cipher=cipher, components=components)
