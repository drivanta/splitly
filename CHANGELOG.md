# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0]

### Added

- Initial scaffold of splitly, a mobile-first bill-splitting web app.
- Next.js 14 App Router, TypeScript strict mode, Tailwind, ESLint.
- SQLite persistence via better-sqlite3 with a foreign-key enabled schema for groups, members, expenses, and expense shares.
- Server actions for creating groups, adding members, and adding expenses.
- Pure logic for parsing and formatting integer-cent amounts, equal split with remainder distribution, balance computation, and greedy minimum-transfers settlement.
- Unit tests for money helpers and the settlement algorithm.
- Group page at `/g/[groupId]` with members, expenses, live balances, and the settlement plan.
- Share button that copies the group link to clipboard.
- Settlement export to clipboard text and to PDF via jspdf.
- CI workflow running lint, typecheck, tests, and build on Node 20.
