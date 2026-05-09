# Agent Documentation & Implementation Notes

## Architecture Overview
- **Backend**: NestJS + Prisma v7.
  - **Prisma v7 Fixes**: The `url` has been moved from `schema.prisma` to `prisma.config.ts`. The `PrismaClient` is generated to `src/generated/prisma`. `PrismaService` uses `@prisma/adapter-pg` with a `pg` Pool for manual connection management as required by v7.
  - **Modules**: Feature-based (Auth, Members, Meals, Expenses, Payments).
  - **Error Handling**: Global filter in `src/common/filters`.
  - **Consistency**: Response interceptor in `src/common/interceptors`.

- **Frontend**: Next.js (App Router) + Tailwind 4.
  - **UI System**: Custom-built shadcn components in `src/components/ui`.
  - **RTL/Urdu**: The app is `dir="rtl"` with `Noto_Nastaliq_Urdu` as the primary font. Layout is optimized for Urdu reading order.
  - **State**: `AuthContext` handles JWT storage and user info.
  - **API**: Axios instance with interceptors in `src/lib/api.ts`.

## Critical Instructions for AI Agents
1. **Prisma**: DO NOT add `url` back to `schema.prisma`. Update the config in `prisma.config.ts` if needed.
2. **Imports**: Import Prisma types/enums from `@/generated/prisma` (in backend) or consistent relative paths.
3. **Styling**: Use Tailwind 4 features. Avoid adding a `tailwind.config.ts` unless absolutely necessary for external tools, as Tailwind 4 is primarily CSS-first.
4. **UI consistency**: Always use the components in `@/components/ui` and follow the "Large Target" design pattern (h-12 or h-14 for buttons).

## Remaining Tasks
- [ ] Verify database connectivity once local Postgres is started.
- [ ] Implement advanced analytics on the dashboard (e.g., meal cost calculation).
- [ ] Add PDF export for monthly expense reports.
