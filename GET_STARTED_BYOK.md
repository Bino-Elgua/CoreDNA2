# Get Started with BYOK in CoreDNA2

## 🚀 Quick Start (5 minutes)

### For Users
1. Open CoreDNA in your browser
2. You'll see a modal: "Welcome to CoreDNA! 🧬"
3. Click "🚀 Get Free Gemini API Key"
4. Sign in with Google (free, no credit card needed)
5. Copy your API key
6. Paste it into the modal
7. Click "✨ Save & Start Extracting DNA"
8. Done! You're all set

### For Developers
```bash
# Start the dev server
npm run dev

# Open in incognito window to test onboarding
# Settings → API Keys (BYOK) to manage keys
```

## 📋 What Just Happened?

Your API key is now stored in your browser's localStorage:
- ✅ **Secure**: Only you can access it
- ✅ **Private**: CoreDNA servers never see it
- ✅ **Local**: Stored on your computer only
- ✅ **Portable**: Export it anytime

## 🔧 Add More Providers (Optional)

### OpenAI (GPT-4o)
1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Settings → API Keys (BYOK) → LLM tab
4. Find "OpenAI (GPT-4o, GPT-4)"
5. Paste key and hit save

### Claude (Anthropic)
1. Go to [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
2. Create a new API key
3. Settings → API Keys (BYOK) → LLM tab
4. Find "Anthropic Claude 3.5"
5. Paste key and hit save

### ElevenLabs (Voice)
1. Go to [elevenlabs.io/app/settings/api-keys](https://elevenlabs.io/app/settings/api-keys)
2. Copy your API key
3. Settings → API Keys (BYOK) → Voice tab
4. Find "ElevenLabs"
5. Paste key and hit save

(Repeat for any of the 70+ supported providers)

## 🛡️ Security Promise

We will NEVER:
- ❌ Store your keys on our servers
- ❌ Log or inspect your keys
- ❌ Sell or share your keys
- ❌ Access your accounts
- ❌ See your API usage

You control:
- ✅ When keys are added
- ✅ Which providers to use
- ✅ When keys are deleted
- ✅ Who can access (just you)
- ✅ Export/import for backup

## 📊 Using Your Keys

Your keys are automatically used when you:
- Extract DNA profiles
- Generate campaigns
- Simulate brand scenarios
- Build websites
- Use Sonic Lab features
- Run automations

Just select your preferred provider in each feature.

## 🐛 Troubleshooting

### "API key not configured" error
1. Settings → API Keys (BYOK)
2. Add your key for that provider
3. Save and try again

### Key not saving?
1. Check if localStorage is enabled
2. Make sure you're not in private/incognito mode
3. Refresh page and try again
4. Clear browser cache if stuck

### Forgot your key?
1. Go back to the provider's website
2. Generate a new one
3. Update in Settings → API Keys (BYOK)
4. Delete the old one

### Lost all keys?
1. If you exported a backup: Import the JSON file
2. Otherwise: Add keys again (takes 5 minutes)
3. Consider exporting keys regularly

## 💾 Backup Your Keys

To keep a safe backup:

1. Settings → API Keys (BYOK)
2. Scroll to bottom
3. Click "📥 Export Keys"
4. Save the JSON file somewhere safe
5. Never share this file!

To restore from backup:
1. Settings → API Keys (BYOK)
2. Scroll to bottom
3. Click "📤 Import Keys"
4. Select your saved JSON file
5. Done!

## 🌍 Supported Providers

### LLM (17+)
- Google Gemini ✓ (free, recommended)
- OpenAI, Claude, Mistral, xAI, Groq, Ollama, and more

### Image (20+)
- Google Imagen, DALL-E, Stability, Flux, and more

### Voice (17+)
- ElevenLabs, OpenAI TTS, PlayHT, and more

### Automation (12+)
- n8n, Zapier, Make, ActivePieces, and more

**Full list in Settings → API Keys (BYOK)**

## 💡 Pro Tips

1. **Start free**: Use Gemini (free 1,500 requests/day)
2. **Mix & match**: Use different providers for different tasks
3. **Export regularly**: Keep your backup safe
4. **Clear browser cache**: If having issues
5. **Check provider sites**: For latest API docs

## 🎯 Next Steps

- [ ] Add your first API key (Gemini recommended)
- [ ] Test the extraction feature
- [ ] Add more providers as needed
- [ ] Export and backup your keys
- [ ] Explore Settings to learn more

## 📞 Need Help?

### Documentation
- `BYOK_IMPLEMENTATION_SUMMARY.md` - Technical details
- `BYOK_QUICK_REFERENCE.md` - Developer guide
- `IMPLEMENTATION_CHECKLIST.md` - Detailed checklist

### Check Your Setup
```javascript
// In browser console:
JSON.parse(localStorage.getItem('apiKeys'))
// Shows your stored keys (hidden values for security)
```

### Report Issues
- Check console for error messages
- Verify key is correct format
- Try refreshing the page
- Clear browser cache
- Try different provider

## ✨ What's Next?

CoreDNA will automatically:
1. Route to your configured providers
2. Use the most appropriate model for each task
3. Handle errors gracefully
4. Show clear messages if key needed

You just need to:
1. Add one API key to get started
2. Optionally add more for flexibility
3. Sit back and let CoreDNA work

## 🎉 You're All Set!

Your BYOK system is now ready. Enjoy!

---

**Remember**: Your keys are private, secure, and stored locally.
CoreDNA will never see them. You're in control.

Happy DNA extraction! 🧬
