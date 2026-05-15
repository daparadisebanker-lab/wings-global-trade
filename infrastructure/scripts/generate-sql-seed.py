import json
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def sql_str(val):
    if val is None:
        return 'NULL'
    return "'" + str(val).replace("'", "''") + "'"

def sql_num(val):
    if val is None:
        return 'NULL'
    return str(val)

def sql_jsonb(val):
    if val is None:
        return 'NULL'
    return "'" + json.dumps(val, ensure_ascii=False).replace("'", "''") + "'::jsonb"

def sql_array(val):
    if not val:
        return 'ARRAY[]::TEXT[]'
    inner = ', '.join("'" + s.replace("'", "''") + "'" for s in val)
    return f'ARRAY[{inner}]'

with open('data/product-catalog.json', 'r', encoding='utf-8') as f:
    catalog = json.load(f)

products = catalog['products']
rows = []
for p in products:
    pid       = sql_str(p.get('id'))
    title     = sql_str(p.get('title'))
    brand     = sql_str(p.get('brand'))
    model     = sql_str(p.get('model'))
    year      = sql_num(p.get('year'))
    price     = sql_num(p.get('price'))
    currency  = sql_str(p.get('currency', 'USD'))
    hours     = sql_num(p.get('hours_used'))
    hp        = sql_num(p.get('horsepower'))
    condition = "'" + p.get('condition', 'new') + "'::listing_condition"
    location  = sql_str(p.get('location'))
    country   = sql_str(p.get('country'))
    desc      = sql_str(p.get('description'))
    trans     = sql_str(p.get('transmission'))
    drive     = sql_str(p.get('drive_type'))
    details   = sql_jsonb(p.get('details'))
    images    = sql_array(p.get('images', []))
    rows.append(f'  ({pid}, {title}, {brand}, {model}, {year}, {price}, {currency}, {hours}, {hp}, {condition}, {location}, {country}, {desc}, {trans}, {drive}, {details}, {images})')

out = (
    'ALTER TABLE listings ALTER COLUMN year DROP NOT NULL;\n'
    'ALTER TABLE listings ALTER COLUMN price DROP NOT NULL;\n'
    'ALTER TABLE listings ALTER COLUMN location DROP NOT NULL;\n'
    'ALTER TABLE listings ALTER COLUMN country DROP NOT NULL;\n'
    'ALTER TABLE listings ALTER COLUMN id TYPE TEXT;\n'
    '\n'
    'INSERT INTO listings\n'
    '  (id, title, brand, model, year, price, currency, hours_used, horsepower,\n'
    '   condition, location, country, description, transmission, drive_type, details, images)\n'
    'VALUES\n'
    + ',\n'.join(rows) + ';'
)

with open('infrastructure/supabase/seed-catalog.sql', 'w', encoding='utf-8') as f:
    f.write(out)

kb = round(len(out.encode('utf-8')) / 1024, 1)
print(f'Done: {len(products)} rows, {kb} KB')
