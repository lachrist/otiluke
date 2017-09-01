
function fac (n) {
  if (n <= 1)
    return 1;
  return n * fac(n-1);
}

if (fac(6) !== 720)
  throw new Error("fac6 failure");
