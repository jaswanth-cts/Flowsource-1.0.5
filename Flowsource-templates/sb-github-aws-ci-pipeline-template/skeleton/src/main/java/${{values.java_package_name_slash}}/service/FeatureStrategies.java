package ${{values.java_package_name}}.service;

import ${{values.java_package_name}}.unleash.ToggleConfiguration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;


@Service
public class FeatureStrategies {

  @Autowired
  private ToggleConfiguration toggleConfiguration;

  public String getCards() {
    if (toggleConfiguration.isCardsEnabled()) {
      return "Cards are enabled";
    } else {
      return "Cards are disabled";
    }
  }

  public String getDiscount() {
    if (toggleConfiguration.isDiscountEnabled()) {
      return "Discount provided";
    }
    return "No discount";
  }

  public String getBetaAccess() {
    if (toggleConfiguration.isBetaAccessEnabled()) {
      return "Beta Access granted";
    } else {
      return "Default Access";
    }
  }

  public ResponseEntity<String> getDarkMode() {
    if (toggleConfiguration.isDarkModeEnabled()) {
      return ResponseEntity.ok("Dark Mode enabled");
    } else {
      return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body("Service is unavailable");
    }
  }

}
