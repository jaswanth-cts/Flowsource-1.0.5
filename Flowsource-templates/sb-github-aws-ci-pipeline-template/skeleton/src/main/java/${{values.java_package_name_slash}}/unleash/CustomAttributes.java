package ${{values.java_package_name}}.unleash;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import ${{values.java_package_name}}.requestContext.RequestContext;
import io.getunleash.UnleashContext;
import io.getunleash.UnleashContextProvider;

@Component
public class CustomAttributes implements UnleashContextProvider {

  @Autowired
  private RequestContext requestContext;

  public UnleashContext getContext() {

    String team = requestContext.getTeam(); // Retrieves team from the RequestContext
    String region = requestContext.getRegion(); // Retrieves region from the RequestContext

    UnleashContext.Builder contextBuilder = UnleashContext.builder();

    if(team != null && !team.isEmpty()) {
      contextBuilder.userId(team); // For gradual rollout or for user specific constraints - userId context is mandatory
    }

    if(region != null && !region.isEmpty()) {
      contextBuilder.addProperty("region", region); // For region constraints
    }

    UnleashContext context = contextBuilder.build();
    return context;

  }
}
