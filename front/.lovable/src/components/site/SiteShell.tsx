import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { WhatsAppButton } from "./WhatsAppButton";

/** Public website chrome: navbar, footer and floating WhatsApp button. */
/** `raiseWhatsapp` lifts the floating button above a mobile sticky action bar. */
export function SiteShell({ children, raiseWhatsapp = false }: { children: ReactNode; raiseWhatsapp?: boolean }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton raised={raiseWhatsapp} />
    </div>
  );
}
