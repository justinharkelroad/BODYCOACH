# BODYCOACH Repository Instructions

These instructions are durable requirements for work in this repository.

## Verification gates

The baseline below was measured at
`b6ab3bb89ef9935051449989b6a92f367ef3982d` on 2026-08-01.

| Command | Measured result | Requirement |
|---|---|---|
| `npx tsc --noEmit` | Exit 0 in the environment-free writable clone | Hard gate. It must remain exit 0. |
| `npm run lint` | Exit 1 with 44 errors, 49 warnings, and 93 total problems in both the primary checkout and environment-free writable clone | Differential gate. Add no error or warning versus this baseline, and leave zero findings in every touched file. |
| `NEXT_TELEMETRY_DISABLED=1 npm run build` | Exit 0 with the full route table in both the populated primary checkout and environment-free writable clone | Hard gate. It must complete successfully. |

A partial command capture is not a result. A lint result is valid only after
ESLint completes; prefer JSON output such as
`npx eslint --format json --output-file <file>` and read the complete report.
A build result is valid only after it prints the route table or a terminal
error. `Compiled successfully` is an intermediate stage.

This repository has no test script, installed test runner, or automated test
suite. Never report that tests passed. State that no test suite exists and name
the typecheck, lint, build, or targeted verification that actually ran.

## Trace build environment impact

Trace a build command's environment and network impact through source before
running it. Do not run a command whose blast radius has not been established.
Set `NEXT_TELEMETRY_DISABLED=1` for local builds.

This repository tracks no environment files. Do not add a placeholder
`.env.local` to make a build pass. An environment-free clone build is a
compile and typecheck gate, not proof that its artifact matches production:
`NEXT_PUBLIC_*` values are inlined at build time, so configured production
values and source fallbacks can produce different artifacts.

## API route authorization

`src/proxy.ts` excludes `api/` from its matcher, and route-group layouts do
not protect route handlers. Every route under `src/app/api/` is responsible
for its own authorization decision. Read each handler and verify any required
authentication or signature check; never infer API authorization from the
proxy or a layout.

## Staging and secrets

Stage only explicit paths that belong to the authorized scope. Never use
`git add -A`, `git add .`, or `git commit -a`; unrelated work may be
present in another checkout.

Never read, print, copy, link, stage, or commit secret values or an untracked
environment file. Refer to a credential only by its key name or source
location.

## Production and commit boundaries

Vercel deployment records confirm that the `standardnutrition` project uses
Git integration and treats `main` as its production branch. A push to
`main` is a production deploy. Push and production-deploy authority are the
same action in this repository and require explicit Justin or Mary
authorization. Commit permission does not authorize either action.

`vercel.json` also deploys a daily 12:00 UTC cron for
`/api/cron/send-checkin-emails`. A change to that schedule or handler changes
automated client communication in production and stays inside the same human
production gate.

If a later commit is separately authorized, use the repository-configured
identity and include these trailers in this order:

```text
Co-authored-by: Justin <justin@triumphfw.com>
Signed-off-by: Justin <justin@triumphfw.com>
```
