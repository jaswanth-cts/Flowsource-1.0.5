package ${{values.java_package_name}}.impl;

import org.springframework.stereotype.Service;

import ${{values.java_package_name}}.service.BackgroundColourService;

@Service("NoBackground")
public class NoBackground implements BackgroundColourService {
    public String getBackgroundColour() {
        return "No Background";
    }
}
