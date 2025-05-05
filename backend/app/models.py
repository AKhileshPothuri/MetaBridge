from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class System(Base):
    __tablename__ = "systems"
    systemid = Column(Integer, primary_key=True, index=True)
    systemname = Column(String(255))
    systemurl = Column(String(255))
    description = Column(Text)
    domain = Column(Text)
    date_created = Column(DateTime)
    date_updated = Column(DateTime)
    status = Column(String(50))
    system_preferences = Column(JSON)

class Role(Base):
    __tablename__ = "roles"
    roleid = Column(Integer, primary_key=True, index=True)
    rolename = Column(String(255))
    systemid = Column(Integer, ForeignKey("systems.systemid"))
    description = Column(Text)
    role_preferences = Column(JSON)
    date_created = Column(DateTime)
    date_updated = Column(DateTime)
    status = Column(String(50))

class Category(Base):
    __tablename__ = "category"
    categoryid = Column(Integer, primary_key=True, index=True)
    categoryname = Column(String(255))
    systemid = Column(Integer, ForeignKey("systems.systemid"))
    description = Column(Text)
    category_preferences = Column(JSON)
    date_created = Column(DateTime)
    date_updated = Column(DateTime)
    status = Column(String(50))

class Catalog(Base):
    __tablename__ = "catalog"
    tableid = Column(Integer, primary_key=True, index=True)
    table_vector_id = Column(String)
    table_name = Column(String)
    table_description = Column(Text)
    rules = Column(JSON)
    usage_patterns = Column(JSON)
    columns = Column(JSON)
    date_created = Column(DateTime)
    date_updated = Column(DateTime)
    archive = Column(Integer)

class Context(Base):
    __tablename__ = "context"
    contextid = Column(Integer, primary_key=True, index=True)
    context_vector_id = Column(String)
    context_name = Column(String)
    context_description = Column(Text)
    table_descriptions = Column(JSON)
    rules = Column(JSON)
    relevanttables = Column(JSON)
    columns = Column(JSON)
    context_rules = Column(JSON)
    date_created = Column(DateTime)
    date_updated = Column(DateTime)
    archive = Column(Integer)

# Add mapping and sample tables if needed later 