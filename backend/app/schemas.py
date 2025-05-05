from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime

class SystemBase(BaseModel):
    systemname: str
    systemurl: Optional[str]
    description: Optional[str]
    domain: Optional[str]
    date_created: Optional[datetime]
    date_updated: Optional[datetime]
    status: Optional[str]
    system_preferences: Optional[Any]

class System(SystemBase):
    systemid: int

    class Config:
        orm_mode = True

class RoleBase(BaseModel):
    rolename: str
    systemid: int
    description: Optional[str]
    role_preferences: Optional[Any]
    date_created: Optional[datetime]
    date_updated: Optional[datetime]
    status: Optional[str]

class Role(RoleBase):
    roleid: int

    class Config:
        orm_mode = True

class CategoryBase(BaseModel):
    categoryname: str
    systemid: int
    description: Optional[str]
    category_preferences: Optional[Any]
    date_created: Optional[datetime]
    date_updated: Optional[datetime]
    status: Optional[str]

class Category(CategoryBase):
    categoryid: int

    class Config:
        orm_mode = True

class CatalogBase(BaseModel):
    table_vector_id: Optional[str]
    table_name: Optional[str]
    table_description: Optional[str]
    rules: Optional[Any]
    usage_patterns: Optional[Any]
    columns: Optional[Any]
    date_created: Optional[datetime]
    date_updated: Optional[datetime]
    archive: Optional[int]

class Catalog(CatalogBase):
    tableid: int
    class Config:
        orm_mode = True

class ContextBase(BaseModel):
    context_vector_id: Optional[str]
    context_name: Optional[str]
    context_description: Optional[str]
    table_descriptions: Optional[Any]
    rules: Optional[Any]
    relevanttables: Optional[Any]
    columns: Optional[Any]
    context_rules: Optional[Any]
    date_created: Optional[datetime]
    date_updated: Optional[datetime]
    archive: Optional[int]

class Context(ContextBase):
    contextid: int
    class Config:
        orm_mode = True 