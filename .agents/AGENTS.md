# Database & Durability Rules

1. **Maintain separate databases for development and production.** Spin up a separate dev database on day one, and never let the local environment point at production.
2. **Soft deletes only.** Never hard-delete user-facing records. Add a `deleted_at` timestamp.
3. **Automated daily backups.** Store backups somewhere outside the hosting provider.
4. **Test restoring a backup.** Do this at least once before you need to.
5. **Standard timestamps and authors.** Add `created_at`, `updated_at`, `created_by`, `updated_by` to every table from day one.
6. **Use UUIDs.** Use UUIDs instead of sequential IDs for anything user-facing (URLs, emails, API responses).
7. **Indexes.** Add indexes for columns regularly filtered, sorted, or joined on.
8. **Migrations.** Change the schema with migration files, not by hand-editing the database. Run new migrations on a copy first.

# Secrets & Keys Rules

9. **Never paste API keys into chat.** Put secrets in environment variables or host's secret manager, and let the code read them from there.
10. **Rotate any credential the agent has ever seen, before going live.** Regenerate every API key, database password, and token the agent touched.
11. **Separate API keys for dev and prod.** Use a sandbox or test key while building, and a separate live key in production.
12. **Keep .env in .gitignore, and check the repo to confirm nothing sensitive ever got committed.** Check the repo to confirm nothing sensitive ever got committed. Rotate if found.

# Auth Rules

13. **Don't roll your own auth.** Use Auth0, Clerk, Supabase Auth, Firebase Auth, or similar.
14. **Test the "logged in as A, hit B's URL" attack on every page that shows user data.** Ensure users cannot access other users' data by changing IDs.
15. **Make session cookies Secure, HttpOnly, and SameSite.**
16. **Force re-authentication for destructive actions (delete account, change email, export data).**

# Admin Rules

17. **Build a real admin panel for menus, users, and master data, and put DB backup downloads in it (SQL and Excel).**
18. **Put the admin panel behind its own login and a non-obvious path, ideally with a second factor.**
19. **Admin role should be a database flag, not a hardcoded email or "if user.id == 1".**
20. **Log every admin action: who deleted what, who changed which price.**
21. **Use a separate staging admin account. Never test destructive features as the founder account.**

# Input Rules

22. **Validate everything on the server, not just in the browser. The browser is the user's territory.**
23. **Cap file upload size and restrict file types. Agents almost always forget this.**
24. **Rate-limit your own endpoints, especially login, signup, password reset, and anything that emails or texts.**
25. **Sanitize anything one user can show another (comments, profiles, messages). XSS is still everywhere.**

# Cost Control Rules

26. **Set hard spending limits on every paid service (AWS, OpenAI, Twilio, SendGrid) before launch.**
27. **Cap LLM token usage per user per day if your app calls an AI API.**
28. **Watch for agent-written loops that hit paid APIs. One infinite loop overnight is a $4k bill.**
29. **Use a separate billing-alert email that actually pings your phone.**

# Environments Rules

30. **Three environments minimum: local dev, staging, production. Test in staging with prod-like data first.**
31. **Disable debug mode, stack traces, and verbose errors in production. They leak code structure to attackers.**
32. **Set CORS to your actual domain, not "*".**
33. **Use HTTPS everywhere. No exceptions, even for "internal" tools.**
34. **Health-check endpoint plus uptime monitoring (UptimeRobot, BetterStack: free tiers exist).**
35. **If your app sends email, set up SPF, DKIM, and DMARC for your domain, or it lands in spam.**

# Logging Rules

36. **Log errors to a service (Sentry, LogRocket, or even a file you can grep). You can't fix what you can't see.**
37. **Don't log passwords, full credit cards, or PII even by accident. Mask sensitive fields in logs.**
38. **Keep at least 30 days of logs. Bugs report themselves weeks later.**

# Code & Git Rules

39. **Commit to git before every major agent change. The undo button is your best friend.**
40. **Read the diff before accepting it. If you don't understand a chunk, ask the agent to explain it line by line.**
41. **Keep a plain-English doc of what your app does and why. You write this, not the agent.**
42. **For anything touching payments, auth, or sensitive data: pay a human dev for a one-hour review before launch.**

# Legal Rules

43. **Privacy policy and terms of service before you collect a single user email.**
44. **Know which laws apply to you: GDPR (EU), DPDP (India), CCPA (California), HIPAA (health data).**
45. **A "delete my account" feature that actually deletes (or fully anonymizes). Required in most jurisdictions.**
46. **Cookie-consent banner if you have EU users.**

# Ops Rules

47. **Document the recovery steps for your top 3 disasters: DB corrupted, hosting down, key leaked.**
48. **Have a way to put the site in maintenance mode without redeploying.**
49. **Email/SMS alerts for: failed payments, signup spikes, error-rate spikes, server down.**
50. **Make sure someone other than you can get into hosting, the database, the domain, and email, and that renewals won't lapse.**
