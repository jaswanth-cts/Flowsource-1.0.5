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

	@Test
	public void testFailure() {

		String failure = sampleController.failure();

		// Assert the exception details
		assertEquals("Fallback message: Handled HTTP Error 500 This is a remote exception", failure);
	}

	@Test
	public void testIgnore() {

		String ignore = sampleController.ignore();

		// Assert the exception details
		assertEquals("Fallback message: Any other exception This exception is ignored by the CircuitBreaker of helloservice", ignore);
	}


}
