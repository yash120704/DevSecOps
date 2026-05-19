# Supabase Email Verification Configuration

## ⚙️ Configure Redirect URLs in Supabase

Your app now has a proper email verification flow:

1. User registers → sees "Check Your Email" page
2. User clicks email verification link → redirects to verification success page
3. User can then log in

### Step-by-Step Setup

#### 1. Go to Supabase Auth Settings

1. Open your Supabase project dashboard
2. Go to **Authentication** (left sidebar)
3. Click **URL Configuration**

#### 2. Set Site URL

**For Local Development:**
```
http://localhost:5173
```

**For Production:**
```
https://dev-sec-ops-ruby.vercel.app
```

Save after updating.

#### 3. Set Redirect URLs

Click **Add redirect URL** and add both:

**Local:**
```
http://localhost:5173/auth/callback
```

**Production:**
```
https://dev-sec-ops-ruby.vercel.app/auth/callback
```

![Redirect URL Config](https://supabase.com/docs/img/guides/auth-url-config.png)

#### 4. Verify Email Configuration

Go to **Email Templates** (still in Authentication):

- ✅ Confirm signup template should be **ENABLED**
- Subject should mention email confirmation
- Template includes a confirmation link that redirects to your app

#### 5. Optional: Customize Email Templates

To customize the confirmation email:

1. In **Email Templates**, click **Confirm signup**
2. Edit the email subject and body
3. Make sure the `{{ confirmation_url }}` variable is included
4. This URL will automatically include your redirect URL from step 3

---

## Testing the Flow

### Local Testing (http://localhost:5173)

1. Start frontend: `npm run dev`
2. Start backend: `python manage.py runserver`
3. Go to **Register** page
4. Enter email and password
5. Click **CREATE ACCOUNT**
6. ✅ You should see "Check Your Email" page
7. Check your email inbox for verification link
8. Click the link → should redirect to **Verification Success** page
9. Click "Continue to Login"
10. Log in with your credentials

### Production Testing (https://dev-sec-ops-ruby.vercel.app)

Same steps as above, but using the production URL.

---

## Environment Variables

No additional environment variables needed! Supabase handles everything via:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

These are already configured in your `.env.local` (local) and Vercel environment variables (production).

---

## New Pages

Your app now has:

- **Register.jsx** - Shows verification pending after signup
- **VerificationSuccess.jsx** - Shows when user clicks email link
- **Login.jsx** - User logs in after email verification

---

## Troubleshooting

### Email not received

1. Check spam/junk folder
2. Verify email address is correct during signup
3. Check Supabase **Auth** → **Users** to see if account was created
4. If created but not verified, click **Send confirmation** button in Supabase dashboard

### Redirect URL error

- Ensure redirect URLs match exactly in Supabase settings
- For local: `http://localhost:5173/auth/callback`
- For production: `https://dev-sec-ops-ruby.vercel.app/auth/callback`
- No trailing slashes or extra paths

### "Invalid verification link"

- Link may have expired (usually 24 hours)
- Try registering again
- In Supabase, you can manually send confirmation email to user

---

## Next Steps

After completing setup:

1. Test full flow: Register → Verify Email → Login
2. Deploy to production (push to main)
3. Vercel will auto-deploy frontend
4. Test in production environment

---

**Questions?** Check Supabase docs: https://supabase.com/docs/guides/auth/email-based-auth-and-confirmations
