from pydantic import BaseModel, EmailStr


class CompanyOnboardingCreate(BaseModel):
    company_name: str
    contact_name: str
    phone: str
    email: EmailStr
    website: str
    address: str
    service_area: str