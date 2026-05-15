import json
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('data/product-catalog.json', 'r', encoding='utf-8') as f:
    catalog = json.load(f)

products = catalog['products']

# ── Brand mapping based on PDF section headers and model prefixes ──────────────
# PDF Page 1:    Cover
# PDF Pages 2-16: SinoHarvest brand (SH, SNH, TM prefix)
# PDF Page 17:   YTO section header
# PDF Pages 18-33: YTO brand (ME, MF, MG, LX, LY prefix)
# PDF Page 34:   John Deere section header (confirmed: "JOHN DEERE")
# PDF Pages 35-50: John Deere brand (484, 3B, 5B, 5-, 5E, 6B, 6E prefix)
# PDF Page 51:   Divider page
# PDF Pages 52-66: YTO M-series brand (M554-B, M604L etc)
# PDF Pages 68-70: SinoHarvest (SH554-C, SH704-1)
# PDF Pages 70-80: SinoHarvest CD/DF series (CD904, DF1404 etc)
# PDF Page 81:   Massey Ferguson section header
# PDF Pages 82-84: Massey Ferguson (MF1004, MF1104, MF1204)
# PDF Page 85:   S1204-C → Massey Ferguson compatible clone
# PDF Pages 86-87: ISEKI (ISEKI T954, ISEKI T804)
# PDF Page 88:   Divider page
# PDF Pages 89-93: Kubota M-series (M704K, M854K, M954K, M1004Q — V3800 Kubota engine)

issues = []

def fix_product(p):
    model = p.get('model', '')
    pid = p.get('id', '')
    brand = p.get('brand', '')
    changes = []

    # ── Fix brand = "Unknown" ──────────────────────────────────────────────────
    if brand == 'Unknown':
        # SinoHarvest: SH, SNH, TM prefix models
        if model.startswith(('SH', 'SNH', 'TM')):
            p['brand'] = 'SinoHarvest'
            p['title'] = p['title'].replace('Unknown', 'SinoHarvest').replace('Tractor', 'Tractor').strip()
            changes.append(f'brand: Unknown → SinoHarvest')

        # John Deere: 3B, 5B, 5-, 5E, 6B, 6E, 484 prefix
        elif model.startswith(('3B-', '5B-', '5-', '5E-', '6B', '6E', '484')):
            p['brand'] = 'John Deere'
            p['title'] = p['title'].replace('Unknown', 'John Deere').strip()
            changes.append(f'brand: Unknown → John Deere')

        # YTO M-series: M554, M604, M704, M804, M904, M1004, M1204, M1304, M1404, M1604, M1854, M2004
        elif model.startswith('M') and any(model.startswith(f'M{n}') for n in ['554', '604', '704', '804', '904', '1004', '1204', '1304', '1404', '1604', '1854', '2004']):
            p['brand'] = 'YTO'
            p['title'] = p['title'].replace('Unknown', 'YTO').strip()
            changes.append(f'brand: Unknown → YTO')

        # SinoHarvest CD/DF series: CD, DF prefix
        elif model.startswith(('CD', 'DF')):
            p['brand'] = 'SinoHarvest'
            p['title'] = p['title'].replace('Unknown', 'SinoHarvest').strip()
            changes.append(f'brand: Unknown → SinoHarvest')

        # Massey Ferguson: MF1004, MF1104, MF1204, S1204-C
        elif model.startswith('MF1') or model == 'S1204-C':
            p['brand'] = 'Massey Ferguson'
            p['title'] = p['title'].replace('Unknown', 'Massey Ferguson').strip()
            changes.append(f'brand: Unknown → Massey Ferguson')

        # Kubota M-series with K suffix: M704K, M854K, M954K, M954KQ, M1004Q
        elif model.startswith('M') and model.endswith(('K', 'KQ', 'Q')):
            p['brand'] = 'Kubota'
            p['title'] = p['title'].replace('Unknown', 'Kubota').strip()
            changes.append(f'brand: Unknown → Kubota')

        # Remaining unknown
        else:
            issues.append(f'  ⚠️  Still Unknown: id={pid} model={model}')

    # ── Fix ISEKI brand (already named in PDF) — title fix ──────────────────
    if brand == 'ISEKI' and 'ISEKI' not in p.get('title', ''):
        p['title'] = f"ISEKI {model} Tractor"

    # ── Fix price: 0 → null ────────────────────────────────────────────────────
    if p.get('price') == 0:
        p['price'] = None
        changes.append('price: 0 → null')

    # ── Fix year: 0 → null ────────────────────────────────────────────────────
    if p.get('year') == 0:
        p['year'] = None
        changes.append('year: 0 → null')

    # ── Fix location/country: TBD → null ──────────────────────────────────────
    if p.get('location') == 'TBD':
        p['location'] = None
        changes.append('location: TBD → null')
    if p.get('country') == 'TBD':
        p['country'] = None
        changes.append('country: TBD → null')

    # ── Fix service_history: boolean in type but should be string per user ────
    # Already strings in this file, no action needed.

    # ── Fix spare tire: should be boolean not string ──────────────────────────
    if p.get('details', {}).get('tires', {}).get('spare') is not None:
        spare = p['details']['tires']['spare']
        if isinstance(spare, str):
            p['details']['tires']['spare'] = spare.lower() in ('true', 'yes', '1')
            changes.append(f'tires.spare: string → bool')

    if changes:
        print(f"  ✓ [{pid}] {', '.join(changes)}")

    return p

