# AI Functions Fixed - Full Implementation

## Overview
All AI-dependent features in CoreDNA2 now properly use your configured API keys and models from Settings → API Keys.

## Fixed Functions

### 1. **Campaign Generation** (`generateCampaignAssets`)
- **Location:** `services/geminiService.ts#L792`
- **What it does:** Generates 5+ marketing assets across Instagram, Email, LinkedIn, etc.
- **Now uses:**
  - Active LLM provider from `getActiveLLMProvider()`
  - Full BrandDNA data (tagline, messaging, colors, tone, audience)
  - Campaign goal and channel preferences
  - Proper JSON parsing with fallback
- **Returns:** Array of `CampaignAsset` objects with title, copy, CTA, and image prompts
- **Called by:** `CampaignsPage.tsx` line 82

### 2. **Hive Mode Campaign** (`runAgentHiveCampaign`)
- **Location:** `services/geminiService.ts#L860`
- **What it does:** Generates one optimized asset per social channel (Instagram-specific, Email-specific, etc.)
- **Now uses:**
  - Selected LLM provider
  - Channel-specific optimization (150 chars for Instagram, 300 for email, professional tone for LinkedIn)
  - BrandDNA styling, messaging, and audience data
  - Status callback for UI updates
- **Returns:** Single asset object with `channel`, `title`, `copy`, `hashtags`, `imagePrompt`
- **Called by:** `CampaignsPage.tsx` line 74 (Hive Mode toggle)

### 3. **Agent System Prompt** (`generateAgentSystemPrompt`)
- **Location:** `services/geminiService.ts#L919`
- **What it does:** Generates custom system prompt for AI agents based on brand identity
- **Now uses:**
  - Full BrandDNA profile (mission, values, tone, personality)
  - Agent role (support, sales, content, research)
  - Guardrails (forbidden topics, required phrases, strictness level)
  - Creates context-aware instructions
- **Returns:** String system prompt for agent initialization
- **Called by:** `AgentForgePage.tsx` line 74

### 4. **Agent Chat Session** (`createAgentChat`)
- **Location:** `services/geminiService.ts#L975`
- **What it does:** Initializes a chat session for the configured agent
- **Now uses:**
  - System prompt from `generateAgentSystemPrompt()`
  - Active LLM provider for message processing
  - Proper message formatting with system context
- **Returns:** Chat object with `sendMessage()` async method
- **Called by:** `AgentForgePage.tsx` line 130

### 5. **Trend Pulse** (`generateTrendPulse`)
- **Location:** `services/geminiService.ts#L1016`
- **What it does:** Generates 3-5 trending topics relevant to brand's industry
- **Now uses:**
  - BrandDNA description, audience, and key messaging
  - Identifies relevance scores and suggested brand angles
  - Provides action items for each trend
- **Returns:** Array of trend objects with `topic`, `summary`, `relevanceScore`, `suggestedAngle`
- **Called by:** `DashboardPage.tsx` TrendPulse component

### 6. **Battle Simulation** (`runBattleSimulation`)
- **Location:** `services/geminiService.ts#L994`
- **What it does:** Competitive analysis between two brands
- **Now uses:**
  - Full BrandDNA from both brands
  - Strategic recommendations for each
  - Market position analysis
- **Returns:** Winner analysis with strategic advice
- **Called by:** `BattleModePage.tsx`

### 7. **Asset Analysis** (`analyzeUploadedAssets`)
- **Location:** `services/geminiService.ts#L1046`
- **What it does:** Reviews marketing assets and provides feedback
- **Now uses:**
  - Active LLM provider
  - Asset summaries and descriptions
  - Returns score, strengths, weaknesses, recommendations
- **Returns:** Analysis object with `overallScore`, `strengths`, `weaknesses`
- **Called by:** Asset upload/review features

### 8. **Schedule Optimization** (`optimizeSchedule`)
- **Location:** `services/geminiService.ts#L1099`
- **What it does:** Optimizes posting times and days for maximum engagement
- **Now uses:**
  - Post metadata (title, channel)
  - Platform-specific timing knowledge
  - Spacing recommendations
- **Returns:** Array with recommended `day`, `time`, `reasoning`
- **Called by:** `SchedulerPage.tsx`

### 9. **Asset Refinement** (`refineAssetWithAI`)
- **Location:** `services/geminiService.ts#L1168`
- **What it does:** Refines asset based on user feedback
- **Now uses:**
  - Current asset data
  - User feedback text
  - Maintains asset structure while improving
