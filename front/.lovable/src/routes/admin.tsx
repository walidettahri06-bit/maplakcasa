import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  ShoppingBag,
  Files,
  Truck,
  CreditCard,
  Settings2,
  Menu,
  ArrowUpRight,
  ChevronDown,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getAdminMe, logoutAdmin } from "@/services/admin-auth.service";
import { getAdminToken } from "@/services/admin-api";
import { queryKeys, ordersQuery } from "@/services/queries";
import { useI18n } from "@/i18n/I18nProvider";
import { Logo } from "@/components/shared/Logo";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
export const Route = createFileRoute("/admin")({
  component: AdminLayout,
  head: () => ({
    meta: [
      { title: "Admin — MaPlak Casa" },
      { name: "robots", content: "noindex, nofollow" },
      {
        name: "description",
        content: "Administration des commandes, documents et livraisons MaPlak Casa.",
      },
      { property: "og:title", content: "Admin — MaPlak Casa" },
      { property: "og:description", content: "Espace de gestion MaPlak Casa, Casablanca." },
    ],
  }),
});
const nav = [
  ["overview", "/admin", LayoutDashboard],
  ["orders", "/admin/commandes", ShoppingBag],
  ["documents", "/admin/documents", Files],
  ["deliveries", "/admin/livraisons", Truck],
  ["payments", "/admin/paiements", CreditCard],
  ["services", "/admin/services", Settings2],
] as const;
function AdminLayout() {
  const { t, dir } = useI18n();
  const qc = useQueryClient();
  const pathname = useLocation({ select: (l) => l.pathname });
  const loginRoute = useLocation({ select: (l) => l.pathname === "/admin/login" });
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => { setToken(getAdminToken()); }, [pathname]);
  const me = useQuery({ queryKey: queryKeys.adminMe, queryFn: getAdminMe, enabled: !!token, retry: false });
  const { data = [] } = useQuery({ ...ordersQuery, enabled: !!token && !loginRoute });
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!loginRoute && (!token || me.isError)) void navigate({ to: "/admin/login", replace: true });
  }, [loginRoute, token, me.isError, navigate]);
  if (loginRoute) return <Outlet />;
  if (!token || me.isPending || me.isError) return <div className="grid min-h-screen place-items-center bg-background"><div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  const count = data.filter((o) => o.documents.some((d) => d.status === "pending")).length;
  const current = [...nav].reverse().find(([, path]) => pathname.startsWith(path));
  const sidebar = (
    <div className="flex h-full flex-col gap-8 bg-sidebar p-6 text-sidebar-foreground">
      <Logo tone="light" />
      <div>
        <p className="mb-4 text-xs uppercase tracking-widest text-ink-muted">
          {t("admin.workspace")}
        </p>
        <nav className="space-y-2">
          {nav.map(([key, path, Icon]) => (
            <Link
              key={key}
              to={path}
              activeOptions={{ exact: path === "/admin" }}
              activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-sidebar-accent"
              onClick={() => setOpen(false)}
            >
              <Icon className="size-4" />
              {t(`admin.nav.${key}`)}
              {key === "documents" && count > 0 && (
                <span className="ms-auto rounded-md bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  {count}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto border-t border-ink-border pt-5">
        <Link to="/" className="flex items-center justify-between text-sm text-ink-muted">
          {t("admin.viewSite")}
          <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </div>
  );
  return (
    <div dir={dir} className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 start-0 z-30 hidden w-64 border-e border-ink-border md:block">
        {sidebar}
      </aside>
      <div className="md:ps-64">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between gap-3 border-b bg-card/95 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label={t("admin.menu")}
                >
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent
                side={dir === "rtl" ? "right" : "left"}
                className="w-72 border-ink-border bg-sidebar p-0"
              >
                <SheetHeader className="sr-only">
                  <SheetTitle>{t("admin.menu")}</SheetTitle>
                </SheetHeader>
                {sidebar}
              </SheetContent>
            </Sheet>
            <span className="hidden text-sm font-medium sm:block">
              {t(`admin.nav.${current?.[0] ?? "overview"}`)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2" aria-label={t("admin.account")}>
                  <span className="flex size-8 items-center justify-center rounded-full bg-ink text-xs text-ink-foreground">
                    {me.data?.name?.slice(0, 2).toLocaleUpperCase() ?? "AD"}
                  </span>
                  <ChevronDown className="size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={async () => { await logoutAdmin(); qc.clear(); await navigate({ to: "/admin/login", replace: true }); }}
                >
                  {t("admin.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="mx-auto max-w-screen-2xl p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
