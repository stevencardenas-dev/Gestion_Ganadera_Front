# Troubleshooting Guide: Fixing "Blank Page" on GitHub Pages (Vite + React)

This guide documents the root causes and solutions for the common blank page issue when deploying a Vite-based React application to GitHub Pages.

## 🚀 Quick Fix Checklist
1. **Router**: Switch from `BrowserRouter` to `HashRouter`.
2. **Vite Config**: Set `base: './'` in `vite.config.js`.
3. **Workflow**: Ensure `.github/workflows/deploy.yml` runs `npm run build` and deploys the `dist` folder.

---

## 🔍 Detailed Analysis

### 1. The Routing Problem (Subpath Issue)
**Symptom:** The site loads, but the `#root` element is empty.
**Cause:** GitHub Pages hosts apps on a subpath (e.g., `/my-repo/`). `BrowserRouter` expects the app to be at the domain root (`/`). When it sees `/my-repo/`, it doesn't match any of your routes (like `/` or `/dashboard`) and renders nothing.
**Fix:** 
- **Option A (Recommended)**: Use `HashRouter`. It uses the URL hash (e.g., `/#/dashboard`) which the server ignores, making routing independent of the subpath.
- **Option B**: Set a `basename` on `BrowserRouter`, but this requires matching the repo name exactly and can be fragile.

### 2. The Asset Path Problem
**Symptom:** Console errors like `404 Not Found` for `.js` or `.css` files.
**Cause:** By default, Vite uses absolute paths (`/assets/...`). On GitHub Pages, this tries to find assets at `username.github.io/assets/` instead of `username.github.io/my-repo/assets/`.
**Fix:** Update `vite.config.js`:
```javascript
export default defineConfig({
  base: './', // Use relative paths for assets
})
```

### 3. The Deployment Workflow Failure
**Symptom:** The deployed site shows a "test" version or a black screen with unexpected errors.
**Cause:** The GitHub Actions workflow (`deploy.yml`) might be misconfigured to skip the build step or serve static files from `public/` instead of the compiled `dist/` folder.
**Fix:** Ensure your `.github/workflows/deploy.yml` includes:
```yaml
- name: Install dependencies
  run: cd frontend && npm install
- name: Build
  run: cd frontend && npm run build
- name: Upload artifact
  uses: actions/upload-pages-artifact@v3
  with:
    path: frontend/dist
```

### 4. Common "Dummy File" Pitfall
**Symptom:** Scripts like `babel.min.js` appear in the network tab.
**Cause:** Developers sometimes use a static `index.html` with in-browser Babel as a workaround for build failures. This is slow, prone to syntax errors, and not suitable for production.
**Fix:** Always ensure the build pipeline is working and serving the output of `npm run build`.

---

## 🛠️ How to Test
1. **Local Test**: Run `npm run build` and then `npx serve dist` to see if the production build works locally.
2. **Deployment Test**: Check the "Actions" tab on GitHub to ensure the workflow finished without errors.
3. **Browser Console**: Open DevTools (F12) and check for red error messages. If you see `404` for assets, check your `base` config.
