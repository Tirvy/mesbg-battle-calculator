# ME SBG Battle Calculator

Wholly made with AI. Beside this string. Hmmm.. now that I think about it shoud've written this with AI also.

This repository contains a single-page Svelte + TypeScript application scaffold and engine stubs for a Middle Earth Strategy Battle Game probability calculator.
Quick commands:

Install dependencies:
```powershell
npm install
```
Run dev server:

```powershell
npm run dev
```
Run tests:

```powershell
npm run test
```
Notes:

- This is an initial workspace scaffold. The engine contains Monte Carlo and Exact stubs; Exact will reject inputs with total attacks &gt; 15 per requirements. Full exact algorithm and full rule implementation to follow.

````
**Publishing to GitHub Pages**

You can publish this Vite + Svelte app to GitHub Pages either quickly with the `gh-pages` package or automatically via GitHub Actions.

- **Prepare the app base path**: if the site will be served under `https://<user>.github.io/<repo>/`, set the `base` option in `vite.config.mjs` to the repository name, e.g.:

```js
// vite.config.mjs
import { defineConfig } from 'vite';
export default defineConfig({
	base: '/REPO_NAME/', // replace REPO_NAME with your repo
});
```

- **Option A — Quick deploy with `gh-pages`**

1. Install `gh-pages` as a dev dependency:

```bash
npm install --save-dev gh-pages
```

2. Add scripts to `package.json`:

```json
"scripts": {
	"build": "vite build",
	"predeploy": "npm run build",
	"deploy": "gh-pages -d dist"
}
```

3. Build and deploy:

```bash
npm run deploy
```

4. In your repository Settings → Pages, ensure the site is served from the `gh-pages` branch (the `gh-pages` action will create/update this branch).

- **Option B — Automatic deploy with GitHub Actions**

Create a workflow file at `.github/workflows/deploy.yml` with the following contents to build and publish on `push` to `main` (adjust branch as needed):

```yaml
name: Build and Deploy
on:
	push:
		branches: [ main ]
jobs:
	build-and-deploy:
		runs-on: ubuntu-latest
		steps:
			- uses: actions/checkout@v4
			- uses: actions/setup-node@v4
				with:
					node-version: '18'
			- run: npm ci
			- run: npm run build
			- uses: peaceiris/actions-gh-pages@v3
				with:
					github_token: ${{ secrets.GITHUB_TOKEN }}
					publish_dir: ./dist
```

Notes:
- Replace `REPO_NAME` in the `vite.config.mjs` example with your repository name when hosting under `<user>.github.io/<repo>`. If you use a user/organization page (username.github.io), set `base` to `/` or omit it.
- The `gh-pages` approach is quick for manual deploys; the GitHub Actions workflow is recommended for continuous deployment on pushes.
