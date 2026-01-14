# CoreDNA2 - Complete App Rundown

## 🎯 What Is CoreDNA2?

**CoreDNA** is an enterprise AI-powered **brand intelligence and marketing automation platform**. It enables users to extract detailed brand DNA from any website, generate unlimited marketing campaigns, build websites, and automate marketing workflows using AI and voice commands.

**Positioning:** AI-powered brand analysis → Campaign generation → Website deployment → Marketing automation

**Target Users:** Marketing agencies, brand strategists, content creators, sales teams, digital strategists

---

## 📊 Subscription Tiers

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | 3 extractions/month, basic brand analysis |
| **Pro** | $49/mo | Unlimited extractions, all LLM providers, campaign generation |
| **Hunter** | $149/mo | Pro features + Sonic Co-Pilot (voice AI), automation workflows, advanced analytics |
| **Agency** | Custom | White-label, unlimited team seats, advanced features, dedicated support |

---

## 🎨 Core Features

### 1. **Brand DNA Extraction** (ExtractPage)
**Purpose:** Extract comprehensive brand analysis from any website URL

**What it does:**
- Analyzes website content using AI (LLM)
- Extracts and generates:
  - Brand name, tagline, mission, elevator pitch
  - Core values (5+) and key messaging (5+)
  - Color palette (3-5 colors with hex codes)
  - Typography system (2-3 fonts)
  - Visual style description
  - Tone of voice (adjectives + description)
  - Brand personality (3-5 traits)
  - Target audience description
  - 2-3 detailed buyer personas (with pain points & behaviors)
  - SWOT analysis (strengths, weaknesses, opportunities, threats)
  - Competitive analysis

**Technology:**
- Uses any of 70+ LLM providers (OpenAI, Claude, Gemini, Mistral, Groq, etc.)
- User brings their own API keys (BYOK model)
- Stores profiles in localStorage
- Optional RLM (Recursive Language Model) for deeper analysis

**Output:** BrandDNA object saved to localStorage['core_dna_profiles']

---

### 2. **Campaign Generation** (CampaignsPage)
**Purpose:** Generate marketing assets for multiple channels based on brand DNA

**What it does:**
- Takes extracted brand DNA and marketing goal
- Generates campaign assets for selected channels:
  - **Channels:** Instagram, Facebook, Twitter, LinkedIn, TikTok, Email, Blog, Ads
  - **Per channel:** Title, copy, image prompt, engagement hooks
- Two generation modes:
  - **Standard:** Generate all assets at once
  - **Hive Mode:** Individual AI agents per channel (specialized per platform)
- Auto-generates images using image generation providers (DALL-E, Stability, Midjourney, etc.)
- Allows editing individual assets
- Save campaigns to localStorage
- Optional video generation (for Hunter+ tiers)

**Assets Include:**
- Platform-optimized copy
- Hashtags (when relevant)
- Call-to-action buttons
- Image prompts + generated images
- Timing recommendations
- Engagement predictions

---

### 3. **Website Builder** (SiteBuilderPage)
**Purpose:** Instantly generate and deploy fully functional websites based on brand DNA

**What it does:**
- Analyzes brand DNA
- Generates complete website structure:
  - Hero section with brand messaging
  - Features/benefits section
  - About/mission section
  - Testimonials/social proof
  - Pricing/packages (if applicable)
  - CTA sections
  - Footer with branding
- Creates responsive HTML/CSS
- Generates all visual assets
- **Deployment options:**
  - **Rocket.new** (instant preview links)
  - **Firebase** (production deployment)
  - Local preview
- Embeds Sonic Co-Pilot chat widget (Hunter+ tier)
- One-click deployment

**Output:** Live website at custom URL (e.g., `yourcompany.rocket.new`)

---

### 4. **Sonic Co-Pilot** (Voice AI Agent - Hunter+ Only)
**Purpose:** Voice and chat-based AI assistant for all CoreDNA features

