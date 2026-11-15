<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules
- Frontend only for now: all data goes through `src/services/*.service.ts` (mock async calls over `mockDb`); swap these for Axios calls to the future Laravel REST API without changing component code.
- Prices and fees come only from `src/data/services.ts`, `src/config/business.ts` and `calculateTotals` in `src/lib/pricing.ts`; never hardcode amounts in components.
- All UI text lives in `src/i18n/locales/{fr,ar}/*.json` and is read with `useI18n().t("namespace.key")`; French is the default, Arabic flips the layout to RTL, so use logical Tailwind classes (ms/me/ps/pe/start/end).
- Public pages wrap content in `SiteShell`; admin pages live under the `/admin` layout route.
- Real documents are never uploaded or stored: uploads stay as in-browser previews, admin uses CSS dummy documents.
