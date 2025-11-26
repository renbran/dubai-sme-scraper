# Getting Your Apollo.io API Key

Follow these steps to get your Apollo API key for the scraper.

## Step-by-Step Guide

### 1. Create Apollo Account (if you don't have one)

1. Go to https://www.apollo.io/
2. Click **"Sign Up"** or **"Get Started"**
3. Fill in your details:
   - Work email
   - Company name
   - Password
4. Verify your email

### 2. Navigate to API Settings

1. Log into Apollo.io
2. Click your **profile picture** (top right corner)
3. Select **"Settings"** from dropdown
4. In the left sidebar, scroll down to **"API"** section
5. Click **"API"**

**Direct URL**: https://app.apollo.io/#/settings/integrations/api

### 3. Generate API Key

1. On the API page, you'll see **"API Keys"** section
2. Click **"Create New Key"** button
3. Give your key a name (e.g., "Dubai SME Scraper")
4. Click **"Generate"**
5. **Copy the key immediately** (you won't be able to see it again)

### 4. Save Your API Key

**Store it securely!** You'll need it to run the scraper.

Example key format: `abc123XYZ789...` (random alphanumeric string)

## Setting Up the API Key

### Windows PowerShell (Temporary - Current Session Only)

```powershell
$env:APOLLO_API_KEY="your_apollo_api_key_here"
```

### Windows PowerShell (Permanent - Saved for Future Sessions)

```powershell
[System.Environment]::SetEnvironmentVariable('APOLLO_API_KEY', 'your_apollo_api_key_here', 'User')
```

After setting permanently, **restart PowerShell** for changes to take effect.

### Verify It's Set

```powershell
echo $env:APOLLO_API_KEY
```

You should see your API key printed.

## Free Plan Limits

| Feature | Free Plan |
|---------|-----------|
| Credits per month | 50 |
| API calls per minute | 10 |
| Contact exports | 50/month |
| Email credits | 10/month |

**Each contact revealed = 1 credit**

### Tips for Free Plan Users

1. **Start small**: Run test with 5-10 companies first
2. **Be selective**: Only search for top executives (founder, c_suite)
3. **Use company domains**: More accurate, fewer wasted credits
4. **Monthly reset**: Credits reset on the 1st of each month

## Upgrading Your Plan

If you need more credits:

| Plan | Price | Credits/Month | API Calls/Min |
|------|-------|---------------|---------------|
| Basic | $49/mo | 1,200 | 30 |
| Professional | $99/mo | 12,000 | 60 |
| Organization | Custom | Unlimited | 120 |

**Recommended for production**: Professional plan ($99/mo)

## Testing Your API Key

Run the quick test to verify your API key works:

```bash
npm run apollo:test
```

If successful, you'll see:
```
Found X executives:
1. John Doe - CEO at Company Name
   Email: john@company.com
   Phone: +971501234567
```

If there's an error:
- Check API key is set: `echo $env:APOLLO_API_KEY`
- Verify key is correct (copy-paste from Apollo)
- Ensure you have credits available (check Apollo dashboard)

## Security Best Practices

### ❌ Don't:
- Commit API keys to Git
- Share API keys publicly
- Hard-code keys in scripts

### ✅ Do:
- Use environment variables
- Keep keys in `.env` file (add to `.gitignore`)
- Rotate keys periodically
- Delete unused keys

## Troubleshooting

### "Invalid API key" Error

**Causes**:
- Key was copied incorrectly (extra spaces, missing characters)
- Key was deleted in Apollo dashboard
- Account suspended/expired

**Solution**:
1. Go back to Apollo → Settings → API
2. Delete old key
3. Generate new key
4. Update environment variable

### "Credits exhausted" Error

**Solution**:
- Wait for monthly reset (1st of month)
- Upgrade to paid plan
- Use credits more selectively

### "Rate limit exceeded" Error

**Solution**:
- Lower `rateLimit` in config: `rateLimit: 10` (for free plan)
- Add delays between searches
- Upgrade to paid plan

## Next Steps

Once you have your API key set up:

1. ✅ Test it: `npm run apollo:test`
2. ✅ Review output in `results/` folder
3. ✅ Run combined campaign: `npm run apollo:campaign`
4. ✅ Customize searches in `config/apollo_config.json`

## Support

- **Apollo Help Center**: https://help.apollo.io/
- **API Documentation**: https://apolloio.github.io/apollo-api-docs/
- **Status Page**: https://status.apollo.io/

---

**You're all set!** 🚀 Start finding C-level executives with Apollo.
