/**
 * STORAGE ADAPTER SERVICE
 * Unified interface for all data persistence (localStorage → hybridStorage migration)
 * 
 * GOAL: Drop-in replacement for portfolioService that uses hybridStorage when available
 * FALLBACK: portfolioService (localStorage) when hybridStorage not ready
 */

import { ComprehensivePortfolio, PortfolioCreateRequest } from '../types-portfolio';
import { hybridStorage } from './hybridStorageService';
import { 
  getPortfolios as getPortfoliosLocal,
  createPortfolio as createPortfolioLocal,
  updatePortfolio as updatePortfolioLocal,
  deletePortfolio as deletePortfolioLocal,
  getPortfolio as getPortfolioLocal,
} from './portfolioService';
import { authService } from './authService';

class StorageAdapter {
  private useHybrid: boolean = false;
  private initialized: boolean = false;

  constructor() {
    this.init();
  }

  private init() {
    try {
      const user = authService.getCurrentUser();
      if (user?.id) {
        hybridStorage.setUserId(user.id);
        this.useHybrid = true;
        console.log('[StorageAdapter] ✓ Using hybrid storage (cloud sync enabled)');
      } else {
        console.log('[StorageAdapter] Using localStorage fallback (anonymous user)');
      }
      this.initialized = true;
    } catch (e) {
      console.error('[StorageAdapter] Initialization error:', e);
      this.useHybrid = false;
    }
  }

  /**
   * Get all portfolios
   * Hybrid: Loads from Supabase with localStorage fallback
   * Fallback: Loads from localStorage
   */
  async getPortfolios(): Promise<ComprehensivePortfolio[]> {
    try {
      if (this.useHybrid) {
        return await hybridStorage.loadPortfolios();
      } else {
        return getPortfoliosLocal();
      }
    } catch (e) {
      console.error('[StorageAdapter] getPortfolios failed:', e);
      return getPortfoliosLocal(); // Always fallback to local
    }
  }

  /**
   * Get single portfolio
   */
  async getPortfolio(id: string): Promise<ComprehensivePortfolio | null> {
    try {
      if (this.useHybrid) {
        return await hybridStorage.loadPortfolios().then(
          portfolios => portfolios.find(p => p.id === id) || null
        );
      } else {
        return getPortfolioLocal(id);
      }
    } catch (e) {
      console.error('[StorageAdapter] getPortfolio failed:', e);
      return getPortfolioLocal(id);
    }
  }

  /**
   * Create new portfolio
   */
  async createPortfolio(request: PortfolioCreateRequest): Promise<ComprehensivePortfolio> {
    try {
      const portfolio = createPortfolioLocal(request);
      
      if (this.useHybrid) {
        // Save to hybrid storage (async, don't await to avoid blocking UI)
        hybridStorage.savePortfolio(portfolio).catch(e =>
          console.error('[StorageAdapter] Hybrid save failed:', e)
        );
      }
      
      return portfolio;
    } catch (e) {
      console.error('[StorageAdapter] createPortfolio failed:', e);
      throw e;
    }
  }

  /**
   * Update existing portfolio
   */
  async updatePortfolio(id: string, updates: Partial<ComprehensivePortfolio>): Promise<ComprehensivePortfolio> {
    try {
      const updated = updatePortfolioLocal(id, updates);
      
      if (this.useHybrid) {
        hybridStorage.savePortfolio(updated).catch(e =>
          console.error('[StorageAdapter] Hybrid update failed:', e)
        );
      }
      
      return updated;
    } catch (e) {
      console.error('[StorageAdapter] updatePortfolio failed:', e);
      throw e;
    }
  }

  /**
   * Delete portfolio
   */
  async deletePortfolio(id: string): Promise<void> {
    try {
      deletePortfolioLocal(id);
      
      if (this.useHybrid) {
        hybridStorage.deletePortfolio(id).catch(e =>
          console.error('[StorageAdapter] Hybrid delete failed:', e)
        );
      }
    } catch (e) {
      console.error('[StorageAdapter] deletePortfolio failed:', e);
      throw e;
    }
  }

  /**
   * Add campaign to portfolio
   */
  async addCampaign(portfolioId: string, campaign: any): Promise<void> {
    try {
      const portfolio = await this.getPortfolio(portfolioId);
      if (!portfolio) throw new Error('Portfolio not found');
      
      const updated = {
        ...portfolio,
        campaigns: [...(portfolio.campaigns || []), campaign]
      };
      
      await this.updatePortfolio(portfolioId, updated);
    } catch (e) {
      console.error('[StorageAdapter] addCampaign failed:', e);
      throw e;
    }
  }

  /**
   * Add leads to portfolio
   */
  async addLeads(portfolioId: string, leads: any[]): Promise<void> {
    try {
      const portfolio = await this.getPortfolio(portfolioId);
      if (!portfolio) throw new Error('Portfolio not found');
      
      const updated = {
        ...portfolio,
        leads: [...(portfolio.leads || []), ...leads]
      };
      
      await this.updatePortfolio(portfolioId, updated);
    } catch (e) {
      console.error('[StorageAdapter] addLeads failed:', e);
      throw e;
    }
  }

  /**
   * Get sync status
   */
  getSyncStatus() {
    if (this.useHybrid) {
      return hybridStorage.getSyncStatus();
    }
    return {
      isOnline: navigator.onLine,
      isSyncing: false,
      lastSync: null,
      pendingOperations: 0,
      isHealthy: true,
    };
  }

  /**
   * Force sync
   */
  async forceSync(): Promise<void> {
    if (this.useHybrid) {
      await hybridStorage.syncAllQueued();
    }
  }

  /**
   * Check if using cloud storage
   */
  isUsingCloud(): boolean {
    return this.useHybrid;
  }

  /**
   * Re-initialize (call after login)
   */
  reinitialize(): void {
    this.init();
  }
}

export const storageAdapter = new StorageAdapter();

/**
 * Helper: Initialize storage after auth changes
 */
export const initializeStorageAfterAuth = () => {
  storageAdapter.reinitialize();
};
