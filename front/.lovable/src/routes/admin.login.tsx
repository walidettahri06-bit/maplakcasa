import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LockKeyhole } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { loginAdmin } from "@/services/admin-auth.service";
import { queryKeys } from "@/services/queries";
import { useI18n } from "@/i18n/I18nProvider";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { adminHead } from "@/components/admin/core";
export const Route = createFileRoute("/admin/login")({ component: AdminLogin, head: () => adminHead("Connexion administrateur") });
function AdminLogin() {
  const { t, dir } = useI18n(); const navigate = useNavigate(); const qc = useQueryClient();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const mutation = useMutation({ mutationFn: () => loginAdmin(email, password), onSuccess: async user => { qc.setQueryData(queryKeys.adminMe, user); await navigate({ to: "/admin" }); }, onError: () => undefined });
  return <main dir={dir} className="flex min-h-screen items-center justify-center bg-background px-4 py-10"><div className="w-full max-w-md">
    <div className="mb-8 flex items-center justify-between"><Logo /><LanguageSwitcher /></div>
    <section className="rounded-2xl border bg-card p-7 shadow-card sm:p-9"><div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><LockKeyhole /></div>
      <h1 className="font-display text-2xl font-bold">{t("admin.loginTitle")}</h1><p className="mt-2 text-sm text-muted-foreground">{t("admin.loginSubtitle")}</p>
      <form className="mt-7 space-y-5" onSubmit={e => { e.preventDefault(); mutation.mutate(); }}>
        <div className="space-y-2"><Label htmlFor="admin-email">{t("admin.email")}</Label><Input id="admin-email" type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} /></div>
        <div className="space-y-2"><Label htmlFor="admin-password">{t("admin.password")}</Label><Input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} /></div>
        {mutation.isError && <p role="alert" className="text-sm text-destructive">{t("admin.loginError")}</p>}
        <Button className="w-full" type="submit" disabled={mutation.isPending}>{mutation.isPending ? t("admin.loggingIn") : t("admin.loginAction")}</Button>
      </form>
    </section>
  </div></main>;
}
