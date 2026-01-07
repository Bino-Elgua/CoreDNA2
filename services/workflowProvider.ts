/**
 * Workflow Provider Abstraction
 * Allows flexible integration with any automation/workflow API
 * Supports n8n, Make.com, Zapier, or custom APIs
 */

export interface WorkflowProviderConfig {
    type: 'n8n' | 'make' | 'zapier' | 'custom';
    baseUrl?: string;
    apiKey: string;
    webhookUrl?: string;
}

export interface WorkflowExecutionRequest {
    workflowId: string;
    name: string;
    input: Record<string, any>;
    timeout?: number;
}

export interface WorkflowExecutionResponse {
    executionId: string;
    status: 'success' | 'pending' | 'error';
    result?: any;
    error?: string;
    duration: number;
}

export interface WorkflowHealth {
    status: 'healthy' | 'degraded' | 'offline';
    uptime: number;
    lastCheck: number;
    version?: string;
    provider?: string;
}

export interface IWorkflowProvider {
    checkHealth(): Promise<WorkflowHealth>;
    executeWorkflow(request: WorkflowExecutionRequest): Promise<WorkflowExecutionResponse>;
    listWorkflows(): Promise<Array<{ id: string; name: string; description: string; active: boolean }>>;
    getWorkflow(workflowId: string): Promise<any>;
    getEditUrl(workflowId: string): string;
    getProviderName(): string;
    isConfigured(): boolean;
}

/**
 * Loads the appropriate workflow provider based on config
 */
export class WorkflowProviderFactory {
    static createProvider(config: WorkflowProviderConfig): IWorkflowProvider {
        switch (config.type) {
            case 'n8n':
                return new N8nProvider(config);
            case 'make':
                return new MakeProvider(config);
            case 'zapier':
                return new ZapierProvider(config);
            case 'custom':
                return new CustomProvider(config);
            default:
                return new N8nProvider(config);
        }
    }
}

/**
 * n8n Provider Implementation
 */
class N8nProvider implements IWorkflowProvider {
    private baseUrl: string;
    private apiKey: string;
    private isHealthy = true;
    private lastHealthCheck = Date.now();

    constructor(config: WorkflowProviderConfig) {
        this.baseUrl = config.baseUrl || import.meta.env.VITE_N8N_API_URL || 'http://localhost:5678/api/v1';
        this.apiKey = config.apiKey;
    }

    async checkHealth(): Promise<WorkflowHealth> {
        try {
            const response = await fetch(`${this.baseUrl}/health`, {
                method: 'GET',
                headers: { 'X-N8N-API-KEY': this.apiKey },
            });

            this.isHealthy = response.ok;
            this.lastHealthCheck = Date.now();

            return {
                status: response.ok ? 'healthy' : 'degraded',
                uptime: Date.now() - this.lastHealthCheck,
                lastCheck: this.lastHealthCheck,
                provider: 'n8n',
            };
        } catch (error) {
            this.isHealthy = false;
            return {
                status: 'offline',
                uptime: 0,
                lastCheck: this.lastHealthCheck,
                provider: 'n8n',
            };
        }
    }

