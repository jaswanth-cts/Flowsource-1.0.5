package ${{values.java_package_name}}.service;
import org.unleash.features.annotation.Toggle;

public interface FeatureService {
  @Toggle(name = "chat", alterBean ="NewFeatureService")
  String getChatSupport();
}

