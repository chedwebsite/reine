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
