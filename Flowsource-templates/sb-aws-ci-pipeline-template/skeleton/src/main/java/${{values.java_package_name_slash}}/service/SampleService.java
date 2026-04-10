package ${{values.java_package_name}}.service;

import java.util.concurrent.TimeUnit;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpServerErrorException;

import ${{values.java_package_name}}.exception.BusinessException;
import io.github.resilience4j.bulkhead.annotation.Bulkhead;
import io.github.resilience4j.circuitbreaker.CallNotPermittedException;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import io.github.resilience4j.retry.annotation.Retry;

@Service
public class SampleService {
    @CircuitBreaker(name="helloService",fallbackMethod="fallback")
    @Bulkhead(name="helloService")
    @Retry(name="helloService")
    @RateLimiter(name="helloService")
    public String helloService() {
        // Your business logic here
        return "Hello, World!";
    }

    @CircuitBreaker(name="helloService",fallbackMethod="fallback")
    @Bulkhead(name="helloService")
    @Retry(name="helloService")
    @RateLimiter(name="helloService")
    public String failure() {
        // Your business logic here
        throw new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "This is a remote exception");
    }

    @CircuitBreaker(name="helloService",fallbackMethod="fallback")
    @Bulkhead(name="helloService")
    public String ignoreException() {
        throw new BusinessException("This exception is ignored by the CircuitBreaker of helloservice");
    }

    public String fallback(CallNotPermittedException e) {
        return "Fallback message: Handled exception when circuit is OPEN " + e.getMessage();
    }

    public String fallback(HttpServerErrorException e){
        return "Fallback message: Handled HTTP Error " + e.getMessage();
    }

    public String fallback(Throwable t){
        return "Fallback message: Any other exception " + t.getMessage();
    }

    @Bulkhead(name="slowService", fallbackMethod="bulkheadFallback")
    public String slow() {
        try {
            TimeUnit.SECONDS.sleep(20);
        } catch(InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        return "Hello, World! - Delay 20 seconds";
    }

    public String bulkheadFallback(Throwable ex) {
        return "Too many request - No further calls are accepted " + ex.getMessage();
    }
}