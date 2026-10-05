# FinTrack Client (Frontend)

## Technology Stack
- **Framework**: React 18+ / Vite
- **Styling**: Tailwind CSS
- **State & Data Fetching**: React Query / Context API / Axios with Interceptors
- **Form & Validation**: React Hook Form + Zod

## Security Mandates
- Short-lived JWT stored in memory / secure HTTP-only cookies.
- Output encoding and XSS defense across all rendered user data.
- Zero client-side storage or exposure of third-party AI keys or sensitive secrets.
