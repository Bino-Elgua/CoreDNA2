/**
 * PORTFOLIO SERVICE
 * Manages comprehensive portfolios - the core entity of the application
 * All features (campaigns, leads, assets) feed into portfolios
 */

import { BrandDNA, SavedCampaign } from '../types';
import { 
  ComprehensivePortfolio, 
  PortfolioCreateRequest, 
  PortfolioUpdateRequest,
  PortfolioUpdate,
  PortfolioAsset,
  PortfolioLead,
  PortfolioNote,
  PortfolioIntegration
} from '../types-portfolio';

const PORTFOLIO_STORAGE_KEY = 'core_dna_portfolios';

/**
 * Get all portfolios for current user
 */
export const getPortfolios = (): ComprehensivePortfolio[] => {
  try {
    const stored = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
    if (!stored) {
      console.log('[portfolioService] No portfolios in storage');
      return [];
    }
    const portfolios = JSON.parse(stored);
    if (!Array.isArray(portfolios)) {
      console.warn('[portfolioService] Stored portfolios is not an array');
      return [];
    }
    // Filter out any invalid entries
    return portfolios.filter(p => p && typeof p === 'object' && p.id);
  } catch (error) {
    console.error('[portfolioService] Error loading portfolios:', error);
    return [];
  }
};

/**
 * Get single portfolio by ID
 */
export const getPortfolio = (portfolioId: string): ComprehensivePortfolio | null => {
  const portfolios = getPortfolios();
  return portfolios.find(p => p.id === portfolioId) || null;
};

/**
 * Create new comprehensive portfolio from Brand DNA
 */
export const createPortfolio = (request: PortfolioCreateRequest): ComprehensivePortfolio => {
  try {
    // Validate input
    if (!request || typeof request !== 'object') {
      throw new Error('Invalid portfolio request: must be a non-null object');
    }
    if (!request.companyName || typeof request.companyName !== 'string') {
      throw new Error('companyName is required and must be a string');
    }
    if (!request.brandDNA || !request.brandDNA.id) {
      throw new Error('Valid Brand DNA is required');
    }

    const now = Date.now();
    const portfolioId = `portfolio_${now}`;

    const portfolio: ComprehensivePortfolio = {
      // Core identifiers
      id: portfolioId,
      companyName: request.companyName,
      companyWebsite: request.companyWebsite,
      industry: request.industry,
      createdAt: now,
      updatedAt: now,

      // Brand DNA
      brandDNA: request.brandDNA,
      dnaVersionHistory: [{
        version: 1,
        timestamp: now,
        dna: request.brandDNA,
        changes: 'Initial extraction'
      }],

      // Empty collections (will be populated as portfolio grows)
      campaigns: [],
      assets: [],
      leads: [],
      integrations: [],
      metrics: {
        extractionsCount: 1,
        campaignsGenerated: 0,
        assetsCreated: 0,
        lastActivityAt: now
      },
      activityFeed: [{
        id: `update_${now}`,
        timestamp: now,
        type: 'dna_updated',
        title: 'Portfolio Created',
        description: `Created comprehensive portfolio for ${request.companyName}`,
        performedBy: 'system'
      }],
      notes: [],
      tags: [],
      settings: {
        isPublic: false,
        allowCollaborators: true,
        autoSyncLeads: false,
        trackingEnabled: true
      }
    };

    // Save to storage
    const portfolios = getPortfolios();
    portfolios.push(portfolio);
    
    try {
      localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(portfolios));
    } catch (e: any) {
      if (e.name === 'QuotaExceededError') {
        console.error('[portfolioService] ⚠️ Storage quota exceeded - portfolio not saved');
        throw new Error(
          'Storage full. Archive old portfolios to continue. ' +
          'Go to Dashboard and delete unused portfolios.'
        );
      }
      throw e;
    }

    console.log('[portfolioService] ✓ Portfolio created:', portfolioId);
    return portfolio;
  } catch (error: any) {
    console.error('[portfolioService] Error creating portfolio:', error);
    throw error;
  }
};

/**
 * Validate portfolio update data
 */
