-- ============================================================
-- HIGHHOOD E-Commerce Schema — Normalizado hasta 4FN (4NF)
-- ============================================================
-- Revisión: 2.0
-- Autor: Antigravity / Sergio Murillo
--
-- ANÁLISIS DE NORMALIZACIÓN:
-- 1FN: Todos los atributos son atómicos. Sin grupos repetitivos.
-- 2FN: Toda clave foránea depende de TODA la clave primaria (sin deps. parciales).
-- 3FN: Sin dependencias transitivas entre atributos no clave.
-- 4FN: Sin dependencias multivaluadas independientes en una misma tabla.
--      (ej. las tallas y colores están separados; las imágenes en tabla propia).
--
-- ENTIDADES PRINCIPALES:
--   auth.users (Supabase) → profiles → addresses
--   brands → products → product_variants (size+color) → order_items → orders
--   orders → order_shipping (snapshot) → payments
--   products → product_images (4FN: multi-valor independiente)
--   products ↔ categories (M:N via product_categories)
--   discount_codes ↔ orders (M:N via order_discounts)
-- ============================================================


-- ============================
-- TIPOS ENUMERADOS
-- ============================

CREATE TYPE public.user_role AS ENUM ('customer', 'admin');
CREATE TYPE public.order_status AS ENUM (
  'pending',       -- pedido creado, sin pago confirmado
  'confirmed',     -- pago recibido
  'processing',    -- en preparación
  'shipped',       -- enviado
  'delivered',     -- entregado
  'cancelled',     -- cancelado por usuario o admin
  'refunded'       -- reembolsado
);
CREATE TYPE public.payment_status AS ENUM (
  'pending',
  'completed',
  'failed',
  'refunded'
);
CREATE TYPE public.discount_type AS ENUM ('percentage', 'fixed_amount');
CREATE TYPE public.image_role AS ENUM ('hero', 'product', 'general', 'reel');


-- ============================
-- 1. TABLA: profiles
-- ============================
-- Extiende auth.users con datos del cliente.
-- 1FN: todos los campos son atómicos.
-- 3FN: full_name y phone dependen directamente del id (sin transitividad).
-- El teléfono va aquí y NO en addresses porque es un atributo del USUARIO,
-- no de la dirección. Evita transitividad con direcciones (3FN).

CREATE TABLE public.profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name       TEXT,
    phone           TEXT,
    role            public.user_role NOT NULL DEFAULT 'customer',
    created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.profiles IS
  'Perfil extendido del usuario. Separado de auth.users para cumplir 3FN: evita dependencias transitivas entre datos de autenticación y datos del negocio.';


-- ============================
-- 2. TABLA: addresses
-- ============================
-- Las direcciones son ENTIDAD PROPIA (no columnas en profiles ni en orders).
-- VIOLACIÓN DE 3FN QUE EVITAMOS: NO almacenar ciudad/país en orders directamente,
-- ya que ciudad depende del código postal (transitividad). Las direcciones son
-- entidades con su propio ciclo de vida.
-- Un usuario puede tener múltiples direcciones (1:N).
-- 4FN: Las direcciones son un hecho independiente del perfil del usuario.

CREATE TABLE public.addresses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    -- Destinatario (puede ser diferente al usuario que compra)
    recipient_name  TEXT NOT NULL,
    recipient_phone TEXT NOT NULL,
    address_line_1  TEXT NOT NULL,
    address_line_2  TEXT,           -- nullable: apartamento, interior, etc.
    city            TEXT NOT NULL,
    state_province  TEXT NOT NULL,
    postal_code     TEXT,
    country         TEXT NOT NULL DEFAULT 'Colombia',
    is_default      BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.addresses IS
  'Direcciones de envío reutilizables. Separadas de orders para evitar redundancia (3FN). Al crear una orden se hace un SNAPSHOT para preservar el historial aun si el usuario cambia su dirección.';


-- ============================
-- 3. TABLA: brands
-- ============================
-- Antes era solo un ARRAY en el código TypeScript.
-- 4FN: La marca es un hecho independiente del producto.
-- 2FN: Todos los atributos dependen de la clave primaria `id`.

