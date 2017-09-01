
function fibo (n) {
  if (n <= 1)
    return n;
  return fibo(n-1) + fibo(n-2);
}

if (fibo(9) !== 34)
  throw new Error("fibo9 failure");
