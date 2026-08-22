# Deployment policy

Production deployments for this project use **Vercel only**, through the
configuration in `vercel.json`.

Do not run Vercel deployment commands, publish previews, or inspect Vercel
deployments unless the user gives an explicit approval in the current request
that authorizes that specific action. A past approval never carries forward.

Before any deployment, report the intended target and wait for the user's
explicit request to deploy. Do not infer permission from code changes.
