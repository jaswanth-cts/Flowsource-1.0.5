package ${{values.java_package_name}}.controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import ${{values.java_package_name}}.service.SampleService;
import org.springframework.beans.factory.annotation.Autowired;

import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.Tracer;
import io.opentelemetry.context.Scope;
import io.opentelemetry.api.GlobalOpenTelemetry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
public class SampleController {
    @Autowired
    private SampleService sampleService;

    private static final Logger log = LoggerFactory.getLogger(SampleController.class);

    //This is used to create spans. The GlobalOpenTelemetry.getTracer("sample") method gets a tracer instance named “sample”.
    private final Tracer tracer = GlobalOpenTelemetry.getTracer("sample");

    @GetMapping("/hello")
    public String hello() {
        // Create a span
        Span span = tracer.spanBuilder("hello").startSpan();
        log.info("Starting span for /hello endpoint");
        try (Scope scope = span.makeCurrent()) {
            String response = sampleService.helloService();
            log.info("Response from helloService: {}", response);
            return response;
        } finally {
            span.end(); // End the span
            log.info("Ended span for /hello endpoint");
        }
    }

    @GetMapping("/failure")
    public String failure() {
        // Create a span
        Span span = tracer.spanBuilder("failure").startSpan();
        log.info("Starting span for /failure endpoint");
        try (Scope scope = span.makeCurrent()) {
            String response = sampleService.failure();
            log.info("Response from failure service: {}", response);
            return response;
        } finally {
            span.end(); // End the span
            log.info("Ended span for /failure endpoint");
        }
    }

    @GetMapping("/ignore")
    public String ignore() {
        // Create a span
        Span span = tracer.spanBuilder("ignore").startSpan();
        log.info("Starting span for /ignore endpoint");
        try (Scope scope = span.makeCurrent()) {
            String response = sampleService.ignoreException();
            log.info("Response from ignoreException service: {}", response);
            return response;
        } finally {
            span.end(); // End the span
            log.info("Ended span for /ignore endpoint");
        }
    }
}

