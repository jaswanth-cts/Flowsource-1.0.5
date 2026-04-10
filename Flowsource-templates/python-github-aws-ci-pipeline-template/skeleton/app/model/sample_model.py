from pydantic import BaseModel
 
class HelloWorldModel(BaseModel):
    message: str
