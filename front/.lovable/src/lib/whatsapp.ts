import { businessConfig } from "@/config/business";

export function whatsappUrl(message: string): string {
  return `https://wa.me/${businessConfig.whatsappNumber}?text=${encodeURIComponent(message.slice(0, 500))}`;
}
