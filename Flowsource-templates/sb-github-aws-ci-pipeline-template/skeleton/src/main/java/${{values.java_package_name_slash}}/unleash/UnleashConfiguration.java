package ${{values.java_package_name}}.unleash;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.getunleash.DefaultUnleash;
import io.getunleash.Unleash;
import io.getunleash.UnleashContextProvider;
import io.getunleash.util.UnleashConfig;

@Configuration
public class UnleashConfiguration {

  @Bean
  public UnleashConfig unleashConfig(
            @Value("${io.getunleash.app-name}") String appName,
            @Value("${io.getunleash.instance-id}") String instanceId,
            @Value("${io.getunleash.api-url}") String apiUrl,
            @Value("${io.getunleash.api-token}") String apiToken,
            UnleashContextProvider unleashContextProvider) {
        return UnleashConfig.builder()
                .appName(appName)
                .instanceId(instanceId)
                .unleashAPI(apiUrl)
                .unleashContextProvider(unleashContextProvider)
                .customHttpHeader("Authorization", apiToken) // Add API token as a header
                .build();
    }
  
  @Bean
  public Unleash unleash(UnleashConfig unleashConfig) {
        return new DefaultUnleash(unleashConfig);
    }
}
