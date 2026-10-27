from pydantic import BaseModel
class BaseTool(BaseModel):
    name: str
    description: str
    args_schema: type[BaseModel]
    def run(self, **kwargs):
        args = self.args_schema.model_validate(kwargs)
        return self._run(**args.model_dump())
