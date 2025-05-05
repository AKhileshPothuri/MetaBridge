import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

def make_url(prefix):
    host = os.getenv(f"{prefix}_DB_HOST", "localhost")
    port = os.getenv(f"{prefix}_DB_PORT", "5432")
    user = os.getenv(f"{prefix}_DB_USER", "postgres")
    password = os.getenv(f"{prefix}_DB_PASSWORD", "")
    dbname = os.getenv(f"{prefix}_DB_NAME", "postgres")
    if password:
        return f"postgresql://{user}:{password}@{host}:{port}/{dbname}"
    else:
        return f"postgresql://{user}@{host}:{port}/{dbname}"

DEV_DB_URL = make_url("DEV")
PROD_DB_URL = make_url("PROD")

dev_engine = create_engine(DEV_DB_URL)
prod_engine = create_engine(PROD_DB_URL)

DevSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=dev_engine)
ProdSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=prod_engine) 