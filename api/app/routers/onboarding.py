from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.base import SessionLocal
from app.models.company import Company
from app.models.user import User
from app.schemas.company import CompanyOnboardingCreate

router = APIRouter(prefix="/onboarding", tags=["Onboarding"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/company")
def create_company(payload: CompanyOnboardingCreate, db: Session = Depends(get_db)):
    # Create company
    new_company = Company(
        company_name=payload.company_name,
        contact_name=payload.contact_name,
        phone=payload.phone,
        email=payload.email,
        website=payload.website,
        address=payload.address,
        service_area=payload.service_area,
    )

    db.add(new_company)
    db.commit()
    db.refresh(new_company)

    # Link to most recent user (temporary logic)
    user = db.query(User).order_by(User.id.desc()).first()

    if user:
        user.company_id = new_company.id
        db.commit()

    return {
        "message": "Company created and linked",
        "company_id": new_company.id,
        "linked_user_id": user.id if user else None,
    }