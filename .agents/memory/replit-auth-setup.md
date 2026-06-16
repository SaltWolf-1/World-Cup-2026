---
name: Replit Auth web-only setup
description: Steps and gotchas for integrating Replit Auth in this pnpm monorepo (web-only, no mobile).
---

# Replit Auth — Web-Only Setup Notes

## What was done
1. Copied auth schema to `lib/db/src/schema/auth.ts`, exported from barrel
2. Pushed schema with `pnpm --filter @workspace/db run push`
3. Copied server files: `lib/auth.ts`, `middlewares/authMiddleware.ts`, `routes/auth.ts`
4. Installed `openid-client cookie-parser @types/cookie-parser` in API server
5. Updated `app.ts`: added `cookieParser()`, `cors({credentials:true,origin:true})`, `authMiddleware`
6. Mounted `authRouter` in `routes/index.ts`
7. Copied `lib/replit-auth-web/` (provides `useAuth()` hook)
8. Added `@workspace/replit-auth-web: workspace:*` to worldcup package.json
9. Added references to tsconfig.json (root) and worldcup tsconfig.json
10. Added OpenAPI paths (/auth/user, /login, /logout) + schemas (AuthUser, AuthUserEnvelope)
11. Ran codegen
12. Added `/profile` route and page + auth UI in sidebar/drawer

## Mobile routes removed
The auth.ts template includes mobile token exchange routes. Since this is web-only:
- Remove `ExchangeMobileAuthorizationCodeBody`, `ExchangeMobileAuthorizationCodeResponse`, `LogoutMobileSessionResponse` imports from `routes/auth.ts`
- Remove the two `/mobile-auth/*` route handlers
- Do NOT add mobile schemas to OpenAPI spec

## replit-auth-web tsconfig fix
The `use-auth.ts` uses `import.meta.env.BASE_URL`. The lib doesn't have vite as a dep, so add a local `src/vite-env.d.ts` that declares the ImportMeta interface.

**Why:** Template is designed for both web+mobile; web-only projects only need the browser OIDC flow.
