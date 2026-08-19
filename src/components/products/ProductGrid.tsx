import { Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export interface ProductItem {
  id: string;
  name: string;
  image: string;
  isNew?: boolean;
  detailPath: string;
  categoryName?: string;
  subCategoryName?: string;
  createdAt?: string;
}

interface ProductGridProps {
  title: string;
  description: string;
  /** If provided, uses static items (legacy). Otherwise fetches from DB. */
  items?: ProductItem[];
  itemsPerPage?: number;
  /** Filter by category name (e.g. "Flowers", "Pots") */
  categoryFilter?: string;
  /** Filter by subcategory id */
  subCategoryFilter?: string;
  /** Base path for product detail links */
  detailBasePath?: string;
}

const PLACEHOLDER = "/placeholder.svg";

export function ProductGrid({
  title,
  description,
  items: staticItems,
  itemsPerPage = 12,
  categoryFilter,
  subCategoryFilter,
  detailBasePath = "/products",
}: ProductGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState("popular");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(!staticItems);
  const [dbProducts, setDbProducts] = useState<ProductItem[]>([]);
  const [subCategories, setSubCategories] = useState<{ id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  // Fetch products from DB when no static items
  useEffect(() => {
    if (staticItems) return;

    let cancelled = false;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Resolve category filter(s)
        let categoryId: string | null = null;
        const { data: allCats } = await supabase
          .from("categories")
          .select("id, category_name")
          .eq("status", "active")
          .order("category_name");

        const activeCategories = (allCats || []).map((c) => ({
          id: c.id,
          name: c.category_name,
        }));
        setCategories(activeCategories);

        if (categoryFilter) {
          const match = activeCategories.find((c) =>
            c.name.toLowerCase().includes(categoryFilter.toLowerCase())
          );
          categoryId = match?.id ?? null;
        }

        // Build product query
        let query = supabase
          .from("products")
          .select("id, product_name, category_id, sub_category_id, status, stock_status, created_at, description")
          .eq("status", "active");

        if (categoryId) {
          query = query.eq("category_id", categoryId);
        }
        if (subCategoryFilter) {
          query = query.eq("sub_category_id", subCategoryFilter);
        }

        const { data: products, error } = await query.order("created_at", { ascending: false });
        if (error) throw error;
        if (cancelled) return;

        // Fetch images for these products
        const productIds = (products || []).map((p) => p.id);
        let imageMap: Record<string, string> = {};
        if (productIds.length > 0) {
          const { data: images } = await supabase
            .from("product_images")
            .select("product_id, image_url")
            .in("product_id", productIds);
          (images || []).forEach((img) => {
            if (!imageMap[img.product_id]) {
              imageMap[img.product_id] = img.image_url;
            }
          });
        }

        // Fetch subcategory names
        const subIds = [...new Set((products || []).map((p) => p.sub_category_id).filter(Boolean))];
        let subMap: Record<string, string> = {};
        if (subIds.length > 0) {
          const { data: subs } = await supabase
            .from("subcategories")
            .select("id, sub_category_name")
            .in("id", subIds);
          (subs || []).forEach((s) => {
            subMap[s.id] = s.sub_category_name;
          });
        }

        const categoryMap: Record<string, string> = {};
        activeCategories.forEach((c) => {
          categoryMap[c.id] = c.name;
        });

        const mapped: ProductItem[] = (products || []).map((p) => {
          const subName = p.sub_category_id ? subMap[p.sub_category_id] || "" : "";
          const slug = p.product_name.toLowerCase().replace(/\s+/g, "-");
          const detailPath = `${detailBasePath}/${slug}`;
          return {
            id: p.id,
            name: p.product_name,
            image: imageMap[p.id] || PLACEHOLDER,
            isNew: isNewProduct(p.created_at),
            detailPath,
            categoryName: p.category_id ? categoryMap[p.category_id] || "" : "",
            subCategoryName: subName,
            createdAt: p.created_at,
          };
        });

        if (cancelled) return;
        setDbProducts(mapped);
      } catch (err) {
        console.error("ProductGrid failed to fetch products:", err);
        if (!cancelled) setDbProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, [staticItems, categoryFilter, subCategoryFilter, detailBasePath]);

  // Fetch subcategories when category selection changes
  useEffect(() => {
    if (staticItems || categoryFilter) return;

    const parentId = selectedCategory !== "all" ? selectedCategory : null;
    if (!parentId) {
      setSubCategories([]);
      return;
    }

    const fetchSubs = async () => {
      const { data: subs } = await supabase
        .from("subcategories")
        .select("id, sub_category_name")
        .eq("category_id", parentId)
        .eq("status", "active")
        .order("sub_category_name");
      setSubCategories((subs || []).map((s) => ({ id: s.id, name: s.sub_category_name })));
    };

    fetchSubs();
  }, [staticItems, categoryFilter, selectedCategory]);

  // Fetch subcategories for single-category pages
  useEffect(() => {
    if (staticItems || !categoryFilter || categories.length === 0) return;

    const match = categories.find((c) =>
      c.name.toLowerCase().includes(categoryFilter.toLowerCase())
    );
    if (!match) return;

    const fetchSubs = async () => {
      const { data: subs } = await supabase
        .from("subcategories")
        .select("id, sub_category_name")
        .eq("category_id", match.id)
        .eq("status", "active")
        .order("sub_category_name");
      setSubCategories((subs || []).map((s) => ({ id: s.id, name: s.sub_category_name })));
    };

    fetchSubs();
  }, [staticItems, categoryFilter, categories]);

  const items = staticItems || dbProducts;

  // Apply category filter (combined products page)
  const filteredByCategory = useMemo(() => {
    if (categoryFilter || selectedCategory === "all" || staticItems) return items;
    const catName = categories.find((c) => c.id === selectedCategory)?.name;
    if (!catName) return items;
    return items.filter((item) => item.categoryName === catName);
  }, [items, selectedCategory, categories, categoryFilter, staticItems]);

  // Apply subcategory filter
  const filteredBySubCat = useMemo(() => {
    if (selectedSubCategory === "all" || staticItems) return filteredByCategory;
    const subName = subCategories.find((s) => s.id === selectedSubCategory)?.name;
    if (!subName) return filteredByCategory;
    return filteredByCategory.filter((item) => item.subCategoryName === subName);
  }, [filteredByCategory, selectedSubCategory, subCategories, staticItems]);

  // Apply sorting
  const sortedItems = useMemo(() => {
    const arr = [...filteredBySubCat];
    switch (sort) {
      case "newest":
        return arr.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      case "name":
        return arr.sort((a, b) => a.name.localeCompare(b.name));
      case "popular":
      default:
        return arr; // DB order
    }
  }, [filteredBySubCat, sort]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [sort, selectedSubCategory, selectedCategory]);

  useEffect(() => {
    setSelectedSubCategory("all");
  }, [selectedCategory]);

  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
  const paginatedItems = sortedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <section className="container py-10 md:py-14">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h2 className="font-display text-[46px] text-foreground mb-2 leading-tight">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground max-w-md">{description}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 flex-wrap justify-end">
          {!staticItems && !categoryFilter && categories.length > 1 && (
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Type:</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[140px] h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {!staticItems && subCategories.length > 0 && (
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Subcategory:</label>
              <Select value={selectedSubCategory} onValueChange={setSelectedSubCategory}>
                <SelectTrigger className="w-[160px] h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {subCategories.map((sub) => (
                    <SelectItem key={sub.id} value={sub.id}>
                      {sub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Sort By:</label>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-[140px] h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Popular</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="aspect-square rounded-lg mb-3" />
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      ) : sortedItems.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {paginatedItems.map((item) => (
            <div key={item.id} className="group">
              <div className="aspect-square overflow-hidden rounded-lg mb-3 relative bg-muted">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                {item.isNew && (
                  <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-sm">
                    New Arrival
                  </Badge>
                )}
              </div>
              <h3 className="font-display text-sm font-semibold text-foreground mb-2">
                {item.name}
              </h3>
              <Link
                to={item.detailPath}
                className="block text-center text-xs border border-border rounded-sm py-2 hover:bg-muted transition-colors"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="text-sm text-muted-foreground disabled:opacity-40"
          >
            Prev
          </button>
          {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`h-8 w-8 rounded-full text-sm font-medium ${currentPage === page
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-muted"
                }`}
            >
              {page}
            </button>
          ))}
          {totalPages > 3 && <span className="text-muted-foreground">...</span>}
          {totalPages > 3 && (
            <button
              onClick={() => setCurrentPage(totalPages)}
              className={`h-8 w-8 rounded-full text-sm font-medium ${currentPage === totalPages
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-muted"
                }`}
            >
              {totalPages}
            </button>
          )}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="text-sm text-muted-foreground disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}

/** Products created within the last 30 days are "New" */
function isNewProduct(createdAt: string): boolean {
  const created = new Date(createdAt);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return created > thirtyDaysAgo;
}