CREATE TABLE public.brands (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL UNIQUE,
    slug        TEXT NOT NULL UNIQUE,
    logo_url    TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.brands IS
  'Marcas como entidad propia (antes era array hardcodeado). Permite CRUD desde el admin y filtrado dinámico en el carrusel de marcas.';


-- ============================
-- 4. TABLA: categories
-- ============================
-- 1FN: nombre y slug son atómicos.
-- 3FN: slug depende únicamente del id (no hay transitividad).

CREATE TABLE public.categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL UNIQUE,
    slug        TEXT NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);


-- ============================
-- 5. TABLA: products
-- ============================
-- Datos BASE del producto (sin variantes, sin imágenes).
-- 2FN: Todos los atributos dependen de `id`.
-- 3FN: brand_id → nombre de marca, pero el nombre no está aquí (JOIN para obtenerlo).
--      Así evitamos la transitividad: name → brand_name (se elimina almacenando solo FK).
-- 4FN: Las imágenes y las categorías viven en tablas propias
--      porque son hechos multivaluados independientes entre sí.

CREATE TABLE public.products (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id        UUID REFERENCES public.brands(id) ON DELETE SET NULL,
    name            TEXT NOT NULL,
    description     TEXT,
    base_price      DECIMAL(12, 2) NOT NULL CHECK (base_price >= 0),
    is_trending     BOOLEAN NOT NULL DEFAULT false,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.products IS
  'Datos base del producto. Las variantes (talla+color), imágenes y categorías viven en sus propias tablas para cumplir 4FN: son multivaluados independientes.';


-- ============================
-- 6. TABLA: product_categories (resuelve M:N)
-- ============================
-- 4FN: Categorías e imágenes son hechos multivaluados INDEPENDIENTES sobre un producto.
--      Si los mezclas viola 4FN: (producto→categorías) y (producto→imágenes) son
--      dependencias multivaluadas distintas.

CREATE TABLE public.product_categories (
    product_id      UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    category_id     UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, category_id)
);

COMMENT ON TABLE public.product_categories IS
  'Resuelve M:N entre productos y categorías. Tabla puente necesaria para 2FN y 4FN.';


-- ============================
-- 7. TABLA: product_sizes (dimensión independiente)
-- ============================
-- 4FN: Las tallas son un hecho independiente de los colores.
--      NO se pueden mezclar tallas y colores en una sola tabla de variantes
--      sin una relación entre ellos → por eso existe product_variants como la
--      combinación SKU específica.

CREATE TABLE public.product_sizes (
    id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label   TEXT NOT NULL UNIQUE  -- 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'Única'
);

INSERT INTO public.product_sizes (label) VALUES
  ('Única'), ('XS'), ('S'), ('M'), ('L'), ('XL'), ('XXL'), ('XXXL');


-- ============================
-- 8. TABLA: product_colors (dimensión independiente)
-- ============================

CREATE TABLE public.product_colors (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL UNIQUE,    -- 'Negro', 'Blanco', 'Rojo'
    hex_code    TEXT                     -- '#000000'
);


-- ============================
-- 9. TABLA: product_variants (SKU específico)
-- ============================
-- Una variante = la combinación única de (producto + talla + color).
-- Esto es lo que tiene stock y precio propio.
-- 2FN: sku, stock_quantity y price_modifier dependen de TODA la PK (product_id, size_id, color_id).
-- 4FN: Combinamos talla Y color porque su relación sí está ligada al stock:
--      un producto puede tener una talla L en rojo con 5 unidades, pero L en negro con 0.
--      Esto NO viola 4FN porque la dependencia NO es independiente: el stock
--      depende de la combinación específica, no de cada atributo por separado.

CREATE TABLE public.product_variants (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id      UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    size_id         UUID REFERENCES public.product_sizes(id) ON DELETE SET NULL,
    color_id        UUID REFERENCES public.product_colors(id) ON DELETE SET NULL,
    sku             TEXT UNIQUE,             -- código de referencia único
    stock_quantity  INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    price_modifier  DECIMAL(12, 2) NOT NULL DEFAULT 0.00, -- ajuste sobre base_price
    created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE (product_id, size_id, color_id)
);

COMMENT ON TABLE public.product_variants IS
  'SKU específico: combinación única de producto+talla+color con su propio stock y modificador de precio. La combinación no viola 4FN porque el stock DEPENDE de ambas dimensiones a la vez, no son hechos independientes.';