function validatePortfolioUpdate(updates: any): void {
  if (!updates || typeof updates !== 'object') {
    throw new Error('Invalid update object: must be a non-null object');
  }

  // Validate key fields if present
  if (updates.companyName && typeof updates.companyName !== 'string') {
    throw new Error('companyName must be a string');
  }

  if (updates.brandDNA) {
    if (!updates.brandDNA.id || !updates.brandDNA.name) {
      throw new Error('Invalid Brand DNA structure: missing id or name');
    }
  }

  if (updates.campaigns && !Array.isArray(updates.campaigns)) {
    throw new Error('campaigns must be an array');
  }

  if (updates.metrics) {
    if (typeof updates.metrics !== 'object') {
      throw new Error('metrics must be an object');
    }
  }

  if (updates.activityFeed && !Array.isArray(updates.activityFeed)) {
    throw new Error('activityFeed must be an array');
  }
}

/**
 * Update portfolio with new information
 */
export const updatePortfolio = (portfolioId: string, updates: Partial<ComprehensivePortfolio>): ComprehensivePortfolio | null => {
  try {
    // Validate input
    validatePortfolioUpdate(updates);

    const portfolios = getPortfolios();
    const index = portfolios.findIndex(p => p.id === portfolioId);

    if (index === -1) {
      console.error('[portfolioService] Portfolio not found:', portfolioId);
      return null;
    }

    const portfolio = portfolios[index];
    const now = Date.now();

    // Handle Brand DNA updates with version history
    if (updates.brandDNA && updates.brandDNA.id !== portfolio.brandDNA.id) {
      portfolio.dnaVersionHistory.push({
        version: (portfolio.dnaVersionHistory[portfolio.dnaVersionHistory.length - 1]?.version || 0) + 1,
        timestamp: now,
        dna: updates.brandDNA,
        changes: 'Brand DNA updated'
      });
      portfolio.brandDNA = updates.brandDNA;
    }

    // Merge other updates
    Object.assign(portfolio, {
      ...updates,
      updatedAt: now,
      metrics: {
        ...portfolio.metrics,
        ...(updates.metrics || {}),
        lastActivityAt: now
      }
    });

    // Add to activity feed
    if (updates.brandDNA) {
      portfolio.activityFeed.unshift({
        id: `update_${now}`,
        timestamp: now,
        type: 'dna_updated',
        title: 'Brand DNA Updated',
        description: 'Brand DNA has been refreshed with new information',
        performedBy: 'user'
      });
    }

    portfolios[index] = portfolio;
    
    try {
      localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(portfolios));
    } catch (e: any) {
      if (e.name === 'QuotaExceededError') {
        console.error('[portfolioService] ⚠️ Storage quota exceeded - update not saved');
        // Restore previous state
        portfolios[index] = portfolio;
        throw new Error(
          'Storage full. Archive old portfolios to continue. ' +
          'Go to Dashboard and delete unused portfolios.'
        );
      }
      throw e;
    }

    console.log('[portfolioService] ✓ Portfolio updated:', portfolioId);
    return portfolio;
  } catch (error: any) {
    console.error('[portfolioService] Validation or save error:', error);
    throw error;
  }
};

/**
 * Add campaign to portfolio
 */
export const addCampaignToPortfolio = (portfolioId: string, campaign: SavedCampaign): ComprehensivePortfolio | null => {
  const portfolio = getPortfolio(portfolioId);
  if (!portfolio) return null;

  portfolio.campaigns.push(campaign);
  portfolio.metrics.campaignsGenerated += 1;
  portfolio.metrics.assetsCreated += campaign.assets?.length || 0;

  const now = Date.now();
  portfolio.activityFeed.unshift({
    id: `update_${now}`,
    timestamp: now,
    type: 'campaign_created',
    title: 'Campaign Generated',
    description: `Generated campaign: ${campaign.id}`,
    data: { campaignId: campaign.id, assetCount: campaign.assets?.length || 0 },
    performedBy: 'user'
  });

  return updatePortfolio(portfolioId, portfolio);
};

/**
 * Add asset to portfolio
 */
export const addAssetToPortfolio = (portfolioId: string, asset: PortfolioAsset): ComprehensivePortfolio | null => {
  const portfolio = getPortfolio(portfolioId);
  if (!portfolio) return null;

  portfolio.assets.push(asset);
  portfolio.metrics.assetsCreated += 1;

  const now = Date.now();
  portfolio.activityFeed.unshift({
    id: `update_${now}`,
    timestamp: now,
    type: 'asset_added',
    title: 'Asset Added',
    description: `Added ${asset.type}: ${asset.name}`,
    data: { assetId: asset.id, assetType: asset.type },
    performedBy: 'user'
  });

  return updatePortfolio(portfolioId, portfolio);
};

/**
 * Add lead to portfolio
 */
export const addLeadToPortfolio = (portfolioId: string, lead: PortfolioLead): ComprehensivePortfolio | null => {
  const portfolio = getPortfolio(portfolioId);
  if (!portfolio) return null;

  portfolio.leads.push(lead);

  const now = Date.now();
  portfolio.activityFeed.unshift({
    id: `update_${now}`,
    timestamp: now,
    type: 'lead_added',
    title: 'Lead Added',
    description: `Added lead: ${lead.name} from ${lead.company}`,
    data: { leadId: lead.id, leadName: lead.name },
    performedBy: 'user'
  });

  return updatePortfolio(portfolioId, portfolio);
};

/**
 * Add bulk leads to portfolio
 */
export const addLeadsToPortfolio = (portfolioId: string, leads: PortfolioLead[]): ComprehensivePortfolio | null => {
  const portfolio = getPortfolio(portfolioId);
  if (!portfolio) return null;

  portfolio.leads.push(...leads);

  const now = Date.now();
  portfolio.activityFeed.unshift({
    id: `update_${now}`,
    timestamp: now,
    type: 'lead_added',
    title: 'Leads Imported',
    description: `Imported ${leads.length} leads`,
    data: { leadCount: leads.length },
    performedBy: 'user'
  });

  return updatePortfolio(portfolioId, portfolio);
};

/**
 * Add note to portfolio
 */
export const addNoteToPortfolio = (portfolioId: string, content: string, authorId: string = 'user', authorName?: string): ComprehensivePortfolio | null => {
  const portfolio = getPortfolio(portfolioId);
  if (!portfolio) return null;

  const note: PortfolioNote = {
    id: `note_${Date.now()}`,
    content,
    authorId,
    authorName,
    createdAt: Date.now(),
    isPinned: false
  };

  portfolio.notes.push(note);

  const now = Date.now();
  portfolio.activityFeed.unshift({
    id: `update_${now}`,
    timestamp: now,
    type: 'note_added',
    title: 'Note Added',
    description: content.substring(0, 100),
    performedBy: authorId
  });

  return updatePortfolio(portfolioId, portfolio);
};

/**
 * Connect integration to portfolio
 */
export const connectIntegrationToPortfolio = (portfolioId: string, integration: PortfolioIntegration): ComprehensivePortfolio | null => {
  const portfolio = getPortfolio(portfolioId);
  if (!portfolio) return null;

  portfolio.integrations.push(integration);

  const now = Date.now();
  portfolio.activityFeed.unshift({
    id: `update_${now}`,
    timestamp: now,
    type: 'integration_connected',
    title: 'Integration Connected',
    description: `Connected ${integration.provider} (${integration.type})`,
    data: { integrationId: integration.id, provider: integration.provider },
    performedBy: 'user'
  });

  return updatePortfolio(portfolioId, portfolio);
};

/**
 * Update portfolio metrics
 */
export const updatePortfolioMetrics = (portfolioId: string, metrics: Partial<import('../types-portfolio').PortfolioMetrics>): ComprehensivePortfolio | null => {
  const portfolio = getPortfolio(portfolioId);
  if (!portfolio) return null;

  portfolio.metrics = { ...portfolio.metrics, ...metrics, lastActivityAt: Date.now() };

  return updatePortfolio(portfolioId, { metrics: portfolio.metrics });
};

/**
 * Delete portfolio
 */
