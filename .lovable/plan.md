

## Full System Recovery & Bug Fix Plan

### Bugs Found

**1. Search navigation broken for products (Bug)**
In `Navbar.tsx` line 375, search results navigate to `/flowers/${r.id}` using the UUID. But `FlowerDetail.tsx` resolves products by matching `product_name` via `ilike`. A UUID slug like `3f095000-30d1-44f7-bbdb-6cf32e7f67f0` will never match any product name. Must convert product name to a slug for navigation instead.

**2. Search navigation broken for guidelines (Bug)**
Search navigates to `/guidelines/${r.id}` but there's no route for `/guidelines/:slug`. The guideline detail route is `/guideline/:slug` and `/blog/:slug`. Should navigate to `/blog/${r.id}` which correctly resolves by ID in `GuidelineDetail.tsx`.

**3. Guideline image upload not wired (Bug)**
`AdminAddGuideline.tsx` accepts file uploads but never uploads them to storage or saves the URL in `image_url`. The `guideline-media` bucket referenced in memory doesn't exist (only `product-images` and `avatars` exist). Articles are created with `image_url = null`, so guidelines always show "No image".

**4. Guideline edit image upload not wired (Bug)**
`AdminEditGuideline.tsx` has a file input but no `onChange` handler that uploads. Defaults to a static import `guideRepot` as fallback. Image changes are never persisted.

**5. Admin login conflict with user session (Potential issue)**
Both `AuthContext` and `AdminAuthContext` share the same Supabase auth session. When an admin logs in via `/admin/login`, it also triggers `AuthContext.onAuthStateChange`, setting a user session. If an admin then navigates to `/` they appear as a regular logged-in user. This is acceptable behavior but worth noting.

**6. Register auto-login may fail if email confirmation is required (Potential issue)**
`Register.tsx` calls `login()` immediately after `register()`. If email confirmation is enabled, the login will fail because the email isn't verified yet. This would show an error. Need to handle this gracefully.

---

### Implementation Plan

#### Step 1: Fix search navigation (Navbar.tsx)
- For products: construct slug from product name (`r.name.toLowerCase().replace(/\s+/g, "-")`) and navigate to `/flowers/${slug}` instead of `/flowers/${r.id}`
- For guidelines: navigate to `/blog/${r.id}` instead of `/guidelines/${r.id}`

#### Step 2: Create guideline-media storage bucket (Migration)
- Create a `guideline-media` public storage bucket
- Add RLS policies: anyone can view, admins can upload/delete

#### Step 3: Wire guideline image upload in AdminAddGuideline.tsx
- After creating the article, upload selected files to `guideline-media` bucket
- Save the first image's public URL as `image_url` on the article record
- Update the article with the image URL after upload

#### Step 4: Wire guideline image upload in AdminEditGuideline.tsx
- Add actual file upload handler on the file input
- Upload new image to `guideline-media` bucket
- Update article's `image_url` with new public URL
- Remove the static `guideRepot` import fallback

#### Step 5: Handle registration when email confirmation is enabled
- In `Register.tsx`, wrap the `login()` call in a try-catch
- If login fails after register (email not confirmed), show a success message directing user to check email, then navigate to `/login`
- If login succeeds, navigate to `/` as currently intended

### Database changes needed
- Create `guideline-media` storage bucket with public access and admin upload RLS policies

### Files to modify
- `src/components/layout/Navbar.tsx` (search navigation fix)
- `src/pages/admin/AdminAddGuideline.tsx` (wire image upload)
- `src/pages/admin/AdminEditGuideline.tsx` (wire image upload)
- `src/pages/Register.tsx` (handle email confirmation gracefully)