-- ============================
-- 10. TABLA: product_images
-- ============================
-- 4FN: Las imágenes son un hecho multivaluado INDEPENDIENTE de las categorías.
--      No se pueden mezclar en una sola tabla con las categorías.
-- Las imágenes de producto están separadas de las imágenes generales del sitio
-- (hero, banners) que se guardan en site_media.

CREATE TABLE public.product_images (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id      UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url       TEXT NOT NULL,
    alt_text        TEXT,
    display_order   INTEGER NOT NULL DEFAULT 0,
    is_primary      BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.product_images IS
  'Imágenes del producto. Tabla separada para cumplir 4FN: imágenes y categorías son hechos multivaluados independientes — mezclarlos en una tabla violaría 4FN.';


-- ============================
-- 11. TABLA: site_media
-- ============================
-- Imágenes del sitio (hero banners, reels, general).
-- Separado de product_images porque son entidades de negocio distintas.
-- 3FN: role no determina otros atributos (no transitividad).

CREATE TABLE public.site_media (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url       TEXT NOT NULL,
    alt_text        TEXT,
    role            public.image_role NOT NULL DEFAULT 'general',
    display_order   INTEGER NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.site_media IS
  'Imágenes y media del sitio (heroes, reels). Separado de product_images porque son grupos funcionales distintos — mezclarlos violaría 1FN (heterogeneidad de propósito) y dificultaría el mantenimiento.';


-- ============================
-- 12. TABLA: discount_codes
-- ============================
-- Los descuentos son una entidad propia para poder reutilizarlos.
-- 3FN: discount_value no determina otros campos (sin transitividad).
-- 4FN: La tabla no tiene hechos multivaluados independientes.

CREATE TABLE public.discount_codes (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code                TEXT NOT NULL UNIQUE,
    discount_type       public.discount_type NOT NULL,
    discount_value      DECIMAL(10, 2) NOT NULL CHECK (discount_value > 0),
    min_order_amount    DECIMAL(12, 2) DEFAULT 0.00,
    max_uses            INTEGER,         -- NULL = ilimitado
    uses_count          INTEGER NOT NULL DEFAULT 0,
    valid_from          TIMESTAMPTZ,
    valid_until         TIMESTAMPTZ,
    is_active           BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ DEFAULT now() NOT NULL
);


-- ============================
-- 13. TABLA: orders
-- ============================
-- Una orden = intención de compra confirmada.
-- 3FN: subtotal, shipping_cost, discount_amount y total_amount son calculados
--      o capturados en el momento — NO dependen transitivamente entre sí
--      (guardamos el total como snapshot para integridad histórica).
-- La dirección de envío se guarda como SNAPSHOT en order_shipping (ver tabla 14),
-- NO como FK a addresses. Esto es crítico para 3FN histórica:
--      si el usuario cambia su dirección, la orden original no debe cambiar.

CREATE TABLE public.orders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number    TEXT NOT NULL UNIQUE DEFAULT 'HH-' || to_char(now(), 'YYYYMM') || '-' || substr(gen_random_uuid()::text, 1, 6),
    user_id         UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- nullable: compras como invitado
    status          public.order_status NOT NULL DEFAULT 'pending',
    subtotal        DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    shipping_cost   DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_amount    DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    customer_notes  TEXT,
    created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.orders IS
  'Cabecera de la orden. NO almacena la dirección directamente (esa va en order_shipping como snapshot). NO almacena items (están en order_items). Campos de dinero son snapshots del momento de la compra para integridad histórica.';


-- ============================
-- 14. TABLA: order_shipping (snapshot de dirección)
-- ============================
-- PATRÓN CLAVE para 3FN e integridad histórica:
-- Guardamos una COPIA de los datos de envío en el momento del pedido.
-- Si el usuario actualiza su dirección después, el historial de la orden
-- permanece intacto. Viola 3FN si ponemos FK a addresses porque:
--   order → shipping_address_id → city (transitividad futura si se actualiza).
-- Relación 1:1 con orders.

CREATE TABLE public.order_shipping (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id            UUID NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
    -- Snapshot del destinatario en el momento del pedido
    recipient_name      TEXT NOT NULL,
    recipient_phone     TEXT NOT NULL,
    address_line_1      TEXT NOT NULL,
    address_line_2      TEXT,
    city                TEXT NOT NULL,
    state_province      TEXT NOT NULL,
    postal_code         TEXT,
    country             TEXT NOT NULL DEFAULT 'Colombia',
    -- Seguimiento del envío
    carrier             TEXT,           -- 'Servientrega', 'Coordinadora', etc.
    tracking_number     TEXT,
    shipped_at          TIMESTAMPTZ,
    estimated_delivery  TIMESTAMPTZ,
    delivered_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at          TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.order_shipping IS
  'Snapshot inmutable de la dirección de envío al momento del pedido (patrón de integridad histórica). Relacionado 1:1 con orders. Incluye campos de rastreo.';


-- ============================
-- 15. TABLA: order_items
-- ============================
-- Cada fila = un tipo de producto dentro de la orden.
-- 2FN: unit_price y quantity dependen de TODA la PK compuesta (order_id, variant_id).
--      NO se guarda el nombre del producto aquí → JOIN con products.
--      SÍ se guarda unit_price como SNAPSHOT (precio puede cambiar).
-- 4FN: No hay hechos multivaluados independientes.

CREATE TABLE public.order_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    variant_id      UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE RESTRICT,
    quantity        INTEGER NOT NULL CHECK (quantity > 0),
    unit_price      DECIMAL(12, 2) NOT NULL CHECK (unit_price >= 0), -- SNAPSHOT del precio
    subtotal        DECIMAL(12, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE (order_id, variant_id)
);

COMMENT ON TABLE public.order_items IS
  'Items de la orden. unit_price es SNAPSHOT del precio al momento de compra (2FN). subtotal es columna generada para evitar inconsistencias. variant_id usa RESTRICT para no perder historial si se elimina una variante.';


-- ============================
-- 16. TABLA: payments
-- ============================
-- Un pago puede tener múltiples intentos (varios registros por order_id).
-- 3FN: provider_payment_id no determina order_id ni amount (sin transitividad).
-- Separado de orders para cumplir SRP y 3FN: los datos de pago son independientes
-- del estado logístico de la orden.

CREATE TABLE public.payments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id            UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    provider            TEXT NOT NULL,  -- 'wompi', 'stripe', 'paypal', 'efectivo'
    provider_payment_id TEXT,           -- ID externo del proveedor de pagos
    amount              DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
    currency            TEXT NOT NULL DEFAULT 'COP',
    status              public.payment_status NOT NULL DEFAULT 'pending',
    metadata            JSONB,          -- datos extra del proveedor (no normalizados a propósito: son opacos)
    created_at          TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at          TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.payments IS
  'Intentos de pago. Un pedido puede tener múltiples intentos fallidos y un exitoso. metadata en JSONB para datos opacos del proveedor (Wompi, Stripe, etc.) — normalizar esto sería over-engineering.';


-- ============================
-- 17. TABLA: order_discounts (M:N entre orders y discount_codes)
-- ============================
-- Resuelve que una orden puede usar varios códigos y un código
-- puede aplicarse a múltiples órdenes.
-- 4FN: Los descuentos por orden son un hecho multivaluado independiente
--      del shipping → tabla separada obligatoria.

CREATE TABLE public.order_discounts (
    order_id            UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    discount_code_id    UUID NOT NULL REFERENCES public.discount_codes(id) ON DELETE RESTRICT,
    amount_applied      DECIMAL(12, 2) NOT NULL,
    PRIMARY KEY (order_id, discount_code_id)
);


-- ============================
-- FUNCIONES HELPER
-- ============================

-- Función para verificar si el usuario actual es admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Disparadores de updated_at
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_addresses_updated_at
  BEFORE UPDATE ON public.addresses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_order_shipping_updated_at
  BEFORE UPDATE ON public.order_shipping
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================
-- ÍNDICES (para rendimiento)
-- ============================

CREATE INDEX idx_products_brand_id ON public.products(brand_id);
CREATE INDEX idx_products_is_active ON public.products(is_active);
CREATE INDEX idx_products_is_trending ON public.products(is_trending);
CREATE INDEX idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_variant_id ON public.order_items(variant_id);
CREATE INDEX idx_addresses_user_id ON public.addresses(user_id);
CREATE INDEX idx_payments_order_id ON public.payments(order_id);


-- ============================
-- ROW LEVEL SECURITY (RLS)
-- ============================

ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_sizes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_colors   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_media       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_codes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_shipping   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_discounts  ENABLE ROW LEVEL SECURITY;

-- ── Profiles ──────────────────────────────────
CREATE POLICY "Usuarios ven su propio perfil"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuarios actualizan su propio perfil"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins ven todos los perfiles"
  ON public.profiles FOR SELECT USING (public.is_admin());

-- ── Addresses ─────────────────────────────────
CREATE POLICY "Usuarios gestionan sus propias direcciones"
  ON public.addresses FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins ven todas las direcciones"
  ON public.addresses FOR SELECT USING (public.is_admin());

-- ── Catálogo (lectura pública) ─────────────────
CREATE POLICY "Marcas visibles al público"
  ON public.brands FOR SELECT USING (is_active = true);

CREATE POLICY "Categorías visibles al público"
  ON public.categories FOR SELECT USING (true);

CREATE POLICY "Productos activos visibles al público"
  ON public.products FOR SELECT USING (is_active = true);

CREATE POLICY "Relaciones producto-categoría visibles al público"
  ON public.product_categories FOR SELECT USING (true);

CREATE POLICY "Tallas visibles al público"
  ON public.product_sizes FOR SELECT USING (true);

CREATE POLICY "Colores visibles al público"
  ON public.product_colors FOR SELECT USING (true);

CREATE POLICY "Variantes visibles al público"
  ON public.product_variants FOR SELECT USING (true);

CREATE POLICY "Imágenes de producto visibles al público"
  ON public.product_images FOR SELECT USING (true);

CREATE POLICY "Media del sitio visible al público"
  ON public.site_media FOR SELECT USING (is_active = true);

-- ── Catálogo (escritura admin) ─────────────────
CREATE POLICY "Admins gestionan marcas"
  ON public.brands FOR ALL USING (public.is_admin());

CREATE POLICY "Admins gestionan categorías"
  ON public.categories FOR ALL USING (public.is_admin());

CREATE POLICY "Admins gestionan productos"
  ON public.products FOR ALL USING (public.is_admin());

CREATE POLICY "Admins gestionan product_categories"
  ON public.product_categories FOR ALL USING (public.is_admin());

CREATE POLICY "Admins gestionan variantes"
  ON public.product_variants FOR ALL USING (public.is_admin());

CREATE POLICY "Admins gestionan imágenes de productos"
  ON public.product_images FOR ALL USING (public.is_admin());

CREATE POLICY "Admins gestionan media del sitio"
  ON public.site_media FOR ALL USING (public.is_admin());

CREATE POLICY "Admins gestionan tallas"
  ON public.product_sizes FOR ALL USING (public.is_admin());

CREATE POLICY "Admins gestionan colores"
  ON public.product_colors FOR ALL USING (public.is_admin());

-- ── Órdenes ───────────────────────────────────
CREATE POLICY "Usuarios ven sus propias órdenes"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Usuarios autenticados crean órdenes"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins actualizan estados de órdenes"
  ON public.orders FOR UPDATE
  USING (public.is_admin());

-- ── Order Shipping ─────────────────────────────
CREATE POLICY "Usuarios ven shipping de sus órdenes"
  ON public.order_shipping FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_shipping.order_id
        AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Sistema inserta shipping al crear orden"
  ON public.order_shipping FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_shipping.order_id
        AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins actualizan tracking de envíos"
  ON public.order_shipping FOR UPDATE
  USING (public.is_admin());

-- ── Order Items ───────────────────────────────
CREATE POLICY "Usuarios ven items de sus órdenes"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Sistema inserta items al crear orden"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

-- ── Payments ──────────────────────────────────
CREATE POLICY "Usuarios ven pagos de sus órdenes"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = payments.order_id
        AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Admins gestionan pagos"
  ON public.payments FOR ALL USING (public.is_admin());

-- ── Descuentos ────────────────────────────────
CREATE POLICY "Descuentos activos visibles al público"
  ON public.discount_codes FOR SELECT USING (is_active = true);

CREATE POLICY "Admins gestionan descuentos"
  ON public.discount_codes FOR ALL USING (public.is_admin());

CREATE POLICY "Usuarios ven descuentos aplicados a sus órdenes"
  ON public.order_discounts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_discounts.order_id
        AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Sistema aplica descuentos al crear orden"
  ON public.order_discounts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_discounts.order_id
        AND orders.user_id = auth.uid()
    )
  );