**What it does:**
- Floating orb in bottom-right corner (Hunter tier only)
- Chat interface OR voice commands (Chrome/Edge)
- Commands include:
  - **Brand Extraction:** "Extract [URL]"
  - **Campaign Generation:** "Launch campaign for [goal]"
  - **Website Building:** "Build website"
  - **Lead Finding:** "Find leads in [niche]"
  - **Help:** "Help" / "Show stats"
- Logs all interactions to Supabase
- Voice synthesis response
- Full command history and analytics

**Tech Stack:**
- Web Speech API (browser voice recognition)
- Supabase for audit logging
- Real-time status updates
- Integration with all CoreDNA services

---

### 5. **Lead Hunter** (ExtractPage - Lead Mode)
**Purpose:** Find qualified business leads with contact information

**What it does:**
- Requires geolocation permission
- Input: niche/industry + location
- Outputs: List of leads with:
  - Business name, address, rating
  - Contact email + phone
  - Website + social profiles
  - Gap analysis (missing features they have)
  - Opportunity description
  - Social media presence score
- Integrates with Closer Agent for outreach
- Optional n8n workflow automation

**Output:** LeadProfile objects (searchable, exportable)

---

### 6. **Battle Mode** (BattleModePage)
**Purpose:** Compare two brands head-to-head using AI analysis

**What it does:**
- Select 2 extracted brands from your profiles
- AI runs competitive simulation
- Generates detailed battle report:
  - Winner determination
  - 5-point metric comparison (visuals, strategy, messaging, market fit, innovation)
  - Gap analysis per brand
  - Visual critique with strengths/weaknesses
  - Tactical recommendations
- Visual radar chart comparison
- Detailed breakdown with percentages
- Optional RLM for deeper analysis

**Use Cases:**
- Competitive analysis
- Brand positioning validation
- Identify improvement areas
- Market opportunity assessment

---

### 7. **Brand Simulator** (BrandSimulatorPage)
**Purpose:** Test marketing scenarios and variations

**What it does:**
- Takes brand DNA + campaign goal
- Generates multiple variations of:
  - Messaging angles
  - Visual approaches
  - Tone variations
  - Channel-specific adaptations
- Shows performance predictions
- A/B testing recommendations

---

### 8. **Site Builder / Website Generation** (SiteBuilderPage)
See Website Builder section above

---

### 9. **Scheduler** (SchedulerPage)
**Purpose:** Schedule and automate content posting across channels

**What it does:**
- Create posting schedules for campaigns
- Optimal time recommendations (per platform/audience)
- Bulk schedule assets
- Zapier/n8n workflow integration
- Post performance tracking
- Auto-retry on failure

---

### 10. **Automations** (AutomationsPage)
**Purpose:** Connect workflows with n8n for advanced automation

**What it does:**
- Configure automated workflows:
  - On extraction → auto-generate campaign
  - On campaign creation → auto-schedule posts
  - On lead finding → auto-send outreach email
  - Custom workflows via n8n
- Webhook integrations
- Conditional logic (if/then)
- Integration with 100+ external services

---

### 11. **Agent Forge** (AgentForgePage)
**Purpose:** Create and configure custom AI agents

**What it does:**
- Define custom AI personas
- Set agent guardrails (restrictions, required phrases)
- Configure agent role (support, sales, content_guardian, creative_director)
- Train agents on brand voice
- Test agent responses
- Deploy to chatbot/customer service

---

### 12. **Affiliate Hub** (AffiliateHubPage)
**Purpose:** Manage affiliate partnerships and referral programs

**What it does:**
- Generate affiliate links
- Track referrals and commissions
- Manage affiliate tiers
- Create promotional materials
- Performance analytics
- Payout management

---

### 13. **Live Sessions** (LiveSessionPage)
**Purpose:** Real-time collaboration and presentation mode

**What it does:**
- Share live brand analysis sessions
- Real-time updating as changes happen
- Presentation mode for client demos
- Multi-user viewing (read-only)
- Screen share integration

---

### 14. **Sonic Lab** (SonicLabPage)
**Purpose:** Advanced voice/audio experiments and testing

**What it does:**
- Voice model training
- Audio asset generation
- Sonic branding experiments
- Audio logo creation
- Voice synthesis variations

