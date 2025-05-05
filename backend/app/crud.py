from sqlalchemy.orm import Session
from . import models

def get_all_systems(db: Session):
    return db.query(models.System).all()

def get_all_roles(db: Session):
    return db.query(models.Role).all()

def get_all_categories(db: Session):
    return db.query(models.Category).all()

def get_system_by_id(db: Session, systemid: int):
    return db.query(models.System).filter(models.System.systemid == systemid).first()

def get_role_by_id(db: Session, roleid: int):
    return db.query(models.Role).filter(models.Role.roleid == roleid).first()

def get_category_by_id(db: Session, categoryid: int):
    return db.query(models.Category).filter(models.Category.categoryid == categoryid).first()

def upsert_system_to_prod(dev_system: models.System, prod_db: Session):
    prod_system = prod_db.query(models.System).filter(models.System.systemid == dev_system.systemid).first()
    if prod_system:
        for attr, value in dev_system.__dict__.items():
            if attr != "_sa_instance_state":
                setattr(prod_system, attr, value)
    else:
        prod_db.add(models.System(**{k: v for k, v in dev_system.__dict__.items() if k != '_sa_instance_state'}))
    prod_db.commit()
    return True

def upsert_role_to_prod(dev_role: models.Role, prod_db: Session):
    prod_role = prod_db.query(models.Role).filter(models.Role.roleid == dev_role.roleid).first()
    if prod_role:
        for attr, value in dev_role.__dict__.items():
            if attr != "_sa_instance_state":
                setattr(prod_role, attr, value)
    else:
        prod_db.add(models.Role(**{k: v for k, v in dev_role.__dict__.items() if k != '_sa_instance_state'}))
    prod_db.commit()
    return True

def upsert_category_to_prod(dev_category: models.Category, prod_db: Session):
    prod_category = prod_db.query(models.Category).filter(models.Category.categoryid == dev_category.categoryid).first()
    if prod_category:
        for attr, value in dev_category.__dict__.items():
            if attr != "_sa_instance_state":
                setattr(prod_category, attr, value)
    else:
        prod_db.add(models.Category(**{k: v for k, v in dev_category.__dict__.items() if k != '_sa_instance_state'}))
    prod_db.commit()
    return True

def get_all_catalogs(db: Session):
    return db.query(models.Catalog).all()

def get_all_contexts(db: Session):
    return db.query(models.Context).all()

def get_catalog_by_id(db: Session, tableid: int):
    return db.query(models.Catalog).filter(models.Catalog.tableid == tableid).first()

def get_context_by_id(db: Session, contextid: int):
    return db.query(models.Context).filter(models.Context.contextid == contextid).first()

def upsert_catalog_to_prod(dev_catalog: models.Catalog, prod_db: Session):
    prod_catalog = prod_db.query(models.Catalog).filter(models.Catalog.tableid == dev_catalog.tableid).first()
    if prod_catalog:
        for attr, value in dev_catalog.__dict__.items():
            if attr != "_sa_instance_state":
                setattr(prod_catalog, attr, value)
    else:
        prod_db.add(models.Catalog(**{k: v for k, v in dev_catalog.__dict__.items() if k != '_sa_instance_state'}))
    prod_db.commit()
    return True

def upsert_context_to_prod(dev_context: models.Context, prod_db: Session):
    prod_context = prod_db.query(models.Context).filter(models.Context.contextid == dev_context.contextid).first()
    if prod_context:
        for attr, value in dev_context.__dict__.items():
            if attr != "_sa_instance_state":
                setattr(prod_context, attr, value)
    else:
        prod_db.add(models.Context(**{k: v for k, v in dev_context.__dict__.items() if k != '_sa_instance_state'}))
    prod_db.commit()
    return True 