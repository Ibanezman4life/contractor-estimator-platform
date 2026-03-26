from typing import List

from app.schemas.materials import MaterialResult, SupplierOption


def detect_materials_for_job(job_type: str) -> List[MaterialResult]:
    normalized = job_type.strip().lower()

    if "ceiling fan" in normalized or "fan" in normalized:
        return [
            MaterialResult(
                material_name="Ceiling Fan",
                quantity=1,
                options=[
                    SupplierOption(
                        supplier="Home Depot",
                        item_name="52 in. Indoor Ceiling Fan",
                        price=99.00,
                        shipping_cost=0.00,
                        shipping_days=2,
                        distance_miles=5.2,
                        in_stock=True,
                        pickup_available=True,
                        supplier_type="local",
                    ),
                    SupplierOption(
                        supplier="Lowe's",
                        item_name="52 in. Flush Mount Ceiling Fan",
                        price=109.00,
                        shipping_cost=0.00,
                        shipping_days=1,
                        distance_miles=7.8,
                        in_stock=True,
                        pickup_available=True,
                        supplier_type="local",
                    ),
                    SupplierOption(
                        supplier="Amazon",
                        item_name="52 in. LED Ceiling Fan",
                        price=94.99,
                        shipping_cost=8.99,
                        shipping_days=3,
                        distance_miles=None,
                        in_stock=True,
                        pickup_available=False,
                        supplier_type="online",
                    ),
                ],
            ),
            MaterialResult(
                material_name="Wire Connectors",
                quantity=1,
                options=[
                    SupplierOption(
                        supplier="Home Depot",
                        item_name="Assorted Wire Connectors Pack",
                        price=6.49,
                        shipping_cost=0.00,
                        shipping_days=1,
                        distance_miles=5.2,
                        in_stock=True,
                        pickup_available=True,
                        supplier_type="local",
                    ),
                    SupplierOption(
                        supplier="Lowe's",
                        item_name="Wire Connector Pack",
                        price=5.98,
                        shipping_cost=0.00,
                        shipping_days=1,
                        distance_miles=7.8,
                        in_stock=True,
                        pickup_available=True,
                        supplier_type="local",
                    ),
                    SupplierOption(
                        supplier="Amazon",
                        item_name="Electrical Wire Nuts Kit",
                        price=7.99,
                        shipping_cost=3.99,
                        shipping_days=2,
                        distance_miles=None,
                        in_stock=True,
                        pickup_available=False,
                        supplier_type="online",
                    ),
                ],
            ),
            MaterialResult(
                material_name="Mounting Hardware / Support Box",
                quantity=1,
                options=[
                    SupplierOption(
                        supplier="Home Depot",
                        item_name="Ceiling Fan Rated Support Box",
                        price=21.97,
                        shipping_cost=0.00,
                        shipping_days=1,
                        distance_miles=5.2,
                        in_stock=True,
                        pickup_available=True,
                        supplier_type="local",
                    ),
                    SupplierOption(
                        supplier="Lowe's",
                        item_name="Fan Brace and Box Kit",
                        price=24.98,
                        shipping_cost=0.00,
                        shipping_days=1,
                        distance_miles=7.8,
                        in_stock=True,
                        pickup_available=True,
                        supplier_type="local",
                    ),
                    SupplierOption(
                        supplier="Amazon",
                        item_name="Fan Mounting Brace Kit",
                        price=19.99,
                        shipping_cost=5.99,
                        shipping_days=3,
                        distance_miles=None,
                        in_stock=True,
                        pickup_available=False,
                        supplier_type="online",
                    ),
                ],
            ),
        ]

    if "water heater" in normalized:
        return [
            MaterialResult(
                material_name="Water Heater Supply Lines",
                quantity=2,
                options=[
                    SupplierOption(
                        supplier="Home Depot",
                        item_name="Flexible Water Heater Connector",
                        price=18.97,
                        shipping_cost=0.00,
                        shipping_days=1,
                        distance_miles=5.2,
                        in_stock=True,
                        pickup_available=True,
                        supplier_type="local",
                    ),
                    SupplierOption(
                        supplier="Lowe's",
                        item_name="Water Heater Connector Line",
                        price=19.98,
                        shipping_cost=0.00,
                        shipping_days=1,
                        distance_miles=7.8,
                        in_stock=True,
                        pickup_available=True,
                        supplier_type="local",
                    ),
                ],
            )
        ]

    return [
        MaterialResult(
            material_name="General Materials",
            quantity=1,
            options=[
                SupplierOption(
                    supplier="Home Depot",
                    item_name="General Repair Material",
                    price=25.00,
                    shipping_cost=0.00,
                    shipping_days=1,
                    distance_miles=5.2,
                    in_stock=True,
                    pickup_available=True,
                    supplier_type="local",
                ),
                SupplierOption(
                    supplier="Amazon",
                    item_name="General Repair Supply",
                    price=22.00,
                    shipping_cost=6.99,
                    shipping_days=3,
                    distance_miles=None,
                    in_stock=True,
                    pickup_available=False,
                    supplier_type="online",
                ),
            ],
        )
    ]


def total_landed_cost(option: SupplierOption) -> float:
    return round(option.price + option.shipping_cost, 2)


def best_value_score(option: SupplierOption) -> float:
    distance_penalty = option.distance_miles if option.distance_miles is not None else 25
    shipping_penalty = option.shipping_days * 2
    pickup_bonus = -3 if option.pickup_available else 0
    stock_penalty = 0 if option.in_stock else 1000
    return total_landed_cost(option) + distance_penalty + shipping_penalty + pickup_bonus + stock_penalty


def sort_supplier_options(options: List[SupplierOption], sort_by: str) -> List[SupplierOption]:
    if sort_by == "cheapest":
        return sorted(options, key=lambda x: total_landed_cost(x))

    if sort_by == "nearest":
        return sorted(
            options,
            key=lambda x: (
                x.distance_miles if x.distance_miles is not None else 999999,
                total_landed_cost(x),
            ),
        )

    if sort_by == "fastest":
        return sorted(
            options,
            key=lambda x: (
                x.shipping_days,
                total_landed_cost(x),
            ),
        )

    if sort_by == "lowest_shipping":
        return sorted(
            options,
            key=lambda x: (
                x.shipping_cost,
                total_landed_cost(x),
            ),
        )

    if sort_by == "best_value":
        return sorted(options, key=lambda x: best_value_score(x))

    return options


def build_material_results(job_type: str, sort_by: str) -> List[MaterialResult]:
    materials = detect_materials_for_job(job_type)

    sorted_materials = []
    for material in materials:
        sorted_options = sort_supplier_options(material.options, sort_by)
        sorted_materials.append(
            MaterialResult(
                material_name=material.material_name,
                quantity=material.quantity,
                options=sorted_options,
            )
        )

    return sorted_materials