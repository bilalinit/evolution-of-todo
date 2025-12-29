# Next.js App Router Structure (Strict Mode)

Running `npx create-next-app@latest` with strict flags produces:

```
frontend/
├── src/                # Source directory (Enforced)
│   └── app/            # App Router
│       ├── favicon.ico
│       ├── globals.css
│       ├── layout.tsx
│       └── page.tsx
├── public/
├── .eslintrc.json
├── .gitignore
├── next-env.d.ts
├── next.config.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── README.md
├── tailwind.config.ts
└── tsconfig.json
```

## Key Differences from Defaults
1.  **`src/` Directory**: All code lives inside `src/`.
2.  **No Import Alias**: Imports use relative paths (e.g., `../../components/Button`) or strict `src/` references if configured manually later.
3.  **Strict Config Files**: `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs` are all at root.
4.  **No React Compiler**: Default React behavior.
