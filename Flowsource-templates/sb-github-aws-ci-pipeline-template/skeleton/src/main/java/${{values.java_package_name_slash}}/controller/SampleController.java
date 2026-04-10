package ${{values.java_package_name}}.controller;

import ${{values.java_package_name}}.service.SampleService;
import ${{values.java_package_name}}.service.BackgroundColourService;
import ${{values.java_package_name}}.service.FeatureService;
import ${{values.java_package_name}}.service.FeatureStrategies;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;

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

    @Autowired
    private FeatureStrategies featureStrategies;

    @Autowired
    @Qualifier("DefaultFeatureService")
    private FeatureService FeatureService;

    @Autowired
    @Qualifier("NoBackground")
    private BackgroundColourService BackgroundColourService;

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

    // Gradual rollout of new feature for 50% of users
    @GetMapping("/feature/cards")
    public String getCards() {
        log.info("Accessing /feature/cards endpoint");
        return featureStrategies.getCards();  
    }

    // New feature for users based on region constraint
    @GetMapping("/feature/discount")
    public String getDiscount() {
        log.info("Accessing /feature/discount endpoint");
        return featureStrategies.getDiscount();
    }

    // New feature for specific users
    @GetMapping("/feature/beta-access")
    public String getBetaAccess() {
        log.info("Accessing /feature/beta-access endpoint");  
        return featureStrategies.getBetaAccess();
    }

    // New feature for all users
    @GetMapping("/feature/dark-mode")
    public ResponseEntity<String> getDarkMode(){
        log.info("Accessing /feature/dark-mode endpoint");
        return featureStrategies.getDarkMode();
    }

    // New Feature implementation using interface
    @GetMapping("/feature/chat-support")
    public String getChatSupport() {
        return FeatureService.getChatSupport();        
    }

    // New Feature with variants
    @GetMapping("/feature/new-ui")
    public String getnewUI() {
        return BackgroundColourService.getBackgroundColour();
    }
}
