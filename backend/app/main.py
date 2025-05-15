from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from . import db, crud, models, schemas
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from datetime import datetime, timedelta
import random

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