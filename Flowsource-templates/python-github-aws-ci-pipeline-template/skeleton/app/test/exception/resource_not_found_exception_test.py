from app.exception.resource_not_found_exception import ResourceNotFoundException

def test_constructor_with_message():

    message = "Resource not found"
    exception = ResourceNotFoundException(message)
    assert exception.args[0] == message

def test_constructor_with_message_and_cause():

    message = "Resource not found"
    cause = Exception("Internal error")
    exception = ResourceNotFoundException(message, cause=cause)
    assert exception.args[0] == message
    assert isinstance(exception.__cause__, type(cause))
    assert str(exception.__cause__) == "Internal error"

def test_from_invalid_id():

    invalid_id = 123
    exception = ResourceNotFoundException.from_invalid_id(invalid_id)
    assert exception.args[0] == f"Resource with id {invalid_id} not found"
