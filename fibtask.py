def fib(n):
    if n==0 or n==1: return n
    else: return fib(n-2)+fib(n-1)
print(sum(f for i in range(0,30,2) if (f:=fib(i))<=820000))
