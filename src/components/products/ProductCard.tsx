import type { Product } from "@/types";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden group shadow-card hover:shadow-elevated transition-shadow">
      <div className="aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-semibold text-foreground line-clamp-1">
            {product.name}
          </h3>
          <Badge variant="secondary" className="text-xs shrink-0">
            {product.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between pt-1">
          <span className="font-display text-lg font-bold text-foreground">${product.price}</span>
          <span className="text-xs text-muted-foreground">{product.stock} in stock</span>
        </div>
      </div>
    </div>
  );
}