export const deletePortfolio = (portfolioId: string): boolean => {
  try {
    console.log('[portfolioService] Deleting portfolio:', portfolioId);
    const portfolios = getPortfolios();
    console.log('[portfolioService] Current portfolios:', portfolios.length);
    const initialLength = portfolios.length;
    const filtered = portfolios.filter(p => p.id !== portfolioId);
    console.log('[portfolioService] After filter:', filtered.length);
    
    if (filtered.length === initialLength) {
      console.warn('[portfolioService] Portfolio not found - no change made');
      return false;
    }
    
    localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(filtered));
    
    // Verify it was actually deleted
    const verify = getPortfolios();
    console.log('[portfolioService] ✓ Portfolio deleted:', portfolioId);
    console.log('[portfolioService] Remaining portfolios:', verify.length);
    return true;
  } catch (error) {
    console.error('[portfolioService] Error deleting portfolio:', error);
    return false;
  }
};

/**
 * Export portfolio data
 */
export const exportPortfolio = (portfolioId: string, format: 'json' | 'csv' = 'json'): string | null => {
  const portfolio = getPortfolio(portfolioId);
  if (!portfolio) return null;

  if (format === 'json') {
    return JSON.stringify(portfolio, null, 2);
  }

  // CSV export for leads and campaigns
  let csv = 'Type,Name,Details,Date\n';
  portfolio.leads.forEach(lead => {
    csv += `Lead,"${lead.name}","${lead.company} - ${lead.email}",${new Date(lead.addedAt).toISOString()}\n`;
  });
  portfolio.campaigns.forEach(camp => {
    csv += `Campaign,"${camp.goal}","${camp.assets?.length || 0} assets",${new Date(camp.timestamp).toISOString()}\n`;
  });

  return csv;
};

/**
 * Sync portfolio from Brand DNA (when DNA is updated)
 */
export const syncPortfolioFromDNA = (portfolioId: string, updatedDNA: BrandDNA): ComprehensivePortfolio | null => {
  const portfolio = getPortfolio(portfolioId);
  if (!portfolio) return null;

  return updatePortfolio(portfolioId, {
    brandDNA: updatedDNA,
    companyName: updatedDNA.name,
    industry: updatedDNA.targetAudience
  });
};

/**
 * Get portfolio activity feed (latest first)
 */
export const getPortfolioActivityFeed = (portfolioId: string, limit: number = 20): PortfolioUpdate[] => {
  const portfolio = getPortfolio(portfolioId);
  if (!portfolio) return [];

  return portfolio.activityFeed.slice(0, limit);
};

/**
 * Search portfolios by name, company, or tag
 */
export const searchPortfolios = (query: string): ComprehensivePortfolio[] => {
  try {
    const portfolios = getPortfolios();
    const lower = query.toLowerCase();

    return portfolios.filter(p => {
      try {
        return (
          (p?.companyName?.toLowerCase() || '').includes(lower) ||
          (p?.brandDNA?.name?.toLowerCase() || '').includes(lower) ||
          (p?.industry?.toLowerCase() || '').includes(lower) ||
          (p?.tags && Array.isArray(p.tags) && p.tags.some(tag => typeof tag === 'string' && tag.toLowerCase().includes(lower)))
        );
      } catch (e) {
        console.error('[searchPortfolios] Error filtering portfolio:', e);
        return false;
      }
    });
  } catch (error) {
    console.error('[searchPortfolios] Error searching portfolios:', error);
    return [];
  }
};

/**
 * Get portfolio stats
 */
export const getPortfolioStats = (portfolioId: string) => {
  const portfolio = getPortfolio(portfolioId);
  if (!portfolio) return null;

  return {
    portfolioId,
    companyName: portfolio.companyName,
    createdAt: new Date(portfolio.createdAt),
    campaignsCount: portfolio.campaigns.length,
    assetsCount: portfolio.assets.length,
    leadsCount: portfolio.leads.length,
    integrationsCount: portfolio.integrations.length,
    dnaVersions: portfolio.dnaVersionHistory.length,
    totalNotes: portfolio.notes.length,
    lastUpdated: new Date(portfolio.updatedAt),
    metrics: portfolio.metrics
  };
};
