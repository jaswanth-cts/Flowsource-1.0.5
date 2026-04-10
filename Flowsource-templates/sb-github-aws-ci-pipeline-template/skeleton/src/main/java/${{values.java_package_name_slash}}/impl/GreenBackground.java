package ${{values.java_package_name}}.impl;

import org.springframework.stereotype.Service;

import ${{values.java_package_name}}.service.BackgroundColourService;

@Service("green")
public class GreenBackground implements BackgroundColourService {
    @Override
    public String getBackgroundColour() {
        return "Green Background";
    }

}
