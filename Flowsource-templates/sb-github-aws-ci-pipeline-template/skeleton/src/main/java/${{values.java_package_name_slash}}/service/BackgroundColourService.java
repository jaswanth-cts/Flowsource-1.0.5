package ${{values.java_package_name}}.service;

import org.unleash.features.annotation.FeatureVariants;
import org.unleash.features.annotation.FeatureVariant;
import org.unleash.features.annotation.Toggle;

public interface BackgroundColourService {
  @Toggle(name = "bg-color", variants = @FeatureVariants(fallbackBean = "NoBackground", variants = {
    @FeatureVariant(name="A", variantBean = "green"),
    @FeatureVariant(name="B", variantBean = "red")
  }))
  String getBackgroundColour();
}
