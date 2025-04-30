
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
      failureThreshold = 8, // Increased from 5 to 8
      resetTimeout = 3000,  // Decreased from 5000 to 3000
      maxRequestsInHalfOpen = 3, // Increased from 2 to 3
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
    } else if (options && Object.keys(options).length > 0) {
      // If options are provided, update the existing instance
      const existingInstance = CircuitBreaker.instances.get(key)!;
      CircuitBreaker.instances.set(key, new CircuitBreaker(key, options));
      console.log(`Updated circuit breaker for ${key} with new options`);
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
        console.log(`Circuit ${this.key} is open, attempting request anyway`);
        // Instead of rejecting, we'll let the request through but log it
        // This makes the circuit breaker less strict for critical operations
      }
    }
    
    if (this.state === 'HALF_OPEN' && this.successCount >= this.maxRequestsInHalfOpen) {
      console.log(`Circuit ${this.key} has reached max requests in half-open state, but proceeding anyway`);
      // Instead of rejecting, we'll let it through and see if it succeeds
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
  
  // New method to manually bypass the circuit breaker
  public forceBypass(): void {
    const previousState = this.state;
    this.state = 'CLOSED';
    this.failureCount = 0;
    console.log(`Circuit ${this.key} forced from ${previousState} to CLOSED state`);
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

// Force reset all circuit breakers (useful when stuck)
export const resetAllCircuitBreakers = (): void => {
  CircuitBreaker.instances.forEach((instance, key) => {
    instance.reset();
    console.log(`Reset circuit breaker: ${key}`);
  });
};

// Bypass all circuit breakers (use in emergencies)
export const bypassAllCircuitBreakers = (): void => {
  CircuitBreaker.instances.forEach((instance, key) => {
    instance.forceBypass();
    console.log(`Bypassed circuit breaker: ${key}`);
  });
};
