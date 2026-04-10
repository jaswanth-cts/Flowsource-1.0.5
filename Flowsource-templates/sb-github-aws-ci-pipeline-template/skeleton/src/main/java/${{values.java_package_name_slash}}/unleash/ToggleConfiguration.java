package ${{values.java_package_name}}.unleash;

import org.springframework.stereotype.Component;

import io.getunleash.Unleash;

@Component
public class ToggleConfiguration {

  private final Unleash unleash;

  public ToggleConfiguration(Unleash unleash) {
    this.unleash = unleash;
  }

  public boolean isCardsEnabled() {
    return unleash.isEnabled("show-cards", false);
  }

  public boolean isDiscountEnabled() {
    return unleash.isEnabled("discount",  false);
  }

  public boolean isBetaAccessEnabled() {
    return unleash.isEnabled("betaAccess", false);
  }

  public boolean isDarkModeEnabled() {
    return unleash.isEnabled("darkMode", false);
  }
}
