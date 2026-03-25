from sqlalchemy import Column, Integer, String
from app.db.base import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String)
    contact_name = Column(String)
    phone = Column(String)
    email = Column(String)
    website = Column(String)  # ← THIS WAS MISSING
    address = Column(String)
    service_area = Column(String)