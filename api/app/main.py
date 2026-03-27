import json
import os
import sqlite3
from typing import Any, Dict, List, Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel


app = FastAPI(title="Contractor Estimator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI()


class QuoteTemplateOptions(BaseModel):
    showScopeOfWork: bool = True
    showMaterials: bool = True
    showLaborBreakdown: bool = True
    showNotes: bool = True
    showWarranty: bool = False
    showExclusions: bool = False
    showSchedule: bool = False
    showCustomerAcceptance: bool = False


class CompanySettings(BaseModel):
    companyName: str = ""
    logoDataUrl: str = ""
    phone: str = ""
    email: str = ""
    address: str = ""
    website: str = ""
    defaultMarkupPercent: float = 30.0
    hourlyLaborRate: float = 125.0
    helperLaborRate: float = 65.0
    tripCharge: float = 35.0
    minimumServiceCall: float = 125.0
    preferredSupplierSort: str = "cheapest"
    templateOptions: QuoteTemplateOptions = QuoteTemplateOptions()


class AnalyzeJobRequest(BaseModel):
    customer_name: str = ""
    location: str = ""
    job_description: str
    company_settings: Optional[CompanySettings] = None


class SupplierResult(BaseModel):
    supplier: str
    item_name: str
    price: float
    shipping_cost: float
    shipping_time: str
    distance: str
    in_stock: bool
    product_url: str


class AnalyzeJobResponse(BaseModel):
    job_type: str
    summary: str
    scope_of_work: List[str]
    estimated_price: float
    materials: List[str]
    labor_hours: float
    labor_cost: float
    trip_charge: float
    markup_amount: float
    subtotal: float
    total: float
    questions: List[str]
    supplier_results: List[SupplierResult]
    raw_response: Dict[str, Any]


@app.get("/")
def root() -> Dict[str, str]:
    return {"status": "ok", "message": "Contractor Estimator API is running"}


@app.get("/health")
def health() -> Dict[str, str]:
    key_present = bool(os.getenv("OPENAI_API_KEY"))
    return {
        "status": "healthy",
        "openai_key_loaded": "yes" if key_present else "no",
    }


def round_to_nearest_25(value: float) -> float:
    return float(round(value / 25) * 25)


def safe_float(value: Any, fallback: float = 0.0) -> float:
    try:
        if value is None:
            return fallback
        if isinstance(value, (int, float)):
            return float(value)
        cleaned = str(value).replace("$", "").replace(",", "").strip()
        return float(cleaned)
    except Exception:
        return fallback


def normalize_string_list(value: Any) -> List[str]:
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    return []


def build_rule_based_response(
    payload: AnalyzeJobRequest,
    settings: CompanySettings,
) -> AnalyzeJobResponse:
    description = payload.job_description.strip()
    desc_lower = description.lower()

    job_type = "General Repair"
    summary = description
    scope_of_work: List[str] = []
    materials: List[str] = []
    supplier_results: List[SupplierResult] = []
    questions: List[str] = []
    labor_hours = 2.0
    material_allowance = 50.0
    markup_percent = settings.defaultMarkupPercent / 100.0

    if "ceiling fan" in desc_lower:
        job_type = "Ceiling Fan Replacement"

        complexity = "standard"
        customer_supplied = (
            "customer-supplied" in desc_lower or "customer supplied" in desc_lower
        )

        if (
            "high ceiling" in desc_lower
            or "vaulted" in desc_lower
            or "20 foot" in desc_lower
            or "two story" in desc_lower
        ):
            complexity = "difficult"
        elif (
            "no existing box" in desc_lower
            or "new install" in desc_lower
            or "run new wire" in desc_lower
            or "no power" in desc_lower
        ):
            complexity = "complex"

        if complexity == "standard":
            labor_hours = 1.5
        elif complexity == "complex":
            labor_hours = 2.5
        else:
            labor_hours = 3.5

        summary = "Remove and replace ceiling fan with proper installation and testing."

        scope_of_work = [
            "Disconnect and remove existing ceiling fan.",
            "Inspect electrical box and mounting support.",
            "Install new ceiling fan assembly and mounting hardware.",
            "Secure fan, blades, and light kit if included.",
            "Test fan and light operation and verify proper function.",
        ]

        materials = [
            "Wire connectors",
            "Electrical tape",
            "Mounting hardware",
        ]

        if customer_supplied:
            materials.insert(0, "Customer-supplied ceiling fan")
            material_allowance = 20.0
        else:
            materials.insert(0, "Contractor-supplied ceiling fan")
            material_allowance = 120.0
            supplier_results = [
                SupplierResult(
                    supplier="Home Depot",
                    item_name="52 in. Indoor Ceiling Fan",
                    price=119.00,
                    shipping_cost=0.00,
                    shipping_time="Pickup today",
                    distance="Local",
                    in_stock=True,
                    product_url="https://www.homedepot.com/",
                ),
                SupplierResult(
                    supplier="Lowe's",
                    item_name="52 in. Ceiling Fan",
                    price=128.00,
                    shipping_cost=0.00,
                    shipping_time="Pickup today",
                    distance="Local",
                    in_stock=True,
                    product_url="https://www.lowes.com/",
                ),
            ]

        labor_cost = round(labor_hours * settings.hourlyLaborRate, 2)
        trip_charge = round(settings.tripCharge, 2)
        subtotal = round(labor_cost + trip_charge + material_allowance, 2)

        if subtotal < 225.0:
            subtotal = 225.0

        if subtotal < 300.0:
            markup_percent = 0.40

        markup_amount = round(subtotal * markup_percent, 2)
        total = round_to_nearest_25(subtotal + markup_amount)
        estimated_price = total

        return AnalyzeJobResponse(
            job_type=job_type,
            summary=summary,
            scope_of_work=scope_of_work,
            estimated_price=estimated_price,
            materials=materials,
            labor_hours=round(labor_hours, 2),
            labor_cost=labor_cost,
            trip_charge=trip_charge,
            markup_amount=markup_amount,
            subtotal=subtotal,
            total=total,
            questions=[],
            supplier_results=supplier_results,
            raw_response={
                "mode": "rule_based_fallback",
                "customer_name": payload.customer_name,
                "location": payload.location,
                "job_description": payload.job_description,
                "company_name": settings.companyName,
            },
        )

    if "faucet" in desc_lower:
        job_type = "Faucet Replacement"
        labor_hours = 2.0

        summary = (
            "Remove the existing faucet and install a new replacement faucet, "
            "connect supply lines, and test for leaks."
        )

        scope_of_work = [
            "Shut off water supply and disconnect existing faucet.",
            "Remove old faucet and clean mounting surface.",
            "Install new faucet and connect supply lines.",
            "Restore water service and test for leaks and proper operation.",
        ]

        materials = [
            "Replacement faucet",
            "Supply lines if needed",
            "Plumber's putty or sealant",
            "Miscellaneous installation supplies",
        ]

        supplier_results = [
            SupplierResult(
                supplier="Home Depot",
                item_name="Chrome Bathroom Faucet",
                price=89.00,
                shipping_cost=0.00,
                shipping_time="Pickup today",
                distance="Local",
                in_stock=True,
                product_url="https://www.homedepot.com/",
            )
        ]

        material_allowance = round(
            sum(item.price + item.shipping_cost for item in supplier_results), 2
        )

    elif "door jamb" in desc_lower or "door jam" in desc_lower:
        job_type = "Door Jamb Replacement"
        labor_hours = 3.0

        summary = (
            "Remove damaged door jamb material and install new trim/jamb components, "
            "then secure and finish for proper door operation."
        )

        scope_of_work = [
            "Remove damaged jamb material.",
            "Measure and cut replacement jamb/trim components.",
            "Install new material and secure in place.",
            "Check door fit and function.",
            "Caulk/fill minor gaps and prepare for paint if needed.",
        ]

        materials = [
            "Primed wood jamb material",
            "Fasteners",
            "Caulk/filler",
            "Miscellaneous finish supplies",
        ]

        supplier_results = [
            SupplierResult(
                supplier="Home Depot",
                item_name="Primed Finger Joint Door Jamb Kit",
                price=67.00,
                shipping_cost=0.00,
                shipping_time="Pickup today",
                distance="Local",
                in_stock=True,
                product_url="https://www.homedepot.com/",
            )
        ]

        material_allowance = round(
            sum(item.price + item.shipping_cost for item in supplier_results), 2
        )

    elif "fence" in desc_lower:
        job_type = "Fence Repair / Installation"
        labor_hours = 6.0

        summary = (
            "Perform fence repair or installation based on the described section, "
            "including posts, rails, pickets, and fastening."
        )

        scope_of_work = [
            "Verify layout and damaged or missing fence components.",
            "Remove failed material as needed.",
            "Install replacement posts, rails, and pickets as required.",
            "Secure assembly and verify alignment.",
        ]

        materials = [
            "Fence posts",
            "Rails",
            "Pickets/panels",
            "Concrete",
            "Exterior fasteners",
        ]

        supplier_results = [
            SupplierResult(
                supplier="Lowe's",
                item_name="Pressure Treated Fence Picket",
                price=3.98,
                shipping_cost=0.00,
                shipping_time="Pickup today",
                distance="Local",
                in_stock=True,
                product_url="https://www.lowes.com/",
            )
        ]

        material_allowance = round(
            sum(item.price + item.shipping_cost for item in supplier_results), 2
        )

    else:
        scope_of_work = [
            "Review customer request and verify site conditions.",
            "Perform the described repair or installation.",
            "Test completed work for proper operation.",
            "Clean work area and document completion.",
        ]

        materials = [
            "Miscellaneous repair materials",
            "Fasteners/connectors",
            "Consumable job supplies",
        ]

        questions = [
            "Is the customer supplying any materials or equipment?",
            "Are there access issues, special site conditions, or permit requirements?",
        ]

        if (
            "customer-supplied" in desc_lower
            or "customer supplied" in desc_lower
            or "customer-provided" in desc_lower
        ):
            material_allowance = 15.0

    labor_cost = round(labor_hours * settings.hourlyLaborRate, 2)
    trip_charge = round(settings.tripCharge, 2)
    subtotal = round(material_allowance + labor_cost + trip_charge, 2)
    minimum_service_call = round(settings.minimumServiceCall, 2)

    if subtotal < minimum_service_call:
        subtotal = minimum_service_call

    markup_amount = round(subtotal * markup_percent, 2)
    total = round(subtotal + markup_amount, 2)

    return AnalyzeJobResponse(
        job_type=job_type,
        summary=summary,
        scope_of_work=scope_of_work,
        estimated_price=total,
        materials=materials,
        labor_hours=round(labor_hours, 2),
        labor_cost=labor_cost,
        trip_charge=trip_charge,
        markup_amount=markup_amount,
        subtotal=subtotal,
        total=total,
        questions=questions,
        supplier_results=supplier_results,
        raw_response={
            "mode": "rule_based_fallback",
            "customer_name": payload.customer_name,
            "location": payload.location,
            "job_description": payload.job_description,
            "company_name": settings.companyName,
        },
    )


def build_ai_prompt(payload: AnalyzeJobRequest, settings: CompanySettings) -> str:
    return f"""
You are an estimating assistant for contractors.

Analyze the job description and return ONLY valid JSON.
Do not include markdown.
Do not include code fences.
Do not include commentary.

Use this exact JSON shape:
{{
  "job_type": "string",
  "summary": "string",
  "scope_of_work": ["string"],
  "materials": ["string"],
  "labor_hours": 0,
  "material_allowance": 0,
  "questions": ["string"],
  "complexity": "easy|standard|complex|difficult"
}}

Rules:
- Be practical and contractor-oriented.
- If the customer is supplying the main equipment, reduce material_allowance accordingly.
- labor_hours should be realistic for one lead technician unless the description clearly requires more.
- Keep summary concise.
- Scope of work should be specific and useful in a customer quote.
- materials should be practical, not excessive.
- If details are missing, include follow-up questions.
- Return JSON only.

Company settings:
- company_name: {settings.companyName}
- hourly_labor_rate: {settings.hourlyLaborRate}
- helper_labor_rate: {settings.helperLaborRate}
- trip_charge: {settings.tripCharge}
- minimum_service_call: {settings.minimumServiceCall}
- default_markup_percent: {settings.defaultMarkupPercent}

Customer name: {payload.customer_name}
Job location: {payload.location}
Job description: {payload.job_description}
""".strip()


def build_ai_based_response(
    payload: AnalyzeJobRequest,
    settings: CompanySettings,
) -> AnalyzeJobResponse:
    prompt = build_ai_prompt(payload, settings)

    response = client.responses.create(
        model="gpt-5",
        input=prompt,
    )

    text = (response.output_text or "").strip()
    parsed = json.loads(text)

    job_type = str(parsed.get("job_type", "General Repair")).strip() or "General Repair"
    summary = str(parsed.get("summary", payload.job_description)).strip() or payload.job_description
    scope_of_work = normalize_string_list(parsed.get("scope_of_work"))
    materials = normalize_string_list(parsed.get("materials"))
    questions = normalize_string_list(parsed.get("questions"))

    labor_hours = safe_float(parsed.get("labor_hours"), 2.0)
    material_allowance = safe_float(parsed.get("material_allowance"), 50.0)
    complexity = str(parsed.get("complexity", "standard")).strip().lower() or "standard"

    if complexity == "easy":
        complexity_markup = max(settings.defaultMarkupPercent / 100.0, 0.30)
    elif complexity == "complex":
        complexity_markup = max(settings.defaultMarkupPercent / 100.0, 0.35)
    elif complexity == "difficult":
        complexity_markup = max(settings.defaultMarkupPercent / 100.0, 0.40)
    else:
        complexity_markup = settings.defaultMarkupPercent / 100.0

    labor_cost = round(labor_hours * settings.hourlyLaborRate, 2)
    trip_charge = round(settings.tripCharge, 2)
    subtotal = round(labor_cost + trip_charge + material_allowance, 2)

    if subtotal < settings.minimumServiceCall:
        subtotal = round(settings.minimumServiceCall, 2)

    if subtotal < 300:
        markup_percent = max(complexity_markup, 0.40)
    else:
        markup_percent = complexity_markup

    markup_amount = round(subtotal * markup_percent, 2)
    total = round_to_nearest_25(subtotal + markup_amount)

    return AnalyzeJobResponse(
        job_type=job_type,
        summary=summary,
        scope_of_work=scope_of_work,
        estimated_price=total,
        materials=materials,
        labor_hours=round(labor_hours, 2),
        labor_cost=labor_cost,
        trip_charge=trip_charge,
        markup_amount=markup_amount,
        subtotal=subtotal,
        total=total,
        questions=questions,
        supplier_results=[],
        raw_response={
            "mode": "openai_ai_pricing",
            "model": "gpt-5",
            "customer_name": payload.customer_name,
            "location": payload.location,
            "job_description": payload.job_description,
            "company_name": settings.companyName,
            "ai_text": text,
            "ai_json": parsed,
        },
    )


@app.post("/analyze-job", response_model=AnalyzeJobResponse)
def analyze_job(payload: AnalyzeJobRequest) -> AnalyzeJobResponse:
    settings = payload.company_settings or CompanySettings()

    if not os.getenv("OPENAI_API_KEY"):
        return build_rule_based_response(payload, settings)

    try:
        return build_ai_based_response(payload, settings)
    except Exception as exc:
        fallback = build_rule_based_response(payload, settings)
        fallback.raw_response["ai_error"] = str(exc)
        return fallback


DB_FILE = "app.db"


def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS company_settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            data TEXT
        )
    """)

    conn.commit()
    conn.close()


init_db()


class CompanySettingsPayload(BaseModel):
    userId: str
    data: dict


@app.post("/company-settings")
def save_company_settings(settings: CompanySettingsPayload):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    cursor.execute(
        "DELETE FROM company_settings WHERE user_id = ?",
        (settings.userId,)
    )

    cursor.execute(
        "INSERT INTO company_settings (user_id, data) VALUES (?, ?)",
        (settings.userId, json.dumps(settings.data))
    )

    conn.commit()
    conn.close()

    return {"status": "saved"}


@app.get("/company-settings/{user_id}")
def get_company_settings(user_id: str):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    cursor.execute(
        "SELECT data FROM company_settings WHERE user_id = ?",
        (user_id,)
    )

    row = cursor.fetchone()
    conn.close()

    if not row:
        return {"data": {}}

    return {"data": json.loads(row[0])}