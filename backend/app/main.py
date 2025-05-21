from fastapi import FastAPI, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from . import db, crud, models, schemas
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from datetime import datetime, timedelta
import random
import base64
import json
import os
import requests
from pydantic import BaseModel

app = FastAPI()
app.add_middleware(
      CORSMiddleware,
      allow_origins=["*"],
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
  )
def get_dev_db():
    db_session = db.DevSessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()

def get_prod_db():
    db_session = db.ProdSessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()

@app.get("/systems/")
def list_systems(dev_db: Session = Depends(get_dev_db), prod_db: Session = Depends(get_prod_db)):
    dev_systems = crud.get_all_systems(dev_db)
    prod_systems = crud.get_all_systems(prod_db)
    return {"dev": [schemas.System.from_orm(s) for s in dev_systems], "prod": [schemas.System.from_orm(s) for s in prod_systems]}

@app.post("/systems/sync/{systemid}")
def sync_system(systemid: int, dev_db: Session = Depends(get_dev_db), prod_db: Session = Depends(get_prod_db)):
    dev_system = crud.get_system_by_id(dev_db, systemid)
    if not dev_system:
        raise HTTPException(status_code=404, detail="System not found in dev")
    crud.upsert_system_to_prod(dev_system, prod_db)
    return {"status": "success"}

@app.get("/roles/")
def list_roles(dev_db: Session = Depends(get_dev_db), prod_db: Session = Depends(get_prod_db)):
    dev_roles = crud.get_all_roles(dev_db)
    prod_roles = crud.get_all_roles(prod_db)
    return {"dev": [schemas.Role.from_orm(r) for r in dev_roles], "prod": [schemas.Role.from_orm(r) for r in prod_roles]}

@app.post("/roles/sync/{roleid}")
def sync_role(roleid: int, dev_db: Session = Depends(get_dev_db), prod_db: Session = Depends(get_prod_db)):
    dev_role = crud.get_role_by_id(dev_db, roleid)
    if not dev_role:
        raise HTTPException(status_code=404, detail="Role not found in dev")
    crud.upsert_role_to_prod(dev_role, prod_db)
    return {"status": "success"}

@app.get("/categories/")
def list_categories(dev_db: Session = Depends(get_dev_db), prod_db: Session = Depends(get_prod_db)):
    dev_categories = crud.get_all_categories(dev_db)
    prod_categories = crud.get_all_categories(prod_db)
    return {"dev": [schemas.Category.from_orm(c) for c in dev_categories], "prod": [schemas.Category.from_orm(c) for c in prod_categories]}

@app.post("/categories/sync/{categoryid}")
def sync_category(categoryid: int, dev_db: Session = Depends(get_dev_db), prod_db: Session = Depends(get_prod_db)):
    dev_category = crud.get_category_by_id(dev_db, categoryid)
    if not dev_category:
        raise HTTPException(status_code=404, detail="Category not found in dev")
    crud.upsert_category_to_prod(dev_category, prod_db)
    return {"status": "success"}

@app.get("/catalogs/")
def list_catalogs(dev_db: Session = Depends(get_dev_db), prod_db: Session = Depends(get_prod_db)):
    dev_catalogs = crud.get_all_catalogs(dev_db)
    prod_catalogs = crud.get_all_catalogs(prod_db)
    return {"dev": [schemas.Catalog.from_orm(c) for c in dev_catalogs], "prod": [schemas.Catalog.from_orm(c) for c in prod_catalogs]}

@app.post("/catalogs/sync/{tableid}")
def sync_catalog(tableid: int, dev_db: Session = Depends(get_dev_db), prod_db: Session = Depends(get_prod_db)):
    dev_catalog = crud.get_catalog_by_id(dev_db, tableid)
    if not dev_catalog:
        raise HTTPException(status_code=404, detail="Catalog not found in dev")
    crud.upsert_catalog_to_prod(dev_catalog, prod_db)
    return {"status": "success"}

@app.get("/contexts/")
def list_contexts(dev_db: Session = Depends(get_dev_db), prod_db: Session = Depends(get_prod_db)):
    dev_contexts = crud.get_all_contexts(dev_db)
    prod_contexts = crud.get_all_contexts(prod_db)
    return {"dev": [schemas.Context.from_orm(c) for c in dev_contexts], "prod": [schemas.Context.from_orm(c) for c in prod_contexts]}

@app.post("/contexts/sync/{contextid}")
def sync_context(contextid: int, dev_db: Session = Depends(get_dev_db), prod_db: Session = Depends(get_prod_db)):
    dev_context = crud.get_context_by_id(dev_db, contextid)
    if not dev_context:
        raise HTTPException(status_code=404, detail="Context not found in dev")
    crud.upsert_context_to_prod(dev_context, prod_db)
    return {"status": "success"}

@app.get("/audit/history/{table_name}/{record_id}", response_model=List[schemas.TableAudit])
def get_record_history(table_name: str, record_id: int, db: Session = Depends(get_dev_db)):
    """Get audit history for a specific record in a table"""
    history = db.query(models.TableAudit).filter(
        models.TableAudit.table_name == table_name,
        models.TableAudit.record_id == record_id
    ).order_by(models.TableAudit.changed_at.desc()).all()
    
    if not history:
        raise HTTPException(status_code=404, detail="No history found for this record")
    return history

@app.get("/audit/table/{table_name}", response_model=List[schemas.TableAudit])
def get_table_history(
    table_name: str,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_dev_db)
):
    """Get audit history for an entire table with optional date filtering"""
    query = db.query(models.TableAudit).filter(
        models.TableAudit.table_name == table_name
    )
    
    if start_date:
        query = query.filter(models.TableAudit.changed_at >= start_date)
    if end_date:
        query = query.filter(models.TableAudit.changed_at <= end_date)
        
    history = query.order_by(models.TableAudit.changed_at.desc()).all()
    
    if not history:
        raise HTTPException(status_code=404, detail="No history found for this table")
    return history

@app.get("/catalogs/{tableid}/history", response_model=List[schemas.TableAudit])
def get_catalog_history(tableid: int):
    actions = ["INSERT", "UPDATE", "DELETE"]
    history = []
    for i in range(20):
        history.append(schemas.TableAudit(
            audit_id=i+1,
            table_name="catalog",
            record_id=tableid,
            action=random.choice(actions),
            old_data={"table_name": f"Catalog {tableid}", "desc": "Old description"},
            new_data={"table_name": f"Catalog {tableid}", "desc": f"New description {i}"},
            changed_by=f"user{i%3}",
            changed_at=f"2024-06-0{(i%9)+1}T12:00:00",
            change_reason="Mocked change"
        ))
    return history

@app.get("/catalogs/full/{tableid}")
def get_full_catalog(tableid: int, dev_db: Session = Depends(get_dev_db)):
    catalog = crud.get_full_catalog_by_id(dev_db, tableid)
    if not catalog:
        raise HTTPException(status_code=404, detail="Catalog not found")
    return catalog

@app.get("/contexts/{contextid}/history", response_model=List[schemas.TableAudit])
def get_context_history(contextid: int):
    actions = ["INSERT", "UPDATE", "DELETE"]
    history = []
    for i in range(20):
        history.append(schemas.TableAudit(
            audit_id=i+1,
            table_name="context",
            record_id=contextid,
            action=random.choice(actions),
            old_data={"context_name": f"Context {contextid}", "desc": "Old description"},
            new_data={"context_name": f"Context {contextid}", "desc": f"New description {i}"},
            changed_by=f"user{i%3}",
            changed_at=f"2024-06-0{(i%9)+1}T12:00:00",
            change_reason="Mocked change"
        ))
    return history

@app.post("/systems/")
def create_system(system: schemas.SystemBase, db: Session = Depends(get_dev_db)):
    new_system = models.System(**system.dict())
    db.add(new_system)
    db.commit()
    db.refresh(new_system)
    return schemas.System.from_orm(new_system)

@app.get("/systems/")
def list_systems(db: Session = Depends(get_dev_db)):
    return [schemas.System.from_orm(s) for s in db.query(models.System).all()]

@app.post("/roles/")
def create_role(role: schemas.RoleBase, db: Session = Depends(get_dev_db)):
    new_role = models.Role(**role.dict())
    db.add(new_role)
    db.commit()
    db.refresh(new_role)
    return schemas.Role.from_orm(new_role)

@app.get("/roles/by_system/{systemid}")
def list_roles_by_system(systemid: int, db: Session = Depends(get_dev_db)):
    return [schemas.Role.from_orm(r) for r in db.query(models.Role).filter(models.Role.systemid == systemid).all()]

