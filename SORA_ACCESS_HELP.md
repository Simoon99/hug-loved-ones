# Sora 2 Access Issues - Troubleshooting Guide

## 🔒 "Organization Must Be Verified" Error

Even though your organization shows as verified, you might still get this error. Here's why and how to fix it:

### Why This Happens:

1. **Propagation Delay** - After verification, it can take 15-30 minutes for access to activate
2. **Old API Key** - Your current API key was created before verification
3. **Sora 2 Not Enabled** - Verification doesn't automatically grant Sora 2 access
4. **Wrong Tier** - Sora 2 might require a specific billing tier

### ✅ Step-by-Step Fix:

#### Step 1: Verify Your Organization
1. Go to: https://platform.openai.com/settings/organization/general
2. Check that "Organization Verified" shows green checkmark ✓
3. If not verified, click "Verify Organization" and follow the steps

#### Step 2: Check Sora 2 Access
1. Go to: https://platform.openai.com/account/limits
2. Look for "Sora 2" or "Video Generation" in your model access list
3. If not listed, you may need to:
   - Contact OpenAI support to enable Sora 2
   - Join the Sora 2 waitlist
   - Upgrade your billing tier

#### Step 3: Wait for Propagation (Important!)
- **After verification**: Wait 15-30 minutes before trying again
- **After tier upgrade**: Can take up to 1 hour
- **After getting Sora access**: May take a few hours

#### Step 4: Generate a New API Key
1. Go to: https://platform.openai.com/api-keys
2. **Delete your old API key** (or revoke it)
3. Click **"Create new secret key"**
4. Give it a name like "Sora 2 - Hug App"
5. **Copy the new key immediately** (you can't see it again)
6. Update your `.env.local` file with the new key

#### Step 5: Add Organization ID (Optional)
1. Go to: https://platform.openai.com/settings/organization/general
2. Find your "Organization ID" (starts with `org-`)
3. Copy it
4. Add to `.env.local`:
```
OPENAI_ORG_ID=org-your-id-here
```
5. Restart your dev server

#### Step 6: Restart Your Dev Server
```bash
# Kill the current server (Ctrl+C)
# Then restart:
npm run dev
```

### 🔍 Check If You Have Sora 2 Access

Try this curl command in your terminal:

```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \
  | grep sora
```

If you see `sora-2` in the output, you have access!

### 💰 Billing Requirements

Sora 2 might require:
- ✅ Verified organization
- ✅ Active payment method
- ✅ Specific billing tier (Pro or above)
- ✅ Minimum usage history

Check your billing: https://platform.openai.com/account/billing/overview

### 📞 Contact OpenAI Support

If none of the above works:

1. Go to: https://help.openai.com/
2. Click "Contact us"
3. Select "API" > "Model Access"
4. Mention:
   - You're verified ✓
   - You need Sora 2 access
   - Your organization ID
   - Error: "Your organization must be verified to use the model sora-2"

### 🔄 Alternative: Use Different Model (For Testing)

While waiting for Sora 2 access, you could temporarily test with a different model. However, note that other models don't generate videos like Sora 2.

### ⏰ Typical Wait Times

- **Just verified**: 15-30 minutes
- **New API key**: Immediate
- **Sora 2 access request**: 1-3 business days
- **Tier upgrade**: 1 hour

### 📊 Check Your Status

Run this in your browser console on https://platform.openai.com:

```javascript
// Check if you're verified
console.log('Verified:', document.querySelector('.verified')?.textContent);

// Check your tier
console.log('Tier:', document.querySelector('[data-tier]')?.textContent);
```

### 🎯 Common Mistakes

❌ **Using old API key** - Always generate new one after verification
❌ **Not waiting** - Propagation takes time, be patient
❌ **Wrong environment** - Make sure `.env.local` is loaded
❌ **Missing organization ID** - Some accounts need this explicitly set
❌ **Free tier** - Sora 2 might not be available on free tier

### ✅ Success Checklist

Before trying again, confirm:
- [ ] Organization is verified (green checkmark)
- [ ] Waited 15-30 minutes after verification
- [ ] Generated NEW API key after verification
- [ ] Updated `.env.local` with new key
- [ ] Restarted dev server (`npm run dev`)
- [ ] Checked billing is active
- [ ] (Optional) Added OPENAI_ORG_ID to `.env.local`

### 🚀 When It Works

You'll know Sora 2 access is working when:
- No 403 error
- Status changes to "queued" or "processing"
- You can see the video ID in the logs
- The app starts polling for video status

### 💡 Pro Tips

1. **Generate API key from within your organization settings**, not personal account
2. **Check OpenAI status page**: https://status.openai.com/
3. **Join OpenAI Discord** for community help
4. **Save your API key securely** - never commit to git!

### 📝 Current Error Codes

- `403` + "verified" = Organization verification issue
- `403` + other = API key doesn't have model access
- `401` = Invalid API key
- `429` = Rate limit exceeded
- `500` = OpenAI server error

### 🎬 Once You Have Access

After Sora 2 access is confirmed:
1. Your videos will start generating successfully
2. Check the terminal for progress logs
3. Videos take 1-3 minutes to generate
4. They'll automatically appear in your gallery!

Good luck! 🍀

