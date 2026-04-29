-- 1. Flag en products
ALTER TABLE products ADD COLUMN IF NOT EXISTS has_variants BOOLEAN NOT NULL DEFAULT false;

-- 2. product_attributes
CREATE TABLE IF NOT EXISTS product_attributes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE ON UPDATE NO ACTION,
  name        TEXT NOT NULL,
  position    INTEGER NOT NULL DEFAULT 0
);

-- 3. attribute_values
CREATE TABLE IF NOT EXISTS attribute_values (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attribute_id UUID NOT NULL REFERENCES product_attributes(id) ON DELETE CASCADE ON UPDATE NO ACTION,
  value        TEXT NOT NULL,
  position     INTEGER NOT NULL DEFAULT 0
);

-- 4. product_variants  (debe existir ANTES que sale_items la referencie)
CREATE TABLE IF NOT EXISTS product_variants (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE ON UPDATE NO ACTION,
  sku        TEXT NOT NULL,
  cost_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  sale_price DECIMAL(12,2) NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(product_id, sku)
);

-- 5. variant_attribute_values
CREATE TABLE IF NOT EXISTS variant_attribute_values (
  variant_id         UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE ON UPDATE NO ACTION,
  attribute_value_id UUID NOT NULL REFERENCES attribute_values(id) ON DELETE CASCADE ON UPDATE NO ACTION,
  PRIMARY KEY (variant_id, attribute_value_id)
);

-- 6. variant_stock
CREATE TABLE IF NOT EXISTS variant_stock (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE ON UPDATE NO ACTION,
  branch_id  UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE ON UPDATE NO ACTION,
  quantity   DECIMAL(12,3) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(variant_id, branch_id)
);

-- 7. variant_id en sale_items (ahora product_variants ya existe)
ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL ON UPDATE NO ACTION;
