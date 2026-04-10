package ${{values.java_package_name}}.impl;
import org.springframework.stereotype.Service;

import ${{values.java_package_name}}.service.FeatureService;

@Service("DefaultFeatureService")
public class DefaultFeatureService implements FeatureService {
  public String getChatSupport() {
    return "Chat Support disabled";
  }
}

