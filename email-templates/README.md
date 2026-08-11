# Reine Luxe Co. — Supabase Auth Email Templates

Ready-to-paste HTML email templates for Supabase's **Authentication → Email Templates**.

These match the Reine Luxe brand (dark `#0a0a0a` / gold `#c9a84c`).

## Files
| File | Template |
|------|----------|
| `reset-password.html`  | Reset password |
| `confirm-signup.html`  | Confirm signup (email verification) |
| `magic-link.html`      | Magic link (if enabled) |
| `invite-user.html`     | Invite user (if enabled) |

## How to use
1. In Supabase Dashboard: **Authentication → Email Templates**.
2. Open the matching template.
3. Paste the file's **HTML** into the message/HTML body field.
4. Set the **Subject** (suggested values below), then **Save**.

### Suggested subjects
- Reset password: `Reset your Reine Luxe Co. password`
- Confirm signup: `Confirm your Reine Luxe Co. email`
- Magic link: `Your Reine Luxe sign-in link`
- Invite user: `You've been invited to Reine Luxe Co.`

## Important
- **Keep `{{ .ConfirmationURL }}`** inside the button `href` — Supabase replaces it
  with the real link **including the token**. Do not substitute a static URL.
- Before sending, make sure these are configured in the dashboard:
  - **Site URL** = `https://reine-mocha.vercel.app` (your `NEXT_PUBLIC_SITE_URL`)
  - **Redirect URLs** include `https://reine-mocha.vercel.app/auth/callback`
    and `https://reine-mocha.vercel.app/auth/reset-password`
  - **Custom SMTP** is enabled (see project notes) so emails actually send and
    carry your sender.
- These templates are separate from the transactional order emails in `lib/email.ts`.

## Troubleshooting — "Confirmation failed" / "This link is missing its authentication token"

If clicking **Confirm Email** lands on the error page saying the link is
"missing its authentication token", the confirmation URL arrived **with no token
at all**. The redirect happened, but the token part of the link was not there.
In order of likelihood:

1. **The template's button no longer uses `{{ .ConfirmationURL }}`.**
   In Supabase Dashboard → **Authentication → Email Templates → Confirm signup**,
   open the button's `href`. It must be exactly:

   ```html
   <a href="{{ .ConfirmationURL }}" ...>Confirm Email</a>
   ```

   If the Dashboard editor rewrote it to a fixed URL (e.g.
   `https://reine-mocha.vercel.app/auth/callback`) or you used `{{ .SiteURL }}`,
   that's the bug — `{{ .ConfirmationURL }}` is the only variable that expands to
   the verification URL **including the token**. Fix it, then send a **fresh**
   verification email (already‑sent links stay broken).

2. **Redirect URL not allow‑listed.** Dashboard → **Authentication → URL
   Configuration**:
   - **Site URL** = `https://reine-mocha.vercel.app` (homepage, no path)
   - **Redirect URLs** must include at least:
     - `https://reine-mocha.vercel.app/auth/callback`
     - `https://reine-mocha.vercel.app/auth/reset-password`
     - `https://reine-mocha.vercel.app/**`
   When a link's `redirect_to` isn't allowed, Supabase falls back to the Site URL
   and the token can be dropped from the redirect.

3. **The email client mangled the link.** Some webmail/corporate security scanners
   truncate long verification URLs (they contain `?token=...&type=signup&redirect_to=...`).
   Use the **Resend verification email** button on the Sign In page and try opening
   the new email on a different client (e.g. Gmail on your phone).