---

### 15. **Settings Page** (SettingsPage)
**Purpose:** Configure API keys, preferences, and advanced features

**Sections:**

#### A. **API Keys Configuration**
- **70+ LLM Providers:** OpenAI, Claude, Gemini, Mistral, Groq, DeepSeek, XAI, Together, OpenRouter, Perplexity, Qwen, Cohere, Meta Llama, Microsoft Azure, Ollama, SambaNova, Cerebras, Hyperbolic, Nebius, AWS Bedrock, Replicate, Friendli, Dify, Venice, Hugging Face, etc.
- **20+ Image Providers:** DALL-E, Stable Diffusion, Midjourney, Flux, Leonardo, Recraft, Adobe, Amazon, etc.
- **15+ Voice/TTS Providers:** ElevenLabs, OpenAI, PlayHT, Cartesia, Deepgram, Google TTS, Azure, etc.
- **20+ Video Providers:** Sora 2, Veo 3, Runway, Kling, Luma, LTX 2, HunYuan, Pika, Synthesia, etc.

#### B. **Theme & Preferences**
- Dark/Light/System theme
- Data collection preferences
- Privacy settings
- White-label configuration (Agency tier)

#### C. **Advanced AI Features**
- **RLM (Recursive Language Model)**
  - Enable/disable
  - Root model selection
  - Max recursion depth
  - Context window size
  
- **Inference Engine**
  - Speculative decoding (faster responses)
  - Self-consistency (multiple samples for reliability)
  - Skeleton of Thought (structured reasoning)
  - Chain of Verification (fact-checking)

#### D. **Provider Management**
- Enable/disable providers
- Set default models per provider
- Configure custom endpoints
- Health checks per provider

---

### 16. **Dashboard** (DashboardPage)
**Purpose:** Central hub for all extracted brands and analytics

**Sections:**

#### Portfolio Management
- Browse all saved brand profiles
- Sort by date (newest/oldest)
- Delete profiles
- Share public links
- View confidence scores

#### Trend Pulse
- Real-time trending topics relevant to brand
- 3 trending topics with:
  - Relevance score (1-100)
  - Topic summary
  - Suggested brand angle
  - One-click campaign generation

#### Performance Metrics (6-month analytics)
- Sentiment trend chart
- Campaign velocity
- Asset volume
- Engagement metrics
- Market share estimation

#### User Profile Section
- User tier/plan
- Usage statistics
- Upcoming features for tier
- Upgrade options

---

### 17. **Shared Profiles** (SharedProfilePage)
**Purpose:** Public read-only brand profile sharing

**What it does:**
- Generate shareable links for profiles
- Public viewers can see full brand analysis
- No editing permissions
- Analytics on who viewed profile
- Embeddable widget
- Public showcase

---

## 🔧 Technology Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for bundling
- **Framer Motion** for animations
- **Recharts** for data visualization
- **React Router** for navigation
- **Tailwind CSS** for styling

### Backend/Storage
- **Supabase** (PostgreSQL database)
- **localStorage** (client-side caching)
- **REST APIs** for AI providers

### AI Integrations (70+ Providers)
- LLM: OpenAI, Anthropic, Google, Mistral, Groq, etc.
- Images: DALL-E, Stable Diffusion, Midjourney, Flux, etc.
- Voice: ElevenLabs, OpenAI TTS, PlayHT, etc.
- Video: Sora, Runway, Kling, Luma, etc.
- Automation: n8n, Zapier, Make, etc.

### Authentication
- Supabase Auth (Google/Email login)
- JWT tokens
- Row-level security (RLS) policies

### APIs Used
- Web Speech API (voice recognition)
- Geolocation API (location-based services)
- HTML2Canvas (screenshot generation)
- jsPDF (PDF export)
- JSZip (file compression)

---

## 📈 Data Flow

