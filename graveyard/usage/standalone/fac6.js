
function fac (n) {
  if (n <= 1)
    return 1;
  return n * fac(n-1);
}

console.log(fac(6));
