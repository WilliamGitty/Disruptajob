import { Badge } from "@/components/ui/badge";
import type { InviteStatus } from "@/types";

const STATUS: Record<
  InviteStatus,
  { label: string; variant: "default" | "accent" | "evidence" | "outline" }
> = {
  sent: { label: "Sent", variant: "accent" },
  viewed: { label: "Viewed", variant: "default" },
  accepted: { label: "Accepted", variant: "evidence" },
  declined: { label: "Declined", variant: "outline" },
};

export function InviteStatusBadge({ status }: { status: InviteStatus }) {
  const s = STATUS[status];
  return <Badge variant={s.variant}>{s.label}</Badge>;
}
