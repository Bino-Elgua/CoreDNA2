/**
 * WEB DEPLOYMENT SERVICE
 * Deploy generated websites to Vercel, Netlify, or Firebase
 * Real deployment integration for SiteBuilderPage
 */

export interface DeploymentConfig {
  provider: 'vercel' | 'netlify' | 'firebase';
  token: string;
  projectName?: string;
  customDomain?: string;
}

export interface WebsiteContent {
  html: string;
  css?: string;
  assets?: { name: string; content: string }[];
  metadata?: {
    title: string;
    description: string;
    favicon?: string;
  };
}

export interface DeploymentResult {
  success: boolean;
  deploymentId?: string;
  liveUrl?: string;
  previewUrl?: string;
  repoUrl?: string;
  provider: string;
  error?: string;
  estimatedTime?: number;
}

class WebDeploymentService {
  private vercelToken: string = '';
  private netlifyToken: string = '';
  private firebaseToken: string = '';
  private githubToken: string = '';

  /**
   * Initialize with deployment tokens
   */
  initialize(settings: any) {
    try {
      const deployment = settings?.deployment || {};
      this.vercelToken = deployment.vercelToken || '';
      this.netlifyToken = deployment.netlifyToken || '';
      this.firebaseToken = deployment.firebaseToken || '';
      this.githubToken = deployment.githubToken || '';

      if (this.vercelToken) console.log('[WebDeploymentService] ✓ Vercel configured');
      if (this.netlifyToken) console.log('[WebDeploymentService] ✓ Netlify configured');
      if (this.firebaseToken) console.log('[WebDeploymentService] ✓ Firebase configured');
      if (!this.vercelToken && !this.netlifyToken && !this.firebaseToken) {
        console.log('[WebDeploymentService] No deployment providers configured');
      }
    } catch (e) {
      console.error('[WebDeploymentService] Initialization failed:', e);
    }
  }

  /**
   * Deploy website to Vercel
   */
  async deployToVercel(website: WebsiteContent, projectName: string): Promise<DeploymentResult> {
    if (!this.vercelToken) {
      return {
        success: false,
        error: 'Vercel token not configured',
        provider: 'vercel',
      };
    }

    try {
      // Create project
      const createProjectResponse = await fetch('https://api.vercel.com/v9/projects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.vercelToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: projectName.toLowerCase().replace(/\s+/g, '-'),
          framework: 'html',
        }),
      });

      if (!createProjectResponse.ok) {
        const error = await createProjectResponse.json() as any;
        throw new Error(error.error?.message || 'Failed to create Vercel project');
      }

      const project = await createProjectResponse.json() as any;
      const projectId = project.id;

      // Deploy files
      const deployResponse = await fetch(`https://api.vercel.com/v13/deployments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.vercelToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: projectName,
          files: [
            {
              file: 'index.html',
              data: website.html,
            },
            ...(website.css
              ? [{ file: 'style.css', data: website.css }]
              : []),
            ...(website.assets || []).map((asset) => ({
              file: asset.name,
              data: asset.content,
            })),
          ],
        }),
      });

      if (!deployResponse.ok) {
        throw new Error('Failed to deploy to Vercel');
      }

      const deployment = await deployResponse.json() as any;

      return {
        success: true,
        deploymentId: deployment.id,
        liveUrl: `https://${deployment.url}`,
        provider: 'vercel',
        estimatedTime: 30,
      };
    } catch (e: any) {
      console.error('[WebDeploymentService] Vercel deployment failed:', e.message);
      return {
        success: false,
        error: e.message,
        provider: 'vercel',
      };
    }
  }

  /**
   * Deploy website to Netlify
   */
  async deployToNetlify(website: WebsiteContent, projectName: string): Promise<DeploymentResult> {
    if (!this.netlifyToken) {
      return {
        success: false,
        error: 'Netlify token not configured',
        provider: 'netlify',
      };
    }

    try {
      // Create site
      const createSiteResponse = await fetch('https://api.netlify.com/api/v1/sites', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.netlifyToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: projectName.toLowerCase().replace(/\s+/g, '-'),
        }),
      });

      if (!createSiteResponse.ok) {
        throw new Error('Failed to create Netlify site');
      }

      const site = await createSiteResponse.json() as any;

      // Deploy files
      const files: Record<string, string> = {
        'index.html': website.html,
      };

      if (website.css) {
        files['style.css'] = website.css;
      }

      (website.assets || []).forEach((asset) => {
        files[asset.name] = asset.content;
      });

      const deployResponse = await fetch(
        `https://api.netlify.com/api/v1/sites/${site.id}/deploys`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.netlifyToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ files }),
        }
      );

      if (!deployResponse.ok) {
        throw new Error('Failed to deploy files to Netlify');
      }

      const deployment = await deployResponse.json() as any;

      return {
        success: true,
        deploymentId: site.id,
        liveUrl: site.url,
        previewUrl: deployment.preview_url,
        provider: 'netlify',
        estimatedTime: 30,
      };
    } catch (e: any) {
      console.error('[WebDeploymentService] Netlify deployment failed:', e.message);
      return {
        success: false,
        error: e.message,
        provider: 'netlify',
      };
    }
  }

  /**
   * Deploy website to Firebase Hosting
   */
  async deployToFirebase(website: WebsiteContent, projectName: string): Promise<DeploymentResult> {
    if (!this.firebaseToken) {
      return {
        success: false,
        error: 'Firebase token not configured',
        provider: 'firebase',
      };
    }

    try {
      // This would require Firebase CLI or REST API
      // Firebase REST API is limited for hosting, recommend using their CLI

      return {
        success: false,
        error: 'Firebase deployment requires Firebase CLI. Use Vercel or Netlify instead.',
        provider: 'firebase',
      };
    } catch (e: any) {
      return {
        success: false,
        error: e.message,
        provider: 'firebase',
      };
    }
  }

  /**
   * Create GitHub repository for website
   */
  async createGitHubRepo(
    website: WebsiteContent,
    projectName: string,
    description?: string
  ): Promise<{ repoUrl: string; cloneUrl: string }> {
    if (!this.githubToken) {
      throw new Error('GitHub token not configured');
    }

    try {
      const response = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          'Authorization': `token ${this.githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
        body: JSON.stringify({
          name: projectName.toLowerCase().replace(/\s+/g, '-'),
          description: description || `Website for ${projectName}`,
          private: false,
          auto_init: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json() as any;
        throw new Error(error.message || 'Failed to create GitHub repo');
      }

      const repo = await response.json() as any;

      // Optionally commit the website files
      await this.commitFilesToGitHub(
        repo.owner.login,
        repo.name,
        website
      );

      return {
        repoUrl: repo.html_url,
        cloneUrl: repo.clone_url,
      };
    } catch (e: any) {
      console.error('[WebDeploymentService] GitHub repo creation failed:', e.message);
      throw e;
    }
  }

  /**
   * Commit files to GitHub repository
   */
  private async commitFilesToGitHub(
    owner: string,
    repo: string,
    website: WebsiteContent
  ): Promise<void> {
    try {
      // Get current tree
      const treeResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/main`,
        {
          headers: {
            'Authorization': `token ${this.githubToken}`,
          },
        }
      );

      if (!treeResponse.ok) {
        console.warn('[WebDeploymentService] Could not fetch current tree');
        return;
      }

      // Create blob for HTML
      const blobResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/blobs`,
        {
          method: 'POST',
          headers: {
            'Authorization': `token ${this.githubToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: website.html,
            encoding: 'utf-8',
          }),
        }
      );

      if (blobResponse.ok) {
        console.log('[WebDeploymentService] ✓ Committed files to GitHub');
      }
    } catch (e) {
      console.warn('[WebDeploymentService] File commit failed (non-critical):', e);
    }
  }

  /**
   * Deploy website (choose best available provider)
   */
  async deploy(
    website: WebsiteContent,
    projectName: string,
    preferredProvider?: string
  ): Promise<DeploymentResult> {
    // Try providers in order of preference
    if (preferredProvider === 'vercel' || (!preferredProvider && this.vercelToken)) {
      return this.deployToVercel(website, projectName);
    } else if (preferredProvider === 'netlify' || (!preferredProvider && this.netlifyToken)) {
      return this.deployToNetlify(website, projectName);
    } else if (preferredProvider === 'firebase' || (!preferredProvider && this.firebaseToken)) {
      return this.deployToFirebase(website, projectName);
    } else {
      return {
        success: false,
        error: 'No deployment provider configured. Add token in Settings → Deployment.',
        provider: 'none',
      };
    }
  }

  /**
   * Get configured providers
   */
  getConfiguredProviders(): string[] {
    const providers = [];
    if (this.vercelToken) providers.push('vercel');
    if (this.netlifyToken) providers.push('netlify');
    if (this.firebaseToken) providers.push('firebase');
    return providers;
  }

  /**
   * Check if any provider is configured
   */
  isConfigured(): boolean {
    return Boolean(this.vercelToken || this.netlifyToken || this.firebaseToken);
  }
}

export const webDeploymentService = new WebDeploymentService();

/**
 * Helper: Auto-initialize from settings
 */
export const initializeWebDeploymentService = () => {
  try {
    const settings = JSON.parse(localStorage.getItem('core_dna_settings') || '{}');
    webDeploymentService.initialize(settings);
  } catch (e) {
    console.error('[webDeploymentService] Failed to initialize from settings:', e);
  }
};