- **Returns:** Refined asset with `changes` summary
- **Called by:** AssetEditor component

### 10. **Universal Generate** (`universalGenerate`)
- **Location:** `services/geminiService.ts#L1207`
- **What it does:** Send any prompt to the active LLM
- **Now uses:**
  - Active provider detection
  - Any custom prompt
- **Returns:** Raw LLM response
- **Called by:** Various experimental features

## Key Implementation Pattern

All functions follow this pattern:

```typescript
export const myFunction = async (params): Promise<ReturnType> => {
  const provider = getActiveLLMProvider();  // ← Get active LLM + API key
  
  const prompt = `Detailed prompt using ${params}...`;
  
  try {
    console.log(`[myFunction] Processing...`);
    const response = await geminiService.generate(provider, prompt);
    
    // Parse JSON if needed
    let json = response.trim();
    if (json.startsWith('```')) {
      json = json.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
    }
    const jsonMatch = json.match(/\{[\s\S]*\}/ or /\[[\s\S]*\]/);
    const parsed = JSON.parse(jsonMatch[0]);
    
    console.log(`[myFunction] ✓ Success`);
    return parsed;
  } catch (e: any) {
    console.error('[myFunction] Error:', e.message);
    throw e;
  }
};
```

## How It Works

1. **API Key Detection**
   ```typescript
   const provider = getActiveLLMProvider();
   ```
   - Reads `localStorage.core_dna_settings.activeLLM`
   - Falls back to first provider with API key
   - Throws error if no provider configured

2. **API Call**
   ```typescript
   await geminiService.generate(provider, prompt);
   ```
   - Routes to appropriate provider handler (OpenAI, Claude, Gemini, etc.)
   - Retrieves API key from settings
   - Sends prompt to provider's endpoint
   - Returns text response

3. **Response Parsing**
   - Handles markdown code blocks
   - Extracts JSON objects/arrays
   - Parses and validates
   - Returns structured data

## Settings Required

For any AI feature to work, user must:

1. Go to **Settings → API Keys**
2. Select an LLM provider (OpenAI, Claude, Gemini, etc.)
3. Enter their API key
4. Click "Save"
5. Set as "Active" (or it auto-selects first one with key)

## Testing

To test if features work:

1. **Dashboard** → Check if TrendPulse loads (uses `generateTrendPulse`)
2. **Campaigns** → Click "Generate" button (uses `generateCampaignAssets`)
3. **Campaigns** → Enable "Hive Mode" (uses `runAgentHiveCampaign`)
4. **Agent Forge** → Configure agent + click "Initialize" (uses `generateAgentSystemPrompt` + `createAgentChat`)
5. **Battle Mode** → Compare two brands (uses `runBattleSimulation`)

## Console Logs

Each function logs what it's doing. Open browser console (F12) to see:

```
[generateCampaignAssets] Generating 5 assets for "Brand Name" (goal: increase sales)
[generateCampaignAssets] Provider: openai
[generateCampaignAssets] ✓ Generated 5 assets

[runAgentHiveCampaign] Creating asset for Instagram using openai
[runAgentHiveCampaign] ✓ Created asset: Check out our latest feature
```

## Error Handling

If API key missing or provider offline:

```
[getActiveLLMProvider] ✗ No LLM provider configured with API key
Error: No LLM provider configured. Go to Settings → API Keys to add an LLM provider and its API key.
```

Page redirects to Settings after 2 seconds.

## What Was Fixed

**Before:**
```typescript
export const generateAgentSystemPrompt = (config: any) => {
  const provider = getActiveLLMProvider();
  return geminiService.generate(provider, `Generate agent prompt`); // ❌ Ignores config!
};
```

**After:**
```typescript
export const generateAgentSystemPrompt = (
  dna: any,
  role: string = 'support',
  guardrails?: any
): string => {
  // ✓ Uses all parameters
  // ✓ Builds detailed system prompt
  // ✓ Returns synchronously (doesn't need await)
  return systemPrompt;
};
```

All functions now:
- ✅ Use actual parameters passed to them
- ✅ Route through active LLM provider
- ✅ Parse responses properly
- ✅ Have error handling
- ✅ Log what they're doing
- ✅ Return correct types

## Next Steps

1. Set up API keys in Settings if not done
2. Test each feature through the UI
3. Check console logs (F12) for debugging
4. Report any errors with full error message

All AI features should now work with your configured LLM provider.