@app.post("/categories/")
def create_category(category: schemas.CategoryBase, db: Session = Depends(get_dev_db), db_type: str = Body(...), db_creds: dict = Body(...)):
    # Encode credentials
    creds_json = json.dumps(db_creds)
    creds_b64 = base64.b64encode(creds_json.encode()).decode()
    category_dict = category.dict()
    category_dict["category_preferences"] = json.dumps({"db_type": db_type, "credentials": creds_b64})
    new_category = models.Category(**category_dict)
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return schemas.Category.from_orm(new_category)

@app.get("/categories/by_system/{systemid}")
def list_categories_by_system(systemid: int, db: Session = Depends(get_dev_db)):
    return [schemas.Category.from_orm(c) for c in db.query(models.Category).filter(models.Category.systemid == systemid).all()]

class CategoryIdRequest(BaseModel):
    categoryid: int

@app.post("/db/list_schemas/")
def list_schemas(request_body: schemas.CategoryIdRequest, db: Session = Depends(get_dev_db)):
    categoryid = request_body.categoryid
    # Only Postgres for now
    category = db.query(models.Category).filter(models.Category.categoryid == categoryid).first()
    prefs = json.loads(category.category_preferences)
    if prefs["db_type"] != "postgres":
        return []
    creds = json.loads(base64.b64decode(prefs["credentials"]).decode())
    import psycopg2
    conn = psycopg2.connect(database=creds["database"], user=creds["user"], password=creds["password"], host=creds["host"], port=creds["port"])
    cur = conn.cursor()
    cur.execute("SELECT schema_name FROM information_schema.schemata;")
    schemas_list = [row[0] for row in cur.fetchall()]
    cur.close()
    conn.close()
    return schemas_list

@app.post("/db/list_tables/")
def list_tables(request_body: schemas.CategoryIdRequest, schema: str = Body(...), db: Session = Depends(get_dev_db)):
    categoryid = request_body.categoryid
    category = db.query(models.Category).filter(models.Category.categoryid == categoryid).first()
    prefs = json.loads(category.category_preferences)
    if prefs["db_type"] != "postgres":
        return []
    creds = json.loads(base64.b64decode(prefs["credentials"]).decode())
    import psycopg2
    conn = psycopg2.connect(database=creds["database"], user=creds["user"], password=creds["password"], host=creds["host"], port=creds["port"])
    cur = conn.cursor()
    cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = %s;", (schema,))
    tables_list = [row[0] for row in cur.fetchall()]
    cur.close()
    conn.close()
    return tables_list

@app.post("/db/generate_metadata/")
def generate_metadata(request_body: schemas.CategoryIdRequest, schema: str = Body(...), table: str = Body(...)):
    categoryid = request_body.categoryid
    # Placeholder request body
    api_url = os.getenv("METADATA_API_URL", "http://localhost:8001/generate_metadata")
    req_body = {"categoryid": categoryid, "schema": schema, "table": table}
    resp = requests.post(api_url, json=req_body)
    return resp.json()

@app.get("/catalogs/full/{table_vector_id}")
def get_full_catalog_by_vector_id(table_vector_id: str, db: Session = Depends(get_dev_db)):
    # Fetch main catalog info
    catalog = db.query(models.Catalog).filter(models.Catalog.table_vector_id == table_vector_id).first()
    if not catalog:
        raise HTTPException(status_code=404, detail="Catalog not found")
    # Mock: fetch related info (rules, usage_patterns, columns, samples)
    # In real code, join or query related tables as in your screenshots
    # Here, just return catalog info for now
    catalog_dict = {**catalog.__dict__}
    catalog_dict.pop('_sa_instance_state', None)
    # TODO: Add real joins for rules, usage_patterns, columns, samples
    catalog_dict['rules'] = catalog.rules
    catalog_dict['usage_patterns'] = catalog.usage_patterns
    catalog_dict['columns'] = catalog.columns
    catalog_dict['samples'] = []  # Placeholder
    return catalog_dict

@app.get("/contexts/full/{context_vector_id}")
def get_full_context_by_vector_id(context_vector_id: str, db: Session = Depends(get_dev_db)):
    context = db.query(models.Context).filter(models.Context.context_vector_id == context_vector_id).first()
    if not context:
        raise HTTPException(status_code=404, detail="Context not found")
    context_dict = {**context.__dict__}
    context_dict.pop('_sa_instance_state', None)
    # TODO: Add real joins for related tables
    return context_dict 