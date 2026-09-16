import { Globe, Send, Users, X } from "lucide-react";

export function getSourceIcon(sourceText: string) {
  switch (sourceText) {
    case "Inbound":
      return <Globe size={14} className="text-dashboard-text-muted" />;
    case "Outbound":
      return <Send size={14} className="text-dashboard-text-muted" />;
    case "Referral":
      return <Users size={14} className="text-dashboard-text-muted" />;
    default:
      return <X size={14} className="text-dashboard-text-muted" />;
  }
}
