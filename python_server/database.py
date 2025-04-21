from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import scoped_session, sessionmaker
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL from environment
database_url = os.getenv("DATABASE_URL")

if not database_url:
    raise ValueError("DATABASE_URL environment variable is not set")

# Create engine
engine = create_engine(database_url)

# Create session factory
db_session = scoped_session(
    sessionmaker(autocommit=False, autoflush=False, bind=engine)
)

# Create base for declarative models
Base = declarative_base()
Base.query = db_session.query_property()

def init_db():
    """Initialize the database - create all tables."""
    # Import all models here to ensure they are registered
    import models
    Base.metadata.create_all(bind=engine)

def shutdown_session(exception=None):
    """Remove the session at the end of request."""
    db_session.remove()