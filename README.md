# Clone Satta King Website (Next.js frontend)

The original design is available at https://www.figma.com/design/XFHFR3KmTbdeLxal2ACZQp/Clone-Satta-King-Website.

This is a [Next.js](https://nextjs.org) (App Router) frontend for the Satta-Samrat site,
built with Tailwind CSS v4.

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server on http://localhost:3000.

Other scripts:

- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run typecheck` — run TypeScript checks

## Backend

The frontend expects the Express API (see `../backend`) at `https://sattabackend-production.up.railway.app`. Override with `NEXT_PUBLIC_API_URL` (e.g. `http://localhost:5000` for local development) — set it in `.env.local` or at build time.
To point it somewhere else, set `NEXT_PUBLIC_API_URL` before running/building:

```sh
NEXT_PUBLIC_API_URL=https://api.example.com npm run dev
```
