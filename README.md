<div align="center">

# splitly

Split bills with friends. No login. Just a shareable link.

[![CI](https://github.com/drivanta/splitly/actions/workflows/ci.yml/badge.svg)](https://github.com/drivanta/splitly/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-00D4AA.svg)](./LICENSE)

</div>

splitly is a mobile-first bill-splitting web app. Create a group, share a link, log expenses, and get a settlement plan that clears every debt in the fewest transfers. No accounts. No data behind a login wall. The link is the access.

## Installation

Requirements: Node.js 20+, npm. macOS users may need Xcode command line tools for the `better-sqlite3` native build (`xcode-select --install`).

```bash
git clone https://github.com/drivanta/splitly.git
cd splitly
npm install
cp .env.example .env
npm run dev
```

The app starts on http://localhost:3000. The SQLite file is created on first write under `./data/splitly.db` by default. Override with `SPLITLY_DB_PATH`.

## Usage

1. Open the landing page and create a group with a name, currency, and the people splitting.
2. You will be redirected to `/g/<group-id>`. That URL is the shareable link. Anyone with it can view and edit the group.
3. Add expenses. Each expense has a description, amount, one payer, and any subset of members as sharers. The amount is split equally in integer cents with the remainder distributed one cent at a time, so the shares sum exactly.
4. Watch balances and the settlement plan update on every action. The plan is computed greedily for the minimum number of transfers.
5. Copy the plan as text or export it as PDF. Share the link with the group.

Scripts:

```bash
npm run dev        # start the dev server
npm run build      # production build
npm run start      # serve the build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm test           # vitest run
```

## Contributing

Issues and pull requests are welcome. Please keep changes small, scoped, and tested. The pure logic in `src/lib/money.ts` and `src/lib/settlement.ts` must remain covered by unit tests. All money is integer cents end to end.

## License

MIT. See [LICENSE](./LICENSE).

---

<sub>Copyright (c) 2026 [Drivanta](https://drivanta.co). MIT licensed unless noted. Part of [Drivanta Labs](https://github.com/drivanta).</sub>