    async executeWorkflow(request: WorkflowExecutionRequest): Promise<WorkflowExecutionResponse> {
        if (!this.isHealthy) {
            throw new Error('n8n service is not available');
        }

        try {
            const startTime = Date.now();
            const response = await fetch(`${this.baseUrl}/workflows/${request.workflowId}/execute`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-N8N-API-KEY': this.apiKey,
                },
                body: JSON.stringify({
                    name: request.name,
                    data: request.input,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                return {
                    executionId: 'error',
                    status: 'error',
                    error: error.message || 'Workflow execution failed',
                    duration: Date.now() - startTime,
                };
            }

            const result = await response.json();
            return {
                executionId: result.executionId,
                status: 'success',
                result: result.data,
                duration: Date.now() - startTime,
            };
        } catch (error) {
            return {
                executionId: 'error',
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error',
                duration: 0,
            };
        }
    }

    async listWorkflows(): Promise<Array<{ id: string; name: string; description: string; active: boolean }>> {
        try {
            const response = await fetch(`${this.baseUrl}/workflows`, {
                method: 'GET',
                headers: { 'X-N8N-API-KEY': this.apiKey },
            });

            if (!response.ok) return [];

            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Failed to list workflows:', error);
            return [];
        }
    }

    async getWorkflow(workflowId: string): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/workflows/${workflowId}`, {
                method: 'GET',
                headers: { 'X-N8N-API-KEY': this.apiKey },
            });

            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            console.error(`Failed to get workflow ${workflowId}:`, error);
            return null;
        }
    }

    getEditUrl(workflowId: string): string {
        const baseUrl = this.baseUrl.replace('/api/v1', '');
        return `${baseUrl}/edit/${workflowId}`;
    }

    getProviderName(): string {
        return 'n8n';
    }

    isConfigured(): boolean {
        return !!this.apiKey && this.apiKey !== '';
    }
}

/**
 * Make.com Provider Implementation
 */
class MakeProvider implements IWorkflowProvider {
    private baseUrl = 'https://api.make.com/v2';
    private apiKey: string;
    private isHealthy = true;
    private lastHealthCheck = Date.now();

    constructor(config: WorkflowProviderConfig) {
        this.apiKey = config.apiKey;
    }

    async checkHealth(): Promise<WorkflowHealth> {
        try {
            const response = await fetch(`${this.baseUrl}/status`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${this.apiKey}` },
            });

            this.isHealthy = response.ok;
            this.lastHealthCheck = Date.now();

            return {
                status: response.ok ? 'healthy' : 'degraded',
                uptime: Date.now() - this.lastHealthCheck,
                lastCheck: this.lastHealthCheck,
                provider: 'Make.com',
            };
        } catch (error) {
            this.isHealthy = false;
            return {
                status: 'offline',
                uptime: 0,
                lastCheck: this.lastHealthCheck,
                provider: 'Make.com',
            };
        }
    }

    async executeWorkflow(request: WorkflowExecutionRequest): Promise<WorkflowExecutionResponse> {
        try {
            const startTime = Date.now();
            // Make.com uses webhooks for execution
            const webhookUrl = request.input.webhookUrl || '';
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workflowId: request.workflowId,
                    name: request.name,
                    data: request.input,
                }),
            });

            if (!response.ok) {
                return {
                    executionId: 'error',
                    status: 'error',
                    error: 'Webhook execution failed',
                    duration: Date.now() - startTime,
                };
            }

            const result = await response.json();
            return {
                executionId: result.executionId || 'make-exec',
                status: 'success',
                result: result.data,
                duration: Date.now() - startTime,
            };
        } catch (error) {
            return {
                executionId: 'error',
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error',
                duration: 0,
            };
        }
    }

    async listWorkflows(): Promise<Array<{ id: string; name: string; description: string; active: boolean }>> {
        try {
            const response = await fetch(`${this.baseUrl}/scenarios`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${this.apiKey}` },
            });

            if (!response.ok) return [];

            const data = await response.json();
            return (data.scenarios || []).map((s: any) => ({
                id: s.id,
                name: s.name,
                description: s.description || '',
                active: s.enabled,
            }));
        } catch (error) {
            console.error('Failed to list Make.com scenarios:', error);
            return [];
        }
    }

    async getWorkflow(workflowId: string): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/scenarios/${workflowId}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${this.apiKey}` },
            });

            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            console.error(`Failed to get Make scenario ${workflowId}:`, error);
            return null;
        }
    }

    getEditUrl(workflowId: string): string {
        return `https://app.make.com/scenario/${workflowId}/edit`;
    }

    getProviderName(): string {
        return 'Make.com';
    }

    isConfigured(): boolean {
        return !!this.apiKey && this.apiKey !== '';
    }
}

/**
 * Zapier Provider Implementation
 */
class ZapierProvider implements IWorkflowProvider {
    private baseUrl = 'https://api.zapier.com/v1';
    private apiKey: string;
    private isHealthy = true;
    private lastHealthCheck = Date.now();

    constructor(config: WorkflowProviderConfig) {
        this.apiKey = config.apiKey;
    }

    async checkHealth(): Promise<WorkflowHealth> {
        try {
            const response = await fetch(`${this.baseUrl}/account`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${this.apiKey}` },
            });

            this.isHealthy = response.ok;
            this.lastHealthCheck = Date.now();

            return {
                status: response.ok ? 'healthy' : 'degraded',
                uptime: Date.now() - this.lastHealthCheck,
                lastCheck: this.lastHealthCheck,
                provider: 'Zapier',
            };
        } catch (error) {
            this.isHealthy = false;
            return {
                status: 'offline',
                uptime: 0,
                lastCheck: this.lastHealthCheck,
                provider: 'Zapier',
            };
        }
    }

    async executeWorkflow(request: WorkflowExecutionRequest): Promise<WorkflowExecutionResponse> {
        try {
            const startTime = Date.now();
            const webhookUrl = request.input.webhookUrl || '';
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request.input),
            });

            if (!response.ok) {
                return {
                    executionId: 'error',
                    status: 'error',
                    error: 'Zapier webhook failed',
                    duration: Date.now() - startTime,
                };
            }

            const result = await response.json();
            return {
                executionId: result.id || 'zapier-exec',
                status: 'success',
                result: result,
                duration: Date.now() - startTime,
            };
        } catch (error) {
            return {
                executionId: 'error',
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error',
                duration: 0,
            };
        }
    }

    async listWorkflows(): Promise<Array<{ id: string; name: string; description: string; active: boolean }>> {
        try {
            const response = await fetch(`${this.baseUrl}/zaps`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${this.apiKey}` },
            });

