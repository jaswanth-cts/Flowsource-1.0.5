package ${{values.java_package_name}}.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextClosedEvent;
import org.springframework.stereotype.Component;

@Component
public class TerminatorUtil implements ApplicationListener<ContextClosedEvent> {

    private static final Logger logger = LoggerFactory.getLogger(TerminatorUtil.class);

    @Override
    public void onApplicationEvent(ContextClosedEvent event) {
        logger.info("Cleaning up resources, for graceful shutdown, during SIGTERM signal.");
        // TODO: Clean up resources, for graceful shutdown
    }

}
