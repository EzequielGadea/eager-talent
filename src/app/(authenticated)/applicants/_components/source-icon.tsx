import { Globe, Send, Users } from "lucide-react";

export function getSourceIcon(sourceText: string) {
  switch (sourceText) {
    case "Inbound":
      return <Globe size={14} className="text-text-secondary" />;
    case "Outbound":
      return <Send size={14} className="text-text-secondary" />;
    case "Referral":
      return <Users size={14} className="text-text-secondary" />;
    default:
      return null;
  }
}
