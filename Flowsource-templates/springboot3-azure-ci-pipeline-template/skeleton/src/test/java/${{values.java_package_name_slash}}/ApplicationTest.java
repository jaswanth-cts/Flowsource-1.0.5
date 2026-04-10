package ${{values.java_package_name}};

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class ApplicationTest {

	@Test
	public void mainTest() {
		Application.main(new String[] {});
	}

}
