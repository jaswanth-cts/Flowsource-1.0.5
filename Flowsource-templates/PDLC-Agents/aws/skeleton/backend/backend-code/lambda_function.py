# lambda_function.py

import sys
import json
import time
import re
from multi_agent_system_aws.system_builder import SystemBuilder
from multi_agent_system_aws.utils.logger import MultiAgentSystemLogger

# Initialize the SystemBuilder with the configuration file
builder = SystemBuilder(config_path='agent_config.json')
multi_agent_system = builder.get_multi_agent_system()

logger = MultiAgentSystemLogger()

headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "OPTIONS, POST",
    "Access-Control-Allow-Credentials": "true"
}

def sanitize_string(input_str: str) -> str:
    sanitized = ''.join(ch for ch in input_str if ch.isprintable())
    sanitized = sanitized.strip()
    return sanitized

def validate_input(input_str: str, field_name: str, max_length: int = 30000) -> str:
    if not isinstance(input_str, str):
        raise ValueError(f"{field_name} must be a string.")
    if len(input_str.strip()) == 0:
        raise ValueError(f"{field_name} cannot be empty.")
    #if len(input_str) > max_length:
        #raise ValueError(f"{field_name} exceeds maximum allowed length of {max_length} characters.")

    input_str = sanitize_string(input_str)
    if len(input_str) == 0:
        raise ValueError(f"{field_name} becomes empty after sanitization, not allowed.")

    return input_str

def validate_images(images):
    if images is None:
        return None
    if not isinstance(images, list):
        raise ValueError("images must be a list.")
    allowed_formats = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
    validated_images = []
    for img in images:
        if not isinstance(img, dict):
            raise ValueError("Each image must be a dictionary.")
        fmt = img.get('format')
        content = img.get('content')

        if fmt not in allowed_formats:
            raise ValueError("Image format not allowed.")

        # Convert to bytes if string
        if isinstance(content, str):
            content = content.encode('utf-8', errors='replace')

        if len(content) == 0:
            raise ValueError("Image content is empty.")

        # You can add further sanitization if needed
        validated_images.append({'format': fmt, 'content': content})
    return validated_images

def process_user_query(user_id, session_id, user_input, images):
    try:
        response_generator = multi_agent_system.process_user_query(user_id, session_id, user_input, images)
        responses = []
        for response_data in response_generator:
            responses.append(response_data)

        output = {
            "statusCode": 200,
            "headers": headers,
            "body": json.dumps(responses, ensure_ascii=False)
        }
        logger.info(f"Output: {output}")
        return output
    except Exception as error:
        logger.error(f"Error during processing user query: {str(error)}")
        return {
            "statusCode": 500,
            "headers": headers,
            "body": json.dumps(f"Error during processing: {str(error)}", ensure_ascii=False)
        }

def lambda_handler(event, context):
    try:
        logger.info(f"Lambda time remaining in MS: {context.get_remaining_time_in_millis()}")
        logger.info(f"My Event: {event}")

        # Extract raw inputs from event
        raw_user_input = event.get('query')
        raw_user_id = event.get('userId')
        raw_session_id = event.get('sessionId')
        raw_images = event.get('images')

        # Validate and sanitize user input fields
        user_input = validate_input(raw_user_input, "user_input")
        user_id = validate_input(raw_user_id, "user_id", max_length=1000)
        session_id = validate_input(raw_session_id, "session_id", max_length=1000)
        images = validate_images(raw_images)  # Raises ValueError if invalid

        # Process the user query
        response = process_user_query(user_id, session_id, user_input, images)
        return response

    except ValueError as ve:
        logger.error(f"Input validation error: {str(ve)}")
        return {
            'statusCode': 400,
            "headers": headers,
            'body': json.dumps(f"Input validation error: {str(ve)}", ensure_ascii=False)
        }
    except Exception as error:
        logger.error(f"Unexpected error: {str(error)}")
        return {
            'statusCode': 500,
            "headers": headers,
            'body': json.dumps(f"Unexpected error: {str(error)}", ensure_ascii=False)
        }