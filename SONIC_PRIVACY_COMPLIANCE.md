# Sonic Co-Pilot: Privacy & Compliance Documentation

## 🔒 Data Privacy Statement

### What We Collect
When you use Sonic Co-Pilot's voice features:

**Voice Audio**
- ✅ Processed locally in your browser using Web Speech API
- ✅ NOT recorded or stored on CoreDNA servers
- ❌ Never sent to our servers
- ❌ Never used for training models

**Command Transcription**
- ✅ Text transcription of voice commands logged to Supabase
- ✅ Used for functionality and product improvements
- ✅ Retained for 90 days, then automatically deleted
- ✅ Encrypted in transit (HTTPS)
- ✅ Encrypted at rest (Supabase encryption)

**Command Metadata**
- ✅ Timestamp, intent, confidence, parameters
- ✅ Success/failure status
- ✅ Stored in sonic_logs table
- ✅ Only accessible to user (RLS policies)

### Third-Party Services
- **Web Speech API**: Google Chrome/Browser native
  - [Google Privacy Policy](https://policies.google.com/privacy)
- **Gemini API**: Intent detection & responses
  - [Google AI Privacy](https://ai.google/responsibility/responsible-ai-practices/)

### Your Rights
- 🔓 Disable voice commands anytime in Settings
- 🗑️ Delete your command history anytime
- 📥 Request export of all command logs
- 🔓 Opt out of command analysis for product improvements

## ⚖️ Legal & Terms

### Acceptable Use

You may use Sonic Co-Pilot to:
- ✅ Extract brand DNA from websites
- ✅ Generate marketing campaigns
- ✅ Build and deploy websites
- ✅ Execute pre-approved workflows
- ✅ Analyze brand competitors
- ✅ Schedule automation tasks

You may NOT use Sonic Co-Pilot to:
- ❌ Attempt to bypass tier restrictions or rate limits
- ❌ Execute commands that violate our Terms of Service
- ❌ Generate content that violates our Content Policy
- ❌ Automate actions without proper authorization

### Limitations

- 🎙️ Sonic Co-Pilot is provided "as is" without warranty
- ⏱️ We reserve the right to limit, throttle, or disable Sonic for abuse
- 🔍 Voice recognition accuracy depends on browser support & ambient noise
- 🚫 Some commands may require manual confirmation

### Data & Privacy

- 🔐 All actions logged for security and compliance purposes
- 📊 We may analyze command patterns to improve features (opt-out available)
- 📝 You retain all rights to content generated via Sonic commands
- 🔄 Command logs may be reviewed for security purposes

---

## 🎙️ Privacy Controls in Settings

Users can configure in **Settings → Sonic Co-Pilot**:

```
┌─────────────────────────────────────────┐
│ 🎙️ Sonic Co-Pilot Settings              │
├─────────────────────────────────────────┤
│                                         │
│ ☑ Enable Sonic Co-Pilot                 │
│   Voice-activated AI assistant          │
│   (Hunter tier required)                │
│                                         │
│ ☑ Allow Voice Commands                  │
│   "Sonic, [command]" activation         │
│                                         │
│ Wake Word:    [Sonic        ▼]          │
│               (Sonic, Hey Sonic, etc)   │
│                                         │
│ ☑ Require Confirmation                  │
│   Ask before deploys, deletions, etc    │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🔒 Privacy & Security               │ │
│ ├─────────────────────────────────────┤ │
│ │ ✓ Voice data processed locally      │ │
│ │ ✓ No voice recordings stored        │ │
│ │ ✓ Commands logged for audit (text)  │ │
│ │ ✓ You can disable voice anytime     │ │
│ │ ✓ Command history deletable         │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [View Command History →]                │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📋 Privacy Policies (TO ADD)

### Update Privacy Policy with:

**New Section: Sonic Co-Pilot & Voice Data**

When you use Sonic Co-Pilot's voice features:

1. **Voice Audio Processing**
   - Your voice is processed locally in your browser
   - Uses Web Speech API (browser-native, Google infrastructure)
   - CoreDNA does NOT receive or store audio files
   - Audio is discarded after transcription

2. **Command Logging**
   - We log the TEXT transcription of commands (not audio)
   - Logs include: timestamp, intent, parameters, results
   - Logs are used for functionality, security, compliance
   - You can view and delete logs anytime in Settings

3. **Data Retention**
   - Command logs retained for 90 days
   - Automatically deleted after retention period
   - You can request earlier deletion
   - Audit logs may be retained longer for compliance

4. **Third-Party Sharing**
   - Sonic Co-Pilot uses Gemini API for intent detection
   - Transcribed command text sent to Gemini (Google)
   - No personal data (name, email) included in API calls
   - Google processes per their privacy policy

5. **Your Rights**
   - Disable voice anytime in Settings
   - Delete command history anytime
   - Request export of all logs
   - Opt out of product improvement analytics

### Update Terms of Service with:

**New Section: Sonic Co-Pilot Terms**

1. **Tier Requirements**
   - Sonic Co-Pilot requires Hunter tier ($149/mo)
   - Free and Pro tiers cannot access voice features
   - Access may be revoked for terms violations

2. **Acceptable Use**
   - Use only for authorized brand intelligence tasks
   - Do not bypass tier restrictions
   - Do not violate content policies
   - Some actions require manual confirmation

3. **Limitations**
   - Provided "as is" without warranty
   - Voice accuracy depends on browser & environment
   - We may disable Sonic for abuse/violations
   - Some features may have rate limits

4. **Data & Privacy**
   - Command logs used for compliance & improvement
   - You retain rights to generated content
   - Logs may be reviewed for security
   - Third-party processors follow GDPR/CCPA

---

## 🔐 Implementation Details

### How Voice Data Flows

```
User speaks: "Sonic, extract apple.com"
    ↓
Browser (Chrome/Edge) detects speech (Web Speech API)
    ↓
Audio processed locally in browser
    ↓
TEXT TRANSCRIPTION extracted: "sonic extract apple.com"
    ↓
Audio discarded (never sent anywhere)
    ↓
Transcription text sent to:
  1. SonicCoPilot.processCommand() ← Local processing
  2. Gemini API ← For intent detection
  3. sonic_logs table ← For audit trail
    ↓
ALL ENCRYPTION: HTTPS in-transit, at-rest encryption Supabase
    ↓
User sees response: "Extracting apple.com..."
```

### What's Logged

```typescript
// LOGGED:
{
  user_id: "uuid",
  action: "command_received",
  metadata: {
    intent: "extract_brand",
    confidence: 0.95,
    method: "voice"  // or "chat"
  },
  timestamp: "2024-01-08T12:00:00Z"
}

// NOT LOGGED:
- Audio files
- Voice waveforms
- Raw speech data
- IP addresses
- Browser fingerprints
```

### RLS Security

```sql
-- Users can ONLY see their own logs
SELECT * FROM sonic_logs WHERE user_id = auth.uid()

-- Users can ONLY insert their own logs
INSERT INTO sonic_logs (user_id, action, metadata)
  WITH CHECK (auth.uid() = user_id)

-- CoreDNA staff can view (via admin user) for:
-- - Debugging user issues
-- - Compliance reviews
-- - Security audits
-- - Product analytics
```

---

## ✅ Compliance Checklist

### GDPR (if applicable)
- [ ] Users can request data export
- [ ] Users can request deletion
- [ ] Privacy policy updated
- [ ] Consent mechanism (tier selection)
- [ ] DPA in place with Google (Gemini API)
- [ ] Data retention policy documented

### CCPA (if applicable)
- [ ] Users can request access
- [ ] Users can request deletion
- [ ] "Do not sell" privacy rights
- [ ] Opt-out mechanism available
- [ ] Privacy policy disclosure

### SOC 2 (if applicable)
- [ ] Audit logging implemented
- [ ] Access controls (RLS policies)
- [ ] Encryption (HTTPS + at-rest)
- [ ] Data retention policies
- [ ] Regular security reviews

### General Best Practices
- [ ] Principle of least privilege (tier-based access)
- [ ] Data minimization (only log what needed)
- [ ] User transparency (clear privacy notice)
- [ ] User control (disable/delete anytime)
- [ ] Security monitoring (audit logs)

---

## 🚀 Launch Preparation

### Before Going Live:

1. **Legal Review**
   - [ ] Have lawyer review privacy policy updates
   - [ ] Confirm Terms of Service compliance
   - [ ] Verify DPA with Google (Gemini)

2. **User Communication**
   - [ ] Draft privacy notice for users
   - [ ] Add FAQ section
   - [ ] Prepare support responses
   - [ ] Create help docs

3. **Technical Setup**
   - [ ] Create sonic_logs table in Supabase
   - [ ] Enable RLS policies
   - [ ] Set up automated deletion (90-day)
   - [ ] Test with test user data

4. **Monitoring**
   - [ ] Set up alerts for unusual activity
   - [ ] Monitor command success rates
   - [ ] Track privacy-related issues
   - [ ] Audit logs monthly

---

## 📞 User FAQ

### Privacy & Security

**Q: Is my voice recorded?**
A: No. Your voice is processed locally in your browser. CoreDNA never receives or stores audio files.

**Q: What gets logged?**
A: Only the text transcription of commands, timestamps, and results. For audit and compliance.

**Q: How long are logs kept?**
A: 90 days, then automatically deleted. You can delete manually anytime in Settings.

**Q: Can I disable voice?**
A: Yes. Anytime in Settings → Sonic Co-Pilot, uncheck "Enable Voice Commands".

**Q: What if I want to delete my history?**
A: Settings → Sonic Co-Pilot → View Command History → Delete All

**Q: Is voice data encrypted?**
A: Yes. HTTPS in-transit, Supabase encryption at-rest.

### Technical Support

**Q: Voice not working on my browser?**
A: Sonic voice only works in Chrome/Edge. Use chat mode in Firefox/Safari.

**Q: How do I opt out?**
A: Settings → Uncheck "Enable Sonic Co-Pilot"

**Q: Can I export my data?**
A: Yes. Request via privacy@coredna.com with account email.

---

## 🤝 Privacy Questions?

Direct users to:
- **Privacy Policy**: /privacy
- **Terms of Service**: /terms
- **Support**: support@coredna.com
- **Legal**: legal@coredna.com

---

**Last Updated**: January 2024
**Next Review**: April 2024 (quarterly)
