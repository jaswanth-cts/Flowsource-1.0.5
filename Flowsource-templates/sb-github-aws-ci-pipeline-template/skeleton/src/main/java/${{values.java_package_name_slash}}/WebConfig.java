package ${{values.java_package_name}};

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

  @Bean
  WebMvcConfigurer corsConfigurer() {
      return new WebMvcConfigurer() {
          @Override
          public void addCorsMappings(CorsRegistry registry) {
              registry.addMapping("/**")
                      .allowedOrigins("http://localhost:3000") // Replace with your frontend's origin
                      .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                      .allowedHeaders("region", "team");
                 };
      };
  }
}