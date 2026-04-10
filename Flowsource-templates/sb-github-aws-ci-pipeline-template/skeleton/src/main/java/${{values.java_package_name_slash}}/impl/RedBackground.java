package ${{values.java_package_name}}.impl;

import org.springframework.stereotype.Service;

import ${{values.java_package_name}}.service.BackgroundColourService;

@Service("red")
public class RedBackground implements BackgroundColourService{
    @Override
    public String getBackgroundColour() {
        return "Red Background";
    }
}
