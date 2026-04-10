package ${{values.java_package_name}}.requestContext;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;


@Component
public class RequestContextInterceptor implements HandlerInterceptor{

  private final RequestContext requestContext;

  public RequestContextInterceptor(RequestContext requestContext) {
    this.requestContext = requestContext;
  }
  @Override
  public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {

    // Extract the headers from the request
    String team = request.getHeader("team");
    String region = request.getHeader("region");

    // Set the headers in the RequestContext
    requestContext.setTeam(team);
    requestContext.setRegion(region);

    return true;
  }
}
