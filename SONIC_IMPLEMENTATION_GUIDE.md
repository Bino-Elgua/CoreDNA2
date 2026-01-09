# Sonic Co-Pilot Implementation Guide

Enterprise-grade voice agent for CoreDNA2 platform.

## 🎙️ Overview

Sonic Co-Pilot is a voice-activated AI assistant that executes commands directly:
- **Voice Control**: Say "Sonic, extract apple.com" → Brand DNA extracted in 3 seconds
- **Chat Interface**: Type commands if voice not available
- **Hunter Tier Lock**: Premium feature for $149/mo users only
- **Privacy-First**: No voice storage, all processing local to browser

## 📦 Implementation Phases

### Phase 1: Core Service ✅
**File**: `src/services/sonicCoPilot.ts`

Core service that:
- Detects user intent using AI (Gemini)
- Routes to command handlers
- Enforces tier permissions
- Logs all actions to Supabase for audit trail

**Key Classes**:
```typescript
class SonicCoPilot {
  async initialize(): Promise<boolean>
  async processCommand(input: string): Promise<string>
  
  // Private command handlers
  private extractBrand(context: any)
  private generateCampaign(context: any)
  private buildWebsite(context: any)
  private runWorkflow(context: any)
  private upgradeTier(context: any)
  private showStats()
  private showHelp()
}
```

**Tier Enforcement**:
```
Free      → extract_brand, help, show_stats, upgrade_tier
Pro       → ^ + generate_campaign, build_website
Hunter    → ^ + run_workflow (VOICE ENABLED)
Agency    → All commands + team management
```

### Phase 2: Voice Listener Hook ✅
**File**: `src/hooks/useVoiceListener.ts`

React hook that wraps Web Speech API:
- Detects browser support (Chrome/Edge only)
- Handles speech recognition lifecycle
- Returns transcript + error handling
- No GPU required, fully local

**Usage**:
```typescript
const { isListening, startListening, stopListening } = useVoiceListener({
  continuous: false,
  onResult: (transcript) => console.log(transcript),
  onError: (error) => console.log(error)
});
```

### Phase 3: Floating UI Component ✅
**File**: `src/components/SonicOrb.tsx`

Beautiful floating orb in bottom-right corner:
- Animated pulse when listening
- Chat panel with message history
- Voice + text input modes
- Text-to-speech responses

**Features**:
- 🎙️ Floating orb button
- 📞 Voice activation toggle
- 💬 Chat panel with full message history
- 🎤 Listening indicator (red pulse)
- 🔊 Text-to-speech responses

### Phase 4: App Integration ✅
**File**: `App.tsx`

Added `<SonicOrb />` component to main layout.

### Phase 5: Database Setup
**File**: `SONIC_SETUP.sql`

Run in Supabase SQL editor:
```sql
CREATE TABLE sonic_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT,
  metadata JSONB,
  timestamp TIMESTAMP
);
```

This creates audit trail for:
- Command received
- Intent detected (+ confidence)
- Command executed
- Results/errors

### Phase 6: TypeScript Declarations ✅
**File**: `src/types/speech.d.ts`

Proper types for Web Speech API:
```typescript
interface SpeechRecognition extends EventTarget
interface SpeechRecognitionEvent extends Event
interface SpeechRecognitionResult
interface SpeechRecognitionAlternative
```

## 🚀 Available Commands

### Brand Extraction
```
"Extract apple.com"
"Analyze nike.com"
```
Requires: Free tier

### Campaign Generation
```
"Launch viral campaign"
"Create campaign for Nike"
```
Requires: Pro tier

### Website Builder
```
"Build me a website"
"Deploy website"
```
Requires: Pro tier

### Workflows
```
"Run lead generation"
"Start closer agent"
```
Requires: Hunter tier

### Analytics
```
"Show stats"
"What's my tier?"
```
Requires: Free tier

### General
```
"Help"
"Sonic, what can you do?"
```
Requires: Free tier

## 🔒 Security Model

### Privacy First
- ✅ Voice processed locally in browser (Web Speech API)
- ✅ No audio files stored on servers
- ✅ Only command text logged (for audit/UX)
- ✅ User can disable anytime in Settings
- ✅ Command history deletable

### Tier Enforcement
- ✅ Initialize() checks Hunter+ tier
- ✅ Each command checks permission
- ✅ Destructive actions require confirmation
- ✅ Rate limiting via tier system