            if (!response.ok) return [];

            const data = await response.json();
            return (data.objects || []).map((z: any) => ({
                id: z.id,
                name: z.title,
                description: '',
                active: z.status === 'on',
            }));
        } catch (error) {
            console.error('Failed to list Zapier zaps:', error);
            return [];
        }
    }

    async getWorkflow(workflowId: string): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/zaps/${workflowId}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${this.apiKey}` },
            });

            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            console.error(`Failed to get Zapier zap ${workflowId}:`, error);
            return null;
        }
    }

    getEditUrl(workflowId: string): string {
        return `https://zapier.com/app/editor/${workflowId}`;
    }

    getProviderName(): string {
        return 'Zapier';
    }

    isConfigured(): boolean {
        return !!this.apiKey && this.apiKey !== '';
    }
}

/**
 * Custom Webhook Provider
 */
class CustomProvider implements IWorkflowProvider {
    private baseUrl: string;
    private apiKey: string;

    constructor(config: WorkflowProviderConfig) {
        this.baseUrl = config.baseUrl || '';
        this.apiKey = config.apiKey;
    }

    async checkHealth(): Promise<WorkflowHealth> {
        try {
            const response = await fetch(`${this.baseUrl}/health`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${this.apiKey}` },
            });

            return {
                status: response.ok ? 'healthy' : 'degraded',
                uptime: Date.now(),
                lastCheck: Date.now(),
                provider: 'Custom API',
            };
        } catch (error) {
            return {
                status: 'offline',
                uptime: 0,
                lastCheck: Date.now(),
                provider: 'Custom API',
            };
        }
    }

    async executeWorkflow(request: WorkflowExecutionRequest): Promise<WorkflowExecutionResponse> {
        try {
            const startTime = Date.now();
            const response = await fetch(`${this.baseUrl}/execute`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                return {
                    executionId: 'error',
                    status: 'error',
                    error: 'Execution failed',
                    duration: Date.now() - startTime,
                };
            }

            const result = await response.json();
            return {
                executionId: result.executionId || 'custom-exec',
                status: 'success',
                result: result.data,
                duration: Date.now() - startTime,
            };
        } catch (error) {
            return {
                executionId: 'error',
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error',
                duration: 0,
            };
        }
    }

    async listWorkflows(): Promise<Array<{ id: string; name: string; description: string; active: boolean }>> {
        try {
            const response = await fetch(`${this.baseUrl}/workflows`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${this.apiKey}` },
            });

            if (!response.ok) return [];
            const data = await response.json();
            return data.workflows || [];
        } catch (error) {
            console.error('Failed to list custom workflows:', error);
            return [];
        }
    }

    async getWorkflow(workflowId: string): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/workflows/${workflowId}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${this.apiKey}` },
            });

            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            console.error(`Failed to get workflow ${workflowId}:`, error);
            return null;
        }
    }

    getEditUrl(workflowId: string): string {
        return `${this.baseUrl}/edit/${workflowId}`;
    }

    getProviderName(): string {
        return 'Custom API';
    }

    isConfigured(): boolean {
        return !!this.apiKey && !!this.baseUrl;
    }
}

/**
 * Workflow Provider Manager
 * Manages the active provider and configuration
 */
class WorkflowProviderManager {
    private provider: IWorkflowProvider | null = null;
    private config: WorkflowProviderConfig | null = null;

    constructor() {
        this.loadConfig();
    }

    private loadConfig() {
        // Load from localStorage
        const saved = localStorage.getItem('workflowProviderConfig');
        if (saved) {
            this.config = JSON.parse(saved);
            this.provider = WorkflowProviderFactory.createProvider(this.config);
        } else {
            // Default to n8n
            this.config = {
                type: 'n8n',
                apiKey: import.meta.env.VITE_N8N_API_KEY || '',
                baseUrl: import.meta.env.VITE_N8N_API_URL || 'http://localhost:5678/api/v1',
            };
            this.provider = WorkflowProviderFactory.createProvider(this.config);
        }
    }

    setConfig(config: WorkflowProviderConfig) {
        this.config = config;
        this.provider = WorkflowProviderFactory.createProvider(config);
        localStorage.setItem('workflowProviderConfig', JSON.stringify(config));
    }

    getProvider(): IWorkflowProvider {
        if (!this.provider) {
            this.loadConfig();
        }
        return this.provider!;
    }

    getConfig(): WorkflowProviderConfig | null {
        return this.config;
    }
}

export const workflowProviderManager = new WorkflowProviderManager();
