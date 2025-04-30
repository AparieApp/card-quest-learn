
/**
 * Circuit Breaker utility to prevent infinite loops and excessive API calls
 */

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerOptions {
  failureThreshold?: number;
  resetTimeout?: number;
  maxRequestsInHalfOpen?: number;
}

export class CircuitBreaker {
  private static instances: Map<string, CircuitBreaker> = new Map();
  private state: CircuitState = 'CLOSED';
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime = 0;
  private readonly failureThreshold: number;
  private readonly resetTimeout: number;
  private readonly maxRequestsInHalfOpen: number;
  
  private constructor(
    private readonly key: string,
    {
      failureThreshold = 5, // Increased from 3 to 5
      resetTimeout = 5000,  // Decreased from 10000 to 5000
      maxRequestsInHalfOpen = 2, // Increased from 1 to 2
    }: CircuitBreakerOptions = {}
  ) {
    this.failureThreshold = failureThreshold;
    this.resetTimeout = resetTimeout;
    this.maxRequestsInHalfOpen = maxRequestsInHalfOpen;
    
    console.log(`Circuit breaker initialized for ${key} with threshold ${failureThreshold}, timeout ${resetTimeout}ms`);
  }
  
  public static getInstance(key: string, options: CircuitBreakerOptions = {}): CircuitBreaker {
    if (!CircuitBreaker.instances.has(key)) {
      CircuitBreaker.instances.set(key, new CircuitBreaker(key, options));
    }
    
    return CircuitBreaker.instances.get(key)!;
  }
  
  public async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      // Check if it's time to try again
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        console.log(`Circuit ${this.key} entering half-open state`);
        this.state = 'HALF_OPEN';
        this.successCount = 0;
      } else {
        console.log(`Circuit ${this.key} is open, rejecting request`);
        throw new Error(`Circuit for ${this.key} is OPEN`);
      }
    }
    
    if (this.state === 'HALF_OPEN' && this.successCount >= this.maxRequestsInHalfOpen) {
      console.log(`Circuit ${this.key} has reached max requests in half-open state`);
      throw new Error(`Circuit for ${this.key} has reached max requests in HALF_OPEN state`);
    }
    
    try {
      const result = await fn();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }
  
  private recordSuccess(): void {
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      
      if (this.successCount >= this.maxRequestsInHalfOpen) {
        console.log(`Circuit ${this.key} closing after successful operation in half-open state`);
        this.state = 'CLOSED';
        this.failureCount = 0;
        this.successCount = 0;
      }
    } else {
      this.failureCount = Math.max(0, this.failureCount - 1); // Gradually decrease failure count on success
    }
  }
  
  private recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.state === 'HALF_OPEN' || this.failureCount >= this.failureThreshold) {
      console.log(`Circuit ${this.key} opening after ${this.failureCount} failures`);
      this.state = 'OPEN';
    }
  }
  
  public reset(): void {
    console.log(`Circuit ${this.key} manually reset`);
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = 0;
  }
  
  public getState(): CircuitState {
    return this.state;
  }
}

// Export a simpler function to use the circuit breaker with automatic key generation
export const withCircuitBreaker = async <T>(
  fn: () => Promise<T>,
  key: string,
  options: CircuitBreakerOptions = {}
): Promise<T> => {
  const breaker = CircuitBreaker.getInstance(key, options);
  return breaker.execute(fn);
};
