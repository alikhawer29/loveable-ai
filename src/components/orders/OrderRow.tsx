import type { Order } from "@/types";
import { Badge } from "@/components/ui/badge";

interface OrderRowProps {
  order: Order;
}

export function OrderRow({ order }: OrderRowProps) {
  return (
    <tr className="border-b border-border hover:bg-muted/30 transition-colors">
      <td className="py-3 px-4 text-sm font-medium text-foreground">{order.id}</td>
      <td className="py-3 px-4">
        <div>
          <p className="text-sm font-medium text-foreground">{order.customerName}</p>
          <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
        </div>
      </td>
      <td className="py-3 px-4 text-sm text-muted-foreground hidden md:table-cell">
        {order.items.map((i) => i.productName).join(", ")}
      </td>
      <td className="py-3 px-4 text-sm font-display font-semibold text-foreground">${order.total}</td>
      <td className="py-3 px-4">
        <Badge variant="secondary" className="text-xs">
          {order.status}
        </Badge>
      </td>
      <td className="py-3 px-4 text-sm text-muted-foreground hidden lg:table-cell">{order.date}</td>
    </tr>
  );
}
