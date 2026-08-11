# Deployment policy

Production deployments for this project use **Render only**, through the
`andergo-web` service in `render.yaml`.

Do not run Vercel commands, use the `.vercel` project link, publish previews,
inspect Vercel deployments, or alter Vercel configuration unless the user gives
an explicit approval in the current request that names **Vercel** and authorizes
that specific action. A past approval never carries forward.

Before any deployment, report the intended target and wait for the user's
explicit request to deploy. Do not infer permission from code changes.
