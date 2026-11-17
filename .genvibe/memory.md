<!-- genvibe-memory covers:42v4KQQkaRp4RKJH -->
## What this app is
- Python Quest, an Expo Router app cloned from `https://github.com/JoseJesusNetero/python-quest-fork.git`.

## Working (confirmed)
- TypeScript check completed with exit code 0: `npx tsc --noEmit -p .` (check: command exit 0).
- Page `/` passed a crash check with no crash or failed backend request (check: crash check on `/`).

## Claimed, not yet confirmed
- Repository import into `/home/project`: agent reports 46 files plus 24 image/binary assets; earlier count was 38 files plus 21 assets.
- Setup attempted with `npm install` and `npm run start`; app launch not confirmed.
- Agent says Supabase auth, a profiles table, auth context, route guard, login/signup, profile with logout, and +100 XP on correct answers for lessons 1–5 were implemented.
- Agent says sign-up displays an email-confirmation notice, unconfirmed login shows a warning, resend email has a 30-second countdown, and a confirmation callback attempts to create a session and navigate to the dashboard. Real Supabase behavior is untested because credentials are placeholders.
- Agent says auth errors have Portuguese messages and loading states.
- Latest TypeScript check failed: `npx tsc --noEmit -p .` (exit 2). Earlier check exited 0.
- Files reported changed: `.env`, `src/lib/supabase.ts`, `src/context/AuthContext.tsx`, `src/lib/progress.ts`, `src/app/lesson.jsx`, `src/app/lesson2.jsx` through `lesson5.jsx`, `src/app/_layout.jsx`, `src/app/login.tsx`, `src/app/(tabs)/profile.jsx`, `app.json`, `src/lib/authErrors.ts`, `src/lib/authLink.ts`, `src/app/auth/callback.tsx`.
- Agent reports installing `@supabase/supabase-js` and `react-native-url-polyfill`; installation of `@react-native-async-storage/async-storage` is not confirmed. `.env` uses placeholder Supabase credentials.

## Open bugs
—

## Design
- Agent describes the login/signup screen as navy and gold.
- Agent says profile progress uses an assumed 500 XP per level.
- Agent describes confirmation notices and error messages in Portuguese.

## Structure
- Expo Router app. Reported auth/profile paths are listed under “Claimed, not yet confirmed.”
- Agent says lesson XP sync is in `src/lib/progress.ts` and lesson files 1–5.

## User preferences & rules
- User requested real Supabase authentication and a dynamic user profile.
- User requested Supabase client placeholders, an `AuthProvider` managing `session` and `user`, login/signup, route protection, profile data, logout, and lesson XP syncing.
- User requested clear signup email-confirmation notices, a warning for login before confirmation, and automatic login after confirmation.
