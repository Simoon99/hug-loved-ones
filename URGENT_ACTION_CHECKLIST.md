# 🚨 URGENT: API Key Security Response Checklist

## ⏰ DO THIS NOW (10 minutes):

### ✅ Step 1: Regenerate Your Gemini API Key (5 min)

1. **Open Google Cloud Console**:
   
   👉 **Click here**: https://console.cloud.google.com/apis/credentials?project=gen-lang-client-0620899701

2. **Find and click on your API key** (the one starting with `AIzaSyAr2jNF...`)

3. **Click "REGENERATE KEY"** button (top right)

4. **Copy your NEW API key** and save it somewhere safe temporarily

5. **IMPORTANT - Add Restrictions**:
   - Scroll to **"API restrictions"** section
   - Select **"Restrict key"**
   - Check ONLY: ☑️ **Generative Language API**
   - Scroll to **"Application restrictions"**
   - Select **"HTTP referrers (web sites)"**
   - Add:
     - `https://hug-loved-ones.vercel.app/*`
     - `https://*.vercel.app/*`
     - `http://localhost:3000/*`
   - Click **"SAVE"**

---

### ✅ Step 2: Update Vercel (2 min)

**Option A: Vercel Dashboard (Easiest)**

1. Go to: https://vercel.com/simoon99s-projects/hug-loved-ones/settings/environment-variables

2. Find `GEMINI_API_KEY` and click the 3 dots → **Delete** (do this for all 3 instances: Production, Preview, Development)

3. Click **"Add New"**:
   - Name: `GEMINI_API_KEY`
   - Value: `[paste your NEW key here]`
   - Select: ☑️ Production ☑️ Preview ☑️ Development
   - Type: **Encrypted**
   - Click **"Save"**

**Option B: PowerShell (Advanced)**

```powershell
# First remove old keys
vercel env rm GEMINI_API_KEY production
vercel env rm GEMINI_API_KEY preview
vercel env rm GEMINI_API_KEY development

# Then add new key (you'll be prompted to enter the value)
echo "YOUR_NEW_KEY_HERE" | vercel env add GEMINI_API_KEY production
echo "YOUR_NEW_KEY_HERE" | vercel env add GEMINI_API_KEY preview
echo "YOUR_NEW_KEY_HERE" | vercel env add GEMINI_API_KEY development
```

---

### ✅ Step 3: Redeploy (1 min)

```powershell
vercel --prod --yes
```

Or just push any change to GitHub (auto-deploys).

---

### ✅ Step 4: Update Local .env.local (1 min)

Open your `.env.local` file and update:

```
GEMINI_API_KEY=YOUR_NEW_REGENERATED_KEY_HERE
```

(Don't worry - this file is NOT in git, it's safe!)

---

### ✅ Step 5: Test Your App (2 min)

1. Open: https://hug-loved-ones.vercel.app
2. Try generating an image
3. If it works ✅ - You're all set!
4. If it fails ❌ - Check Vercel logs: `vercel logs`

---

## 📊 Quick Status Check

After completing the above:

- [ ] API key regenerated in Google Cloud Console
- [ ] API restrictions added (HTTP referrers + Generative Language API only)
- [ ] Old GEMINI_API_KEY deleted from Vercel
- [ ] New GEMINI_API_KEY added to Vercel (all 3 environments)
- [ ] Application redeployed
- [ ] Local .env.local updated
- [ ] Tested app - image generation works

---

## 🔍 Review Usage (Optional but Recommended)

Check if anyone abused your old key:

1. **API Usage**: https://console.cloud.google.com/apis/dashboard?project=gen-lang-client-0620899701
2. **Billing**: https://console.cloud.google.com/billing

Look for unusual spikes. If you see suspicious activity, contact Google Cloud Support.

---

## ✅ What I've Already Done For You:

✅ Removed exposed API key from all documentation files  
✅ Updated docs to use placeholders only  
✅ Pushed cleaned repository to GitHub  
✅ Created comprehensive security response guide  

---

## 💡 What Happened?

Your Gemini API key was accidentally included in documentation files that were pushed to GitHub. Google's automated security scanning detected it and alerted you. **This is actually good** - it means their security is working!

The key was in:
- `SUPABASE_EDGE_FUNCTIONS_SETUP.md`
- `DEPLOYMENT_SUCCESS.md`

It's now been removed from all current files. Once you regenerate the key, the old one becomes useless.

---

## 🎯 Timeline Estimate

- **Regenerate key**: 5 minutes
- **Update Vercel**: 2 minutes
- **Redeploy**: 1 minute
- **Test**: 2 minutes

**Total: ~10 minutes** to secure everything! 🔒

---

## 🆘 Need Help?

If you get stuck on any step, let me know and I'll guide you through it!

---

**Start with Step 1 now**: https://console.cloud.google.com/apis/credentials?project=gen-lang-client-0620899701

Copy your new key when you regenerate it - you'll need it for Step 2! 🔑

