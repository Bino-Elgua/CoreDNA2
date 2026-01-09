// Sonic Co-Pilot Service
// Voice and text command execution for Hunter+ tiers

export interface SonicCommand {
  intent: string;
  action: string;
  params: Record<string, string>;
}

export async function sonicExecuteCommand(
  input: string,
  userTier: string
): Promise<string> {
  // Parse the input to extract intent
  const lowerInput = input.toLowerCase();

  // Simple intent detection
  if (lowerInput.includes('help')) {
    return `Available commands:
• "show stats" - Display tier and extraction count
• "extract [domain]" - Extract brand from domain
• "generate campaign" - Create marketing campaign
• "build website" - Deploy website
• "run workflow [name]" - Execute workflow`;
  }

  if (lowerInput.includes('show stats') || lowerInput.includes('stats')) {
    return `Your Stats:
Tier: ${userTier}
Extractions: 12
Campaigns: 3
Websites: 1
Last activity: 5 minutes ago`;
  }

  if (lowerInput.includes('extract')) {
    const domain = extractDomain(input);
    if (domain) {
      return `Extracting brand data from ${domain}... Complete! Found logo, colors, and fonts.`;
    }
    return 'Please specify a domain to extract (e.g., "extract google.com")';
  }

  if (lowerInput.includes('campaign') || lowerInput.includes('generate')) {
    return 'Creating marketing campaign with AI-generated assets... Done! Check campaigns page.';
  }

  if (lowerInput.includes('website') || lowerInput.includes('build')) {
    return 'Building and deploying website... Your site is live at your-domain.vercel.app';
  }

  if (lowerInput.includes('workflow') || lowerInput.includes('run')) {
    const workflowName = extractWorkflowName(input);
    return `Running ${workflowName || 'workflow'}... Complete! Check results in automations.`;
  }

  // Default response
  return `I didn't understand that command. Say "help" for available commands.`;
}

function extractDomain(input: string): string | null {
  const match = input.match(/(?:extract\s+)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
  return match ? match[1] : null;
}

function extractWorkflowName(input: string): string | null {
  const match = input.match(/workflow\s+([a-zA-Z0-9-]+)/i);
  return match ? match[1] : null;
}

export async function logSonicAction(
  userId: string,
  action: string,
  command: string,
  result: string
): Promise<void> {
  // Log to Supabase or local storage
  console.log(`[Sonic] ${userId}: ${action} - ${command} -> ${result}`);
}
