package ${{values.java_package_name}}.service;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpServerErrorException;

import ${{values.java_package_name}}.exception.BusinessException;
import io.github.resilience4j.bulkhead.annotation.Bulkhead;
import io.github.resilience4j.circuitbreaker.CallNotPermittedException;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import io.github.resilience4j.retry.annotation.Retry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.SpanKind;
import io.opentelemetry.instrumentation.annotations.WithSpan;

@Service
public class SampleService {
    private static final Logger log = LoggerFactory.getLogger(SampleService.class);

    @WithSpan(kind = SpanKind.SERVER)
    @CircuitBreaker(name = "helloService", fallbackMethod = "fallback")
    @Bulkhead(name = "helloService")
    @Retry(name = "helloService")
    @RateLimiter(name = "helloService")
    public String helloService() {
        Span span = Span.current();
        span.setAttribute("service.name", "helloService");
        log.info("Executing helloService");
        // Your business logic here
        String response = "Hello, World!";
        log.info("helloService response: {}", response);
        return response;
    }

    @WithSpan(kind = SpanKind.SERVER)
    @CircuitBreaker(name = "helloService", fallbackMethod = "fallback")
    @Bulkhead(name = "helloService")
    @Retry(name = "helloService")
    @RateLimiter(name = "helloService")
    public String failure() {
        Span span = Span.current();
        span.setAttribute("service.name", "failureService");
        log.info("Executing failure service");
        // Your business logic here
        throw new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "This is a remote exception");
    }

    @WithSpan(kind = SpanKind.SERVER)
    @CircuitBreaker(name = "helloService", fallbackMethod = "fallback")
    @Bulkhead(name = "helloService")
    public String ignoreException() {
        Span span = Span.current();
        span.setAttribute("service.name", "ignoreExceptionService");
        log.info("Executing ignoreException service");
        throw new BusinessException("This exception is ignored by the CircuitBreaker of helloservice");
    }

    @WithSpan(kind = SpanKind.SERVER)
    public String fallback(CallNotPermittedException e) {
        Span span = Span.current();
        span.setAttribute("fallback.reason", "CallNotPermittedException");
        log.warn("Fallback executed due to CallNotPermittedException: {}", e.getMessage());
        return "Fallback message: Handled exception when circuit is OPEN " + e.getMessage();
    }

    @WithSpan(kind = SpanKind.SERVER)
    public String fallback(HttpServerErrorException e) {
        Span span = Span.current();
        span.setAttribute("fallback.reason", "HttpServerErrorException");
        log.warn("Fallback executed due to HttpServerErrorException: {}", e.getMessage());
        return "Fallback message: Handled HTTP Error " + e.getMessage();
    }

    @WithSpan(kind = SpanKind.SERVER)
    public String fallback(Throwable t) {
        Span span = Span.current();
        span.setAttribute("fallback.reason", "Throwable");
        log.warn("Fallback executed due to Throwable: {}", t.getMessage());
        return "Fallback message: Any other exception " + t.getMessage();
    }
}
