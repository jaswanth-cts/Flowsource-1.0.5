package ${{values.java_package_name}}.impl;
import org.springframework.stereotype.Service;

import ${{values.java_package_name}}.service.FeatureService;

@Service("NewFeatureService")
public class NewFeatureService implements FeatureService {
  @Override
  public String getChatSupport() {
    return "Live Chat Support enabled";
  }

}
