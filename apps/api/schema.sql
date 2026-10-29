DROP TABLE IF EXISTS frog_species_details;
DROP TABLE IF EXISTS user_carts;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL DEFAULT '',
  password_salt TEXT NOT NULL DEFAULT '',
  google_id TEXT, -- Unique Google Sub ID
  avatar_url TEXT NOT NULL DEFAULT '',
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT 'Hà Nội',
  latitude REAL, -- Vĩ độ GPS
  longitude REAL, -- Kinh độ GPS
  role TEXT NOT NULL DEFAULT 'customer', -- 'customer' | 'admin'
  status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'suspended'
  created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;

CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT '🐸'
);

CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  slug TEXT NOT NULL UNIQUE, -- URL thân thiện: pacman-green, ech-cay-mat-do...
  name TEXT NOT NULL,
  scientific_name TEXT NOT NULL DEFAULT '',
  morph TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL, -- VND
  original_price INTEGER NOT NULL DEFAULT 0, -- VND
  size_stage TEXT NOT NULL DEFAULT 'Baby (3-4cm)',
  lifespan TEXT NOT NULL DEFAULT '8-12 năm',
  difficulty TEXT NOT NULL DEFAULT 'Dễ', -- Dễ, Trung bình, Nâng cao
  habitat_type TEXT NOT NULL DEFAULT 'terrestrial', -- 'terrestrial' | 'arboreal' | 'paludarium' | 'aquatic'
  temperature TEXT NOT NULL DEFAULT '24 - 28°C',
  humidity TEXT NOT NULL DEFAULT '70 - 85%',
  diet TEXT NOT NULL DEFAULT 'Cá mồi, dế, sâu canxi',
  description TEXT NOT NULL DEFAULT '',
  care_guide TEXT NOT NULL DEFAULT '',
  health_status TEXT NOT NULL DEFAULT 'Khỏe mạnh, ăn tốt, bảo hành sống 100% khi nhận hàng',
  image TEXT NOT NULL,
  gallery_images_json TEXT NOT NULL DEFAULT '[]', -- Mảng JSON ảnh thật không watermark
  stock INTEGER NOT NULL DEFAULT 10,
  is_featured INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

CREATE TABLE frog_species_details (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
  family TEXT NOT NULL DEFAULT '',
  genus TEXT NOT NULL DEFAULT '',
  species TEXT NOT NULL DEFAULT '',
  origin_region TEXT NOT NULL DEFAULT '',
  natural_habitat TEXT NOT NULL DEFAULT '',
  adult_size_male_cm REAL NOT NULL DEFAULT 0,
  adult_size_female_cm REAL NOT NULL DEFAULT 0,
  lifespan_years TEXT NOT NULL DEFAULT '',
  activity_period TEXT NOT NULL DEFAULT 'nocturnal', -- 'nocturnal' | 'diurnal' | 'crepuscular'
  temperament TEXT NOT NULL DEFAULT 'docile',
  social_cohabitation TEXT NOT NULL DEFAULT 'strictly_solitary', -- 'strictly_solitary' | 'communal' | 'pairs_only'
  enclosure_type TEXT NOT NULL DEFAULT 'terrestrial',
  min_tank_size TEXT NOT NULL DEFAULT '45x45x45cm',
  temp_day_min REAL NOT NULL DEFAULT 24.0,
  temp_day_max REAL NOT NULL DEFAULT 28.0,
  temp_night_min REAL NOT NULL DEFAULT 20.0,
  temp_night_max REAL NOT NULL DEFAULT 22.0,
  humidity_min INTEGER NOT NULL DEFAULT 70,
  humidity_max INTEGER NOT NULL DEFAULT 80,
  lighting_uvb TEXT NOT NULL DEFAULT 'Khuyến khích dùng UVB 2.0 hoặc 5.0 nhẹ',
  substrate_recommended TEXT NOT NULL DEFAULT '',
  water_requirements TEXT NOT NULL DEFAULT '',
  primary_diet_json TEXT NOT NULL DEFAULT '[]',
  feeding_frequency TEXT NOT NULL DEFAULT '',
  supplements_guide TEXT NOT NULL DEFAULT '',
  handling_safety TEXT NOT NULL DEFAULT 'Hạn chế tối đa, da thẩm thấu màng mỏng manh',
  toxicity_warning TEXT NOT NULL DEFAULT 'Không độc ở cá thể sinh sản nhân tạo',
  common_health_issues TEXT NOT NULL DEFAULT '',
  critical_warnings_json TEXT NOT NULL DEFAULT '[]',
  ai_knowledge_snippet TEXT NOT NULL DEFAULT '', -- Fact sheet Markdown chuẩn cho LLM/RAG
  ai_facts_json TEXT NOT NULL DEFAULT '{}', -- Fact sheet JSON chuẩn ISO cho AI query
  created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX IF NOT EXISTS idx_frog_details_product_id ON frog_species_details(product_id);

CREATE TABLE user_carts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
  UNIQUE(user_id, product_id)
);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_code TEXT NOT NULL UNIQUE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Bắt buộc phải đăng nhập
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Hà Nội',
  latitude REAL, -- Tọa độ GPS giao nhận hỏa tốc
  longitude REAL, -- Tọa độ GPS giao nhận hỏa tốc
  notes TEXT NOT NULL DEFAULT '',
  shipping_method TEXT NOT NULL DEFAULT 'Hỏa tốc đóng thùng xốp giữ ẩm',
  payment_method TEXT NOT NULL DEFAULT 'COD',
  total_amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'packing', 'shipping', 'completed', 'cancelled'
  created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL
);
