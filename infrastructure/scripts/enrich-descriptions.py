import json
import os

def generate_description(listing):
    b = listing.get("brand") or "This"
    m = listing.get("model") or "tractor"
    hp_val = listing.get("horsepower")
    hp = f"delivering a robust {hp_val} horsepower" if hp_val else "engineered for reliable performance"
    
    details = listing.get("details", {})
    engine_details = details.get("engine", {})
    engine_model = engine_details.get("model")
    engine = f"Powered by a highly-efficient {engine_model} engine" if engine_model else "Equipped with a dependable power plant"
    
    trans_details = details.get("transmission_details", {})
    drive = listing.get("drive_type") or trans_details.get("drive_type")
    
    trans = listing.get("transmission")
    if not trans and trans_details.get("forward_gears"):
        trans = f"{trans_details.get('forward_gears')}F/{trans_details.get('reverse_gears')}R"
        
    drivetrain = ""
    if drive and trans:
        drivetrain = f"The {drive} drivetrain, paired with a versatile {trans} transmission, ensures optimal traction and seamless power delivery across challenging terrains."
    elif drive:
        drivetrain = f"The {drive} configuration provides superior traction and stability in demanding agricultural environments."
    elif trans:
        drivetrain = f"Its versatile {trans} transmission allows operators to adapt effortlessly to various field conditions and implement requirements."

    dims = details.get("dimensions", {})
    weight = dims.get("operating_weight_kg")
    pto_details = details.get("pto", {})
    pto = pto_details.get("rear_pto_rpm")
    
    capability = ""
    if weight and pto:
        capability = f"Weighing in at {weight:,} kg, it offers a stable platform for heavy-duty implements, while the {pto} RPM PTO provides dependable power transfer for a wide range of attachments."
    elif weight:
        capability = f"Weighing in at {weight:,} kg, it offers a highly stable and commanding platform for heavy-duty agricultural implements."
    elif pto:
        capability = f"The advanced {pto} RPM PTO system provides dependable, continuous power transfer for demanding agricultural attachments."

    desc = f"The {b} {m} is a professional-grade agricultural tractor designed for modern farming operations. {engine}, {hp}, it provides an exceptional balance of torque and fuel efficiency. {drivetrain} {capability} Built for endurance and operational excellence, the {m} stands as an indispensable asset for maximizing productivity in the field."
    
    return " ".join(desc.split())

def main():
    print("Reading product-catalog.json...")
    with open("data/product-catalog.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    
    listings = data.get("products", [])
    print(f"Found {len(listings)} products. Generating SQL update script and updating JSON...")
    
    sql = "-- Auto-generated script to enrich product descriptions\n\n"
    
    for listing in listings:
        desc = generate_description(listing)
        listing["description"] = desc # Update JSON object directly
        
        safe_desc = desc.replace("'", "''")
        listing_id = listing.get("id")
        sql += f"UPDATE listings SET description = '{safe_desc}' WHERE id = '{listing_id}';\n"
    
    # Save SQL
    os.makedirs("supabase", exist_ok=True)
    with open("infrastructure/supabase/enrich-descriptions.sql", "w", encoding="utf-8") as f:
        f.write(sql)
    print("SQL script generated at infrastructure/supabase/enrich-descriptions.sql")
    
    # Save updated JSON back
    with open("data/product-catalog.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    print("Updated product-catalog.json with new descriptions.")

if __name__ == "__main__":
    main()
