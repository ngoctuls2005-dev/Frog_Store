path = "apps/api/seed.sql"
with open(path, "r", encoding="utf-8") as f:
    sql = f.read()

target = '\'["/images/frogs/tree-whites-dumpy.jpg", "/images/frogs/tree-blue-snowflake.jpg"]\''
replacement = '\'["/images/frogs/tree-whites-dumpy.jpg"]\''

if target in sql:
    sql = sql.replace(target, replacement)
    with open(path, "w", encoding="utf-8") as f:
        f.write(sql)
    print("SUCCESS: Fixed gallery_images in seed.sql!")
else:
    print("No cross-reference found in seed.sql")
