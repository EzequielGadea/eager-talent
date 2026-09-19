# Project conventions

These reflect how this codebase is actually built today. Follow them for new code; when you touch existing code that doesn't match, prefer matching the surrounding file over a drive-by rewrite.

## Server vs. Client Components

- Default to Server Components. Only add `"use client"` when the component actually needs interactivity — state, effects, event handlers, `useMutation`, hooks like `useRouter`/`useTransition`.
- Server Components read the session directly with `auth.api.getSession({ headers: await headers() })` (`~/lib/auth`) and fetch data directly with the tRPC **server caller** (`~/lib/trpc/server`), e.g. `await api.toDoItem.list()`. No hooks, no loading state — just `await`.
- Client Components never call the server caller or `auth.api` directly. They mutate/query through the tRPC **React** client (`~/lib/trpc/react`, e.g. `api.toDoItem.create.useMutation()`) and drive auth flows through `authClient` (`~/lib/auth/client`, from `better-auth/react`).
- Each async, data-fetching Server Component that lives in a route's `_components/` folder is wrapped in its own `<Suspense fallback={<Loading />}>` at the `page.tsx` level (see `dashboard/page.tsx`), so independent sections stream in on their own instead of blocking the whole page on the slowest fetch.
- Route protection is handled in `src/proxy.ts` (this Next.js version renamed `middleware.ts` → `proxy.ts` — see the breaking-changes note above), using `getSessionCookie` from `better-auth/cookies` plus `authRoutes`/`publicRoutes` allow-lists and an exported `matcher` config. Don't create a `middleware.ts`.

## tRPC

- Never query `prisma`/`ctx.db` directly outside of a tRPC procedure. Server Components go through the `api` server caller too, not straight through `~/lib/prisma`.
- Routers live under `src/server/api/routers/<router-name>/`, one file per procedure, kebab-case (e.g. `list-by-author.ts`, `count-by-author.ts`, `create.ts`), each exporting a single named `protectedProcedure`/`publicProcedure` chain.
- That folder's `index.ts` imports every procedure, re-exports each individually, and assembles the router with `createTRPCRouter({ ... })`. The key exposed to callers doesn't have to match the export/file name when the export name documents an implementation detail (e.g. `listByAuthor` is exposed as `list`).
- Register each feature router on `appRouter` in `src/server/api/root.ts`.
- Use `protectedProcedure` for anything scoped to the current user (it throws `UNAUTHORIZED` when there's no session); reach for `publicProcedure` only for genuinely public data.
- Always validate mutation/query input with a `zod` schema passed to `.input()`. On the client, reuse the same schema shape for the RHF `zodResolver` so client and server validation stay in sync.

## shadcn/ui components

- UI primitives are installed via the shadcn CLI into `src/components/ui/*.tsx` (style `base-nova`, base color `neutral`, icons from `lucide-react`), filenames kebab-case. There is no `~/app/_components/*` anymore — all shared UI primitives live under `~/components/ui/*`.
- Built on `@base-ui/react/*` primitives, variants via `class-variance-authority` (`cva`), and class merging via `cn()` from `~/lib/utils`. Extend a primitive through its `variant`/`size` slots and `className`, not by hand-editing its internal class strings.
- Compound components (`Dialog`, `Toast`) export each sub-part as a named export (`DialogTrigger`, `DialogContent`, `DialogHeader`, ...) and compose a trigger via the `render` prop (`<DialogTrigger render={<Button>...</Button>} />`), not children-as-trigger.

## Feature components

- Route-specific components are colocated in a `_components/` folder inside their route segment (`src/app/(group)/route/_components/`), kebab-case filenames — never in the shared `~/components` tree.
- Plain data-display Server Components (`items-list.tsx`, `dashboard-header.tsx`, `profile-details.tsx`) are `async function`s with no `"use client"`; they fetch their own data instead of receiving it as props.
- Interactive pieces (dialogs, forms, buttons that trigger mutations or client state) are `"use client"` and live next to their server sibling in the same `_components/` folder.
- `page.tsx`/`layout.tsx` use default exports (a Next.js requirement); most other components use named exports.

## Forms & mutations

- Forms use `react-hook-form` (`useForm`) with `zodResolver` from `@hookform/resolvers/zod`, validating against a `zod` schema declared next to the component.
- Field errors render through the shared `Input` component's `errorMessage` prop (`errors.<field>?.message`); a request-level failure that isn't tied to one field uses `setError("root", { message })` and a manual `errors.root` message block (see the login form).
- Mutations go through `api.<router>.<procedure>.useMutation()` (`~/lib/trpc/react`):
  - `onError` shows `toast.add({ title: error.message, type: "error" })` (`~/components/ui/toast`).
  - `onSuccess` runs its "after success" side effects (closing a dialog, `router.refresh()`) inside `startTransition` from `useTransition`. The submit button's `disabled` state and label account for both the mutation's `isPending` and the transition's pending flag. This keeps the current UI (e.g. an open dialog) on screen until the refreshed Server Component data has actually streamed in, instead of closing/flashing before the new data is visible.
- Non-tRPC submissions (e.g. `better-auth` sign-in/sign-out via `authClient`) follow the same shape: RHF `handleSubmit` wraps an async handler that awaits the client SDK call and routes success/failure explicitly (`router.push(...)` / `setError("root", ...)`).
- Format dates with `date-fns` (e.g. `format(item.createdAt, "d/M/yyyy")`) going forward, rather than `Intl`/`toLocaleString`.
