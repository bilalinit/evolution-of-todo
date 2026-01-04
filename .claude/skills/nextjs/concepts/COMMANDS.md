# Next.js CLI Commands

## Initialization
Create a new project with the latest features:
Create a new project with the specific standard configuration:
```bash
npx create-next-app@latest frontend \
  --yes \
  --no-react-compiler \
  --typescript \
  --eslint \
  --tailwind \
  --app \
  --src-dir \
  --no-import-alias
```
*Flags: TypeScript, ESLint, Tailwind, App Router, `src/` directory, no Import Alias.*

## Development
Start the development server (Defaults to localhost:3000):
```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

## Production
Build the application for production:
```bash
npm run build
```

Start the production server (after building):
```bash
npm start
```

## Linting
Run the built-in ESLint configuration:
```bash
npm run lint
```