print(f"Processing {len(products)} products...\n")
catalog['products'] = [fix_product(p) for p in products]
catalog['productCount'] = len(catalog['products'])

if issues:
    print("\n⚠️  Remaining issues to resolve manually:")
    for issue in issues:
        print(issue)

# Write corrected JSON
with open('data/product-catalog.json', 'w', encoding='utf-8') as f:
    json.dump(catalog, f, ensure_ascii=False, indent=2)

# Write corrected TS
ts_header = '''export type ListingCondition = "new" | "used" | "refurbished";

export type TractorListingDetails = {
  engine?: {
    manufacturer?: string;
    model?: string;
    displacement_cc?: number;
    cylinders?: number;
    emissions_standard?: string;
    fuel_type?: string;
    rpm_rated?: number;
    max_torque_nm?: number;
  };
  transmission_details?: {
    type?: string;
    forward_gears?: number;
    reverse_gears?: number;
    creeper?: boolean;
    reversible?: boolean;
    drive_type?: string;
    pto_drive?: string;
  };
  cabin?: {
    cabin?: boolean;
    air_conditioning?: boolean;
    heating?: boolean;
    suspension_seat?: boolean;
    radio?: boolean;
    front_loader_ready?: boolean;
    gps_ready?: boolean;
    sunroof?: boolean;
    rear_window_wiper?: boolean;
  };
  pto?: {
    rear_pto?: boolean;
    rear_pto_rpm?: string;
    rear_pto_hp?: number;
    front_pto?: boolean;
    front_pto_rpm?: string;
    front_pto_hp?: number;
  };
  hydraulics?: {
    pump_flow_lpm?: number;
    max_pressure_bar?: number;
    rear_remote_valves?: number;
    front_remote_valves?: number;
    isobus?: boolean;
    load_sensing?: boolean;
    electronic_control?: boolean;
  };
  rear_hitch?: {
    three_point_category?: string;
    lift_capacity_kg?: number;
    quick_hitch?: boolean;
  };
  front_hitch?: {
    front_hitch?: boolean;
    front_hitch_category?: string;
    front_lift_capacity_kg?: number;
  };
  tires?: {
    front_left?: string;
    front_right?: string;
    rear_left?: string;
    rear_right?: string;
    front?: string;
    rear?: string;
    spare?: boolean;
  };
  dimensions?: {
    operating_weight_kg?: number;
    max_allowed_weight_kg?: number;
    wheelbase_mm?: number;
    length_mm?: number;
    width_mm?: number;
    height_mm?: number;
    ground_clearance_mm?: number;
    turning_radius_m?: number;
  };
  electrical?: {
    voltage_v?: number;
    alternator_a?: number;
    battery_ah?: number;
    telematics?: boolean;
    telematics_system?: string;
  };
  vat_excluded?: boolean;
  max_speed_kmh?: number;
  warranty?: string;
  registration_year?: number;
  serial_number?: string;
  service_history?: string;
  first_owner?: boolean;
};

export type TractorListing = {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number | null;
  price: number | null;
  currency: string;
  condition: ListingCondition;
  location: string | null;
  country: string | null;
  description: string;
  images: string[];
  hours_used?: number;
  horsepower?: number;
  transmission?: string;
  drive_type?: string;
  details?: TractorListingDetails;
};

export type ProductCatalog = {
  source: {
    fileName: string;
    originalPath: string;
  };
  productCount: number;
  products: TractorListing[];
};

export const productCatalog: ProductCatalog = '''

ts_body = json.dumps(catalog, ensure_ascii=False, indent=2)

with open('data/product-catalog.ts', 'w', encoding='utf-8') as f:
    f.write(ts_header)
    f.write(ts_body)
    f.write(';\n')

print(f"\n✅ Done! Wrote corrected product-catalog.json and product-catalog.ts")
print(f"   Total products: {len(catalog['products'])}")
brands = {}
for p in catalog['products']:
    b = p.get('brand', 'Unknown')
    brands[b] = brands.get(b, 0) + 1
print("\n   Brand breakdown:")
for brand, count in sorted(brands.items()):
    print(f"   - {brand}: {count}")