```
User Input
    ↓
[Brand DNA Extraction]
    ↓ Saves to localStorage
[Extracted BrandDNA Object]
    ↓
[Campaign Generation] → Generates CampaignAssets
    ↓ Saves to localStorage
[Website Builder] → Generates HTML/CSS/JS
    ↓
[Deployment] → Rocket.new or Firebase
    ↓
[Live Website]
    
Parallel: [Lead Hunter] → LeadProfiles
Parallel: [Battle Mode] → BattleReport
Parallel: [Automations] → n8n Workflows
Parallel: [Sonic Co-Pilot] → Logs to Supabase
```

---

## 🔐 Security & Privacy

- **BYOK (Bring Your Own Keys):** Users provide their own API keys, stored in localStorage only
- **No API key storage on servers**
- **Supabase RLS:** Row-level security for user data
- **Encryption:** TLS for all API communications
- **Audit Logging:** Sonic Co-Pilot actions logged (optional)
- **GDPR Compliant:** Data deletion on request
- **No tracking:** Optional data collection preference

---

## 📊 Key Data Structures

### BrandDNA
```typescript
{
  id: string,
  name: string,
  tagline: string,
  description: string,
  mission: string,
  elevatorPitch: string,
  websiteUrl: string,
  createdAt: number,
  values: string[],
  keyMessaging: string[],
  colors: BrandColor[],
  fonts: BrandFont[],
  toneOfVoice: { adjectives: string[], description: string },
  brandPersonality: string[],
  targetAudience: string,
  personas: Persona[],
  swot: { strengths, weaknesses, opportunities, threats },
  competitors: Competitor[],
  confidenceScores: { visuals, strategy, tone, overall },
  ...
}
```

### CampaignAsset
```typescript
{
  id: string,
  type: 'social' | 'email' | 'ad' | 'video' | 'blog',
  channel: string,
  title: string,
  content: string,
  imagePrompt: string,
  imageUrl: string,
  videoUrl: string,
  scheduledAt: string,
  syncStatus: 'pending' | 'syncing' | 'synced' | 'error'
}
```

### LeadProfile
```typescript
{
  id: string,
  name: string,
  address: string,
  rating: number,
  website: string,
  contactInfo: { email, phone, socials },
  gapAnalysis: { missingWebsite, lowRating, socialSilence, opportunity }
}
```

---

## ⚡ Performance Features

- **Caching:** LocalStorage for fast profile access
- **Lazy Loading:** Pages load on demand
- **Image Optimization:** Responsive images, WebP support
- **Debouncing:** Form inputs debounced to reduce API calls
- **Concurrent Requests:** Parallel API calls for speed
- **Progressive Loading:** Show results as they arrive

---

## 🎯 Use Cases

### For Agencies
- Extract client brand DNA
- Generate 100+ campaign assets monthly
- Deploy client websites instantly
- Automate content distribution
- White-label to clients

### For Solo Creators
- Analyze personal brand
- Generate content ideas monthly
- Automate social posting
- Find collaboration partners
- Voice command workflow automation

### For SaaS Companies
- Competitive brand analysis
- Campaign A/B testing
- Website variations
- Viral trend detection
- Automated outreach at scale

### For Sales Teams
- Lead hunting with contact info
- Personalized outreach campaigns
- Battle mode for competitive intel
- Prospecting automation

---

## 📊 Metrics Tracked

- Extractions per month (tier limit)
- Campaign assets generated
- Websites deployed
- Leads found
- Lead conversion rates
- Content performance
- Sonic Co-Pilot usage
- Feature adoption per tier

---

## 🚀 Future Roadmap (Implied)

- Real-time brand monitoring
- Social media listening integration
- Predictive analytics
- AI-powered A/B testing
- More video generation models
- Real-time collaboration (multi-user editing)
- Mobile app
- Blockchain verification for authenticity

---

## Summary

**CoreDNA2 = Brand Intelligence OS**

A complete platform for analyzing brands, generating marketing content, building websites, finding leads, and automating marketing workflows—all powered by 70+ AI providers and voice commands.

**Key Differentiator:** Users bring their own API keys (BYOK) → No subscription required for individual AI providers → Infinite scalability at user's cost

**Business Model:** SaaS with tier-based features, with no lock-in on AI providers (users can switch anytime)
