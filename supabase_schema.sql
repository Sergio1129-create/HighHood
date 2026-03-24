-- ==========================================
-- HIGHHOOD E-Commerce Schema (Up to 4NF)
-- ==========================================

-- 1. Table: profiles (Extends Supabase Auth Users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Table: products
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2) NOT NULL CHECK (base_price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 3. Table: categories
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 4. Table: product_categories (Resolves Many-to-Many for 3NF/4NF)
CREATE TABLE public.product_categories (
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, category_id)
);

ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- 5. Table: product_variants (Extracts sizes/colors from products for 4NF)
CREATE TABLE public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    size TEXT,
    color TEXT,
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(product_id, size, color)
);

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- 6. Table: product_images (Multi-valued attribute normalization for 4NF)
CREATE TABLE public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- 7. Table: orders
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 8. Table: order_items
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_purchase DECIMAL(10, 2) NOT NULL CHECK (price_at_purchase >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- RLS POLICIES (Development setup)
-- ==========================================
-- Notes: For a production app, tighten these up. 
-- Right now, allowing read for all, and admins can insert/update.

-- Read access (public for products/categories)
CREATE POLICY "Public profiles are visible to everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Products are viewable by everyone." ON products FOR SELECT USING (true);
CREATE POLICY "Categories are viewable by everyone." ON categories FOR SELECT USING (true);
CREATE POLICY "Product Categories are viewable by everyone." ON product_categories FOR SELECT USING (true);
CREATE POLICY "Product Variants are viewable by everyone." ON product_variants FOR SELECT USING (true);
CREATE POLICY "Product Images are viewable by everyone." ON product_images FOR SELECT USING (true);

-- Admin write access (simplified logic indicating role = admin can do everything)
-- In a real scenario, this involves a JWT claim or joining the profiles table.
-- Assuming user role is stored in profiles. 
-- Creating a helper function for admin check
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Write policies for admin
CREATE POLICY "Admins can insert products" ON products FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update products" ON products FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete products" ON products FOR DELETE USING (public.is_admin());

CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can manage product_categories" ON product_categories FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can manage variants" ON product_variants FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can manage product_images" ON product_images FOR ALL USING (public.is_admin());

-- Orders policies (users can see their own orders, admins can see all)
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can create their own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update orders" ON orders FOR UPDATE USING (public.is_admin());

CREATE POLICY "Users can view their order items" ON order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR public.is_admin()))
);
CREATE POLICY "Users can insert order items" ON order_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
