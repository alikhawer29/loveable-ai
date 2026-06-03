import { useRef } from "react";
import { Upload, X, Plus, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  createEmptyDesignVariant,
  type DesignVariantFormState,
} from "@/lib/product-design-variants";

interface ProductDesignVariationsSectionProps {
  hasDesignVariations: boolean;
  onHasDesignVariationsChange: (value: boolean) => void;
  variants: DesignVariantFormState[];
  onVariantsChange: (variants: DesignVariantFormState[]) => void;
  error?: string;
}

export function ProductDesignVariationsSection({
  hasDesignVariations,
  onHasDesignVariationsChange,
  variants,
  onVariantsChange,
  error,
}: ProductDesignVariationsSectionProps) {
  const fileRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const updateVariant = (index: number, patch: Partial<DesignVariantFormState>) => {
    onVariantsChange(variants.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  };

  const addDesign = () => {
    const next = [...variants, createEmptyDesignVariant()];
    if (next.length === 1) {
      next[0].isDefault = true;
    }
    onVariantsChange(next);
  };

  const removeDesign = (index: number) => {
    const next = variants.filter((_, i) => i !== index);
    if (next.length > 0 && !next.some((v) => v.isDefault)) {
      next[0].isDefault = true;
    }
    onVariantsChange(next);
  };

  const setDefault = (index: number) => {
    onVariantsChange(variants.map((v, i) => ({ ...v, isDefault: i === index })));
  };

  const handleFiles = (index: number, files: FileList | null) => {
    if (!files?.length) return;
    const variant = variants[index];
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
    updateVariant(index, {
      pendingFiles: [...variant.pendingFiles, ...added],
      pendingPreviews: [...variant.pendingPreviews, ...previews],
    });
  };

  const removePending = (index: number, idx: number) => {
    const variant = variants[index];
    updateVariant(index, {
      pendingFiles: variant.pendingFiles.filter((_, i) => i !== idx),
      pendingPreviews: variant.pendingPreviews.filter((_, i) => i !== idx),
    });
  };

  const removeExisting = (index: number, idx: number) => {
    const variant = variants[index];
    updateVariant(index, {
      imageUrls: variant.imageUrls.filter((_, i) => i !== idx),
    });
  };

  return (
    <div className="space-y-4 pt-2 border-t border-border">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">Pod Design Variations</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            This product has multiple pod designs
          </p>
        </div>
        <Switch
          checked={hasDesignVariations}
          onCheckedChange={(checked) => {
            onHasDesignVariationsChange(checked);
            if (checked && variants.length === 0) {
              const first = createEmptyDesignVariant();
              first.isDefault = true;
              onVariantsChange([first]);
            }
            if (!checked) {
              onVariantsChange([]);
            }
          }}
        />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {hasDesignVariations && (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Add each pod design with a name and images. Mark one design as default.
          </p>

          {variants.map((variant, index) => (
            <div
              key={variant.id ?? `new-${index}`}
              className="rounded-lg border border-border p-4 space-y-3 bg-muted/20"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0 space-y-1">
                  <label className="text-xs text-muted-foreground">Design name*</label>
                  <Input
                    value={variant.designName}
                    onChange={(e) => updateVariant(index, { designName: e.target.value })}
                    placeholder="e.g. Classic Rose, Geometric Lines"
                    className="h-8"
                  />
                </div>
                <label className="flex items-center gap-2 text-xs whitespace-nowrap cursor-pointer pt-5">
                  <input
                    type="radio"
                    name="defaultDesign"
                    checked={variant.isDefault}
                    onChange={() => setDefault(index)}
                    className="accent-primary"
                  />
                  Default
                </label>
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDesign(index)}
                    className="mt-4 p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="Remove design"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  Stock for this design (optional)
                </label>
                <Input
                  type="number"
                  min={0}
                  value={variant.stock}
                  onChange={(e) => updateVariant(index, { stock: e.target.value })}
                  placeholder="e.g. 50"
                  className="h-8 max-w-[140px]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-2">
                  Design images*
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
                        onClick={() => removeExisting(index, idx)}
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
                        onClick={() => removePending(index, idx)}
                        className="absolute top-0.5 right-0.5 h-5 w-5 bg-destructive rounded-sm flex items-center justify-center text-destructive-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => fileRefs.current[index]?.click()}
                  className="w-full border border-dashed border-border rounded-lg py-5 flex flex-col items-center gap-1.5 text-muted-foreground hover:border-primary/50 transition-colors text-xs"
                >
                  <Upload className="h-5 w-5" />
                  <span>Upload up to 5 images for this design</span>
                </button>
                <input
                  ref={(el) => {
                    fileRefs.current[index] = el;
                  }}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    handleFiles(index, e.target.files);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" size="sm" onClick={addDesign} className="gap-2">
            <Plus className="h-4 w-4" />
            Add another design
          </Button>
        </div>
      )}
    </div>
  );
}
