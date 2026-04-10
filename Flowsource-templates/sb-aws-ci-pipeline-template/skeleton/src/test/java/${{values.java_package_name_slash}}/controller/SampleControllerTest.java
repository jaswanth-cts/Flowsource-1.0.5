package ${{values.java_package_name}}.controller;

import ${{values.java_package_name}}.controller.SampleController;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;
import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
class SampleControllerTest {
	
    @Autowired
    private SampleController sampleController;
	@Test
	public void testHello(){
			
			String result=sampleController.hello();
			assertEquals("Hello, World!",result);
	}

}

