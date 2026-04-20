
-- Drop all existing RESTRICTIVE policies and recreate as PERMISSIVE

-- ========== categories ==========
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;

CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ========== subcategories ==========
DROP POLICY IF EXISTS "Admins can manage subcategories" ON public.subcategories;
DROP POLICY IF EXISTS "Anyone can view subcategories" ON public.subcategories;

CREATE POLICY "Anyone can view subcategories" ON public.subcategories FOR SELECT USING (true);
CREATE POLICY "Admins can manage subcategories" ON public.subcategories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ========== products ==========
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;

CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can manage products" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ========== product_images ==========
DROP POLICY IF EXISTS "Admins can manage product images" ON public.product_images;
DROP POLICY IF EXISTS "Anyone can view product images" ON public.product_images;

CREATE POLICY "Anyone can view product images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Admins can manage product images" ON public.product_images FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ========== guidelines_articles ==========
DROP POLICY IF EXISTS "Admins can manage articles" ON public.guidelines_articles;
DROP POLICY IF EXISTS "Anyone can view articles" ON public.guidelines_articles;

CREATE POLICY "Anyone can view articles" ON public.guidelines_articles FOR SELECT USING (true);
CREATE POLICY "Admins can manage articles" ON public.guidelines_articles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ========== queries ==========
DROP POLICY IF EXISTS "Admins can view queries" ON public.queries;
DROP POLICY IF EXISTS "Anyone can submit a query" ON public.queries;

CREATE POLICY "Anyone can submit a query" ON public.queries FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view queries" ON public.queries FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ========== profiles ==========
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ========== notifications ==========
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- ========== user_roles ==========
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
