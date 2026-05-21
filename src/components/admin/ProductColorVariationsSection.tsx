import { useRef } from "react";
import { Upload, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  PRODUCT_COLOR_OPTIONS,
  type ColorVariantFormState,
  type ProductColorHex,
} from "@/lib/product-color-variants";

interface ProductColorVariationsSectionProps {
  hasColorVariations: boolean;
  onHasColorVariationsChange: (value: boolean) => void;
  variants: ColorVariantFormState[];
  onVariantsChange: (variants: ColorVariantFormState[]) => void;
  error?: string;
}

export function ProductColorVariationsSection({
  hasColorVariations,
  onHasColorVariationsChange,
  variants,
  onVariantsChange,
  error,
}: ProductColorVariationsSectionProps) {
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const updateVariant = (hex: ProductColorHex, patch: Partial<ColorVariantFormState>) => {
    onVariantsChange(
      variants.map((v) => (v.colorHex === hex ? { ...v, ...patch } : v))
    );
  };

  const toggleColor = (hex: ProductColorHex, checked: boolean) => {
    const next = variants.map((v) => {
      if (v.colorHex !== hex) return v;
      return {
        ...v,
        selected: checked,
        isDefault: checked ? v.isDefault : false,
      };
    });
    const selected = next.filter((v) => v.selected);
    if (checked && selected.filter((v) => v.isDefault).length === 0) {
      onVariantsChange(next.map((v) => (v.colorHex === hex ? { ...v, isDefault: true } : v)));
      return;
    }
    if (!checked) {
      const remaining = next.filter((v) => v.selected);
      if (remaining.length === 1 && !remaining[0].isDefault) {
        onVariantsChange(
          next.map((v) =>
            v.colorHex === remaining[0].colorHex ? { ...v, isDefault: true } : v
          )
        );
        return;
      }
    }
    onVariantsChange(next);
  };

  const setDefault = (hex: ProductColorHex) => {
    onVariantsChange(
      variants.map((v) => ({
        ...v,
        isDefault: v.colorHex === hex && v.selected,
      }))
    );
  };

  const handleFiles = (hex: ProductColorHex, files: FileList | null) => {
    if (!files?.length) return;
    const variant = variants.find((v) => v.colorHex === hex)!;
    const max = 5;
    const total = variant.imageUrls.length + variant.pendingFiles.length;
    const added: File[] = [];
    const previews: string[] = [];
    Array.from(files).forEach((file) => {
      if (total + added.length < max) {
        added.push(file);
        previews.push(URL.createObjectURL(file));
      }
    });
    updateVariant(hex, {
      pendingFiles: [...variant.pendingFiles, ...added],
      pendingPreviews: [...variant.pendingPreviews, ...previews],
    });
  };

  const removePending = (hex: ProductColorHex, idx: number) => {
    const variant = variants.find((v) => v.colorHex === hex)!;
    updateVariant(hex, {
      pendingFiles: variant.pendingFiles.filter((_, i) => i !== idx),
      pendingPreviews: variant.pendingPreviews.filter((_, i) => i !== idx),
    });
  };

  const removeExisting = (hex: ProductColorHex, idx: number) => {
    const variant = variants.find((v) => v.colorHex === hex)!;
    updateVariant(hex, {
      imageUrls: variant.imageUrls.filter((_, i) => i !== idx),
    });
  };

  return (
    <div className="space-y-4 pt-2 border-t border-border">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">Color Variations</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            This product has color variations
          </p>
        </div>
        <Switch
          checked={hasColorVariations}
          onCheckedChange={(checked) => {
            onHasColorVariationsChange(checked);
            if (checked) {
              const selected = variants.filter((v) => v.selected);
              if (selected.length > 0 && !selected.some((v) => v.isDefault)) {
                const first = selected[0];
                onVariantsChange(
                  variants.map((v) =>
                    v.colorHex === first.colorHex ? { ...v, isDefault: true } : v
                  )
                );
              }
            }
          }}
        />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {hasColorVariations && (
        <div className="space-y-6">
          <div>
            <p className="text-xs text-muted-foreground mb-3">
              Select which colors apply (1–4). Upload images per color and mark one as default.
            </p>
            <div className="flex flex-wrap gap-4">
              {PRODUCT_COLOR_OPTIONS.map((opt) => {
                const variant = variants.find((v) => v.colorHex === opt.hex)!;
                const isLight = opt.hex === "#ffffff" || opt.hex === "#ede8d0";
                return (
                  <label
                    key={opt.hex}
                    className="flex flex-col items-center gap-2 cursor-pointer"
                  >
                    <span
                      className={`h-10 w-10 rounded-full border-2 transition-all ${
                        variant.selected
                          ? "ring-2 ring-offset-2 ring-foreground border-foreground"
                          : "border-border opacity-60"
                      }`}
                      style={{
                        backgroundColor: opt.hex,
                        boxShadow: isLight ? "inset 0 0 0 1px rgba(0,0,0,0.12)" : undefined,
                      }}
                    />
                    <span className="text-xs text-muted-foreground">{opt.defaultLabel}</span>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={variant.selected}
                      onChange={(e) => toggleColor(opt.hex, e.target.checked)}
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {variants
            .filter((v) => v.selected)
            .map((variant) => {
              const opt = PRODUCT_COLOR_OPTIONS.find((c) => c.hex === variant.colorHex)!;
              const isLight =
                variant.colorHex === "#ffffff" || variant.colorHex === "#ede8d0";
              return (
                <div
                  key={variant.colorHex}
                  className="rounded-lg border border-border p-4 space-y-3 bg-muted/20"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-8 w-8 rounded-full border border-border flex-shrink-0"
                      style={{
                        backgroundColor: variant.colorHex,
                        boxShadow: isLight
                          ? "inset 0 0 0 1px rgba(0,0,0,0.12)"
                          : undefined,
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <label className="text-xs text-muted-foreground">Color name (optional)</label>
                      <Input
                        value={variant.colorLabel}
                        onChange={(e) =>
                          updateVariant(variant.colorHex, { colorLabel: e.target.value })
                        }
                        placeholder={opt.defaultLabel}
                        className="h-8 mt-0.5"
                      />
                    </div>
                    <label className="flex items-center gap-2 text-xs whitespace-nowrap cursor-pointer">
                      <input
                        type="radio"
                        name="defaultColor"
                        checked={variant.isDefault}
                        onChange={() => setDefault(variant.colorHex)}
                        className="accent-primary"
                      />
                      Default
                    </label>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">
                      Stock for this color (optional)
                    </label>
                    <Input
                      type="number"
                      min={0}
                      value={variant.stock}
                      onChange={(e) =>
                        updateVariant(variant.colorHex, { stock: e.target.value })
                      }
                      placeholder="e.g. 50"
                      className="h-8 max-w-[140px]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-foreground block mb-2">
                      Upload images for this color
                    </label>
                    <div className="flex gap-2 flex-wrap mb-2">
                      {variant.imageUrls.map((url, idx) => (
                        <div
                          key={`ex-${idx}`}
                          className="relative h-20 w-20 rounded-lg overflow-hidden border border-border"
                        >
                          <img src={url} alt="" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeExisting(variant.colorHex, idx)}
                            className="absolute top-0.5 right-0.5 h-5 w-5 bg-destructive rounded-sm flex items-center justify-center text-destructive-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      {variant.pendingPreviews.map((url, idx) => (
                        <div
                          key={`new-${idx}`}
                          className="relative h-20 w-20 rounded-lg overflow-hidden border border-border"
                        >
                          <img src={url} alt="" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removePending(variant.colorHex, idx)}
                            className="absolute top-0.5 right-0.5 h-5 w-5 bg-destructive rounded-sm flex items-center justify-center text-destructive-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileRefs.current[variant.colorHex]?.click()}
                      className="w-full border border-dashed border-border rounded-lg py-5 flex flex-col items-center gap-1.5 text-muted-foreground hover:border-primary/50 transition-colors text-xs"
                    >
                      <Upload className="h-5 w-5" />
                      <span>Upload up to 5 images for {opt.defaultLabel}</span>
                    </button>
                    <input
                      ref={(el) => {
                        fileRefs.current[variant.colorHex] = el;
                      }}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        handleFiles(variant.colorHex, e.target.files);
                        e.target.value = "";
                      }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