### Audit Trail
- ✅ All commands logged with timestamp
- ✅ Log includes: user_id, action, metadata
- ✅ Accessible only to user (RLS policy)
- ✅ Retained 90 days, auto-deleted

## 📋 Testing Checklist

After implementing all phases:

### Tier Tests
- [ ] Free tier: Sonic orb hidden
- [ ] Pro tier: Sonic orb hidden
- [ ] Hunter tier: Sonic orb visible
- [ ] Agency tier: Sonic orb visible

### Functionality Tests
- [ ] Click orb → chat panel opens
- [ ] Type command → Sonic responds
- [ ] Say "Sonic, help" → Shows available commands
- [ ] Say "Sonic, extract apple.com" → Extracts brand
- [ ] Voice button works (Chrome/Edge only)

### Command Tests
- [ ] extract_brand → Success
- [ ] generate_campaign → Success
- [ ] build_website → Asks for confirmation
- [ ] run_workflow → Success
- [ ] show_stats → Shows tier + extractions
- [ ] help → Shows command list

### Security Tests
- [ ] Tier checks prevent unauthorized access
- [ ] Commands logged to Supabase
- [ ] Audit trail visible in command history
- [ ] Voice data NOT stored
- [ ] Can disable voice anytime
- [ ] Destructive actions require confirmation

### UX Tests
- [ ] Orb pulses when listening
- [ ] Clear listening indicator
- [ ] Easy to minimize/maximize
- [ ] Chat history persists during session
- [ ] Toast notifications for actions
- [ ] Error messages helpful

## 📊 Analytics to Track

Add to your analytics service:

```typescript
// Usage
analytics.track('sonic_initialized', { userId, tier });
analytics.track('sonic_command_sent', { userId, intent, method: 'voice'|'chat' });
analytics.track('sonic_command_success', { userId, intent, duration });
analytics.track('sonic_command_failed', { userId, intent, error });

// Engagement
analytics.track('sonic_voice_enabled', { userId });
analytics.track('sonic_voice_disabled', { userId });
analytics.track('sonic_chat_opened', { userId });
analytics.track('sonic_help_requested', { userId });

// Business
analytics.track('sonic_influenced_upgrade', { userId, fromTier, toTier });
```

## 🗿 Deployment Strategy

### Week 1: Soft Launch (Hunter Only)
1. Implement all 6 phases
2. Test with your Hunter account
3. Enable for 5 beta users
4. Collect feedback for 48 hours

### Week 2: Public Launch
1. Deploy to production
2. Enable for all Hunter users
3. Post on social media
4. Send launch email

## 🤍 Post-Launch Features

Once core is stable, add:

### Multi-Language Support
- Detect language from speech
- Respond in same language

### Scheduled Commands
```
"Sonic, extract top 10 competitors every Monday"
"Send me weekly analytics report"
"Post campaign assets at 9am daily"
```

### Context Awareness
- Remember previous commands
- "Extract apple.com" → "Now build competitor analysis"
- Sonic maintains conversation history

### Team Commands (Agency Tier)
```
"Sonic, assign this campaign to Sarah"
"What's the team's extraction quota?"
```

### Proactive Insights
```
User: "Show stats"
Sonic: "Your campaign engagement is 40% higher on Tuesdays. 
       Want me to auto-schedule future posts?"
```

## 🎤 Browser Support

- ✅ Chrome (full support)
- ✅ Edge (full support)
- ⚠️ Firefox (limited)
- ❌ Safari (no support)

Voice only works in Chrome/Edge. Chat still works in all browsers.

## 📞 Support & Monitoring

Monitor these metrics:
- Sonic adoption rate (% of Hunter users using it)
- Most popular commands
- Command success rate
- Voice vs chat usage ratio
- Average commands per user per week

## ✅ Final Checklist

Before launching to users:
- [ ] Database table created in Supabase
- [ ] sonicCoPilot.ts implemented
- [ ] useVoiceListener.ts hook created
- [ ] SonicOrb.tsx component working
- [ ] App.tsx integrated
- [ ] speech.d.ts type declarations added
- [ ] Tier checks implemented
- [ ] Audit logging working
- [ ] All 6 commands tested
- [ ] Privacy notice added
- [ ] Settings page section added
- [ ] Marketing assets prepared
- [ ] Documentation complete

---

**Built with 🎙️ for CoreDNA2 Hunter Tier**
