from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, ForeignKey, func
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

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

class TableAudit(Base):
    __tablename__ = "table_audit"
    
    audit_id = Column(Integer, primary_key=True)
    table_name = Column(String(255), nullable=False)
    record_id = Column(Integer, nullable=False)
    action = Column(String(10), nullable=False)  # INSERT, UPDATE, DELETE
    old_data = Column(JSON)
    new_data = Column(JSON)
    changed_by = Column(String(255))
    changed_at = Column(DateTime, default=datetime.utcnow)
    change_reason = Column(Text)

# Function to create audit trigger
def create_audit_trigger(table_name):
    return f"""
    CREATE OR REPLACE FUNCTION {table_name}_audit_trigger()
    RETURNS TRIGGER AS $$
    BEGIN
        IF (TG_OP = 'DELETE') THEN
            INSERT INTO table_audit (table_name, record_id, action, old_data, changed_at)
            VALUES ('{table_name}', OLD.id, 'DELETE', row_to_json(OLD), NOW());
            RETURN OLD;
        ELSIF (TG_OP = 'UPDATE') THEN
            INSERT INTO table_audit (table_name, record_id, action, old_data, new_data, changed_at)
            VALUES ('{table_name}', NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW), NOW());
            RETURN NEW;
        ELSIF (TG_OP = 'INSERT') THEN
            INSERT INTO table_audit (table_name, record_id, action, new_data, changed_at)
            VALUES ('{table_name}', NEW.id, 'INSERT', row_to_json(NEW), NOW());
            RETURN NEW;
        END IF;
        RETURN NULL;
    END;
    $$ LANGUAGE plpgsql;
    """

# Add mapping and sample tables if needed later 