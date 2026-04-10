package ${{values.java_package_name}}.exception;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

public class ResourceNotFoundExceptionTest {
    @Test
    public void testConstructorWithMessage() {
        String message = "Resource not found";
        ResourceNotFoundException exception = new ResourceNotFoundException(message);

        assertEquals(message, exception.getMessage());
    }
    
    @Test
    public void testConstructorWithMessageAndCause() {
        String message = "Resource not found";
        Throwable cause = new RuntimeException("Internal error");

        ResourceNotFoundException exception = new ResourceNotFoundException(message, cause);

        assertEquals(message, exception.getMessage());
        assertNotNull(exception.getCause());
        assertEquals("Internal error", exception.getCause().getMessage());
    }

    @Test
    public void testConstructorWithInvalidId() {
        Long invalidId = 123L;
        ResourceNotFoundException exception = new ResourceNotFoundException(invalidId);

        assertEquals("Resource with id " + invalidId + " not found", exception.getMessage());
    }

}
