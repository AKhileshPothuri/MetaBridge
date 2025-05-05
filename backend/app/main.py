from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from . import db, crud, models, schemas

app = FastAPI()

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