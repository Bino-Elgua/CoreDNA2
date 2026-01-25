/**
 * Real-Time Collaboration Service
 * Handles team collaboration, shared editing, and live updates via WebSocket
 */

export interface CollaborationSession {
  id: string;
  portfolioId: string;
  teamId: string;
  title: string;
  participants: CollaborationParticipant[];
  createdAt: number;
  updatedAt: number;
  isActive: boolean;
}

export interface CollaborationParticipant {
  userId: string;
  name: string;
  email: string;
  role: 'owner' | 'editor' | 'viewer';
  joinedAt: number;
  lastActive: number;
  color: string; // For cursor color
}

export interface CollaborativeEdit {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  operation: 'update' | 'delete' | 'create' | 'comment';
  target: string; // What was edited (e.g., 'campaign.title')
  oldValue?: any;
  newValue?: any;
  timestamp: number;
  appliedAt?: number;
}

export interface CollaborationComment {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  text: string;
  target: string; // What the comment is about
  resolved: boolean;
  createdAt: number;
  replies: CollaborationComment[];
}

class CollaborationService {
  private sessions: Map<string, CollaborationSession> = new Map();
  private edits: Map<string, CollaborativeEdit[]> = new Map();
  private comments: Map<string, CollaborationComment[]> = new Map();
  private websockets: Map<string, WebSocket> = new Map();
  private wsUrl: string = '';

  /**
   * Initialize collaboration service
   */
  initialize(wsUrl?: string) {
    this.wsUrl = wsUrl || import.meta.env.VITE_COLLAB_WS_URL || 'wss://collab.coredna.ai/ws';
    
    try {
      const sessionsData = localStorage.getItem('_collab_sessions');
      if (sessionsData) {
        const sessions = JSON.parse(sessionsData) as CollaborationSession[];
        sessions.forEach(s => this.sessions.set(s.id, s));
      }

      const editsData = localStorage.getItem('_collab_edits');
      if (editsData) {
        const edits = JSON.parse(editsData) as Record<string, CollaborativeEdit[]>;
        Object.entries(edits).forEach(([key, value]) => this.edits.set(key, value));
      }

      const commentsData = localStorage.getItem('_collab_comments');
      if (commentsData) {
        const comments = JSON.parse(commentsData) as Record<string, CollaborationComment[]>;
        Object.entries(comments).forEach(([key, value]) => this.comments.set(key, value));
      }

      console.log('[CollaborationService] ✓ Initialized');
    } catch (e) {
      console.error('[CollaborationService] Initialization failed:', e);
    }
  }

  /**
   * Create collaboration session
   */
  async createSession(portfolioId: string, teamId: string, title: string, userId: string, userName: string): Promise<CollaborationSession> {
    const id = `collab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    const session: CollaborationSession = {
      id,
      portfolioId,
      teamId,
      title,
      participants: [{
        userId,
        name: userName,
        email: localStorage.getItem('user_email') || `${userId}@coredna.ai`,
        role: 'owner',
        joinedAt: now,
        lastActive: now,
        color: this.generateUserColor(userId),
      }],
      createdAt: now,
      updatedAt: now,
      isActive: true,
    };

    this.sessions.set(id, session);
    this.edits.set(id, []);
    this.comments.set(id, []);
    this.save();

    console.log('[CollaborationService] ✓ Session created:', id);
    return session;
  }

  /**
   * Join collaboration session
   */
  async joinSession(sessionId: string, userId: string, userName: string): Promise<CollaborationSession | null> {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const exists = session.participants.some(p => p.userId === userId);
    if (!exists) {
      session.participants.push({
        userId,
        name: userName,
        email: localStorage.getItem('user_email') || `${userId}@coredna.ai`,
        role: 'editor',
        joinedAt: Date.now(),
        lastActive: Date.now(),
        color: this.generateUserColor(userId),
      });
      session.updatedAt = Date.now();
      this.sessions.set(sessionId, session);
      this.save();
    }

    // Try to connect WebSocket
    this.connectWebSocket(sessionId);

    console.log('[CollaborationService] ✓ User joined session:', sessionId);
    return session;
  }

  /**
   * Leave session
   */
  async leaveSession(sessionId: string, userId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.participants = session.participants.filter(p => p.userId !== userId);
    
    if (session.participants.length === 0) {
      session.isActive = false;
    }

    session.updatedAt = Date.now();
    this.sessions.set(sessionId, session);
    
    // Disconnect WebSocket
    const ws = this.websockets.get(sessionId);
    if (ws) ws.close();
    this.websockets.delete(sessionId);

    this.save();
    console.log('[CollaborationService] ✓ User left session:', sessionId);
    return true;
  }

  /**
   * Record an edit
   */
  async recordEdit(sessionId: string, userId: string, userName: string, operation: string, target: string, oldValue?: any, newValue?: any): Promise<CollaborativeEdit> {
    const editId = `edit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const edit: CollaborativeEdit = {
      id: editId,
      sessionId,
      userId,
      userName,
      operation: operation as any,
      target,
      oldValue,
      newValue,
      timestamp: Date.now(),
    };

    const sessionEdits = this.edits.get(sessionId) || [];
    sessionEdits.push(edit);
    this.edits.set(sessionId, sessionEdits);

    // Broadcast to other users
    this.broadcastEdit(sessionId, edit);

    this.save();
    return edit;
  }

  /**
   * Add comment
   */
  async addComment(sessionId: string, userId: string, userName: string, text: string, target: string): Promise<CollaborationComment> {
    const id = `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const comment: CollaborationComment = {
      id,
      sessionId,
      userId,
      userName,
      text,
      target,
      resolved: false,
      createdAt: Date.now(),
      replies: [],
    };

    const sessionComments = this.comments.get(sessionId) || [];
    sessionComments.push(comment);
    this.comments.set(sessionId, sessionComments);

    // Broadcast to other users
    this.broadcastComment(sessionId, comment);

    this.save();
    return comment;
  }

  /**
   * Reply to comment
   */
  async replyToComment(sessionId: string, commentId: string, userId: string, userName: string, text: string): Promise<CollaborationComment | null> {
    const sessionComments = this.comments.get(sessionId) || [];
    const comment = sessionComments.find(c => c.id === commentId);
    if (!comment) return null;

    const reply: CollaborationComment = {
      id: `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      userId,
      userName,
      text,
      target: commentId,
      resolved: false,
      createdAt: Date.now(),
      replies: [],
    };

    comment.replies.push(reply);
    this.comments.set(sessionId, sessionComments);
    this.save();

    return reply;
  }

  /**
   * Resolve comment
   */
  async resolveComment(sessionId: string, commentId: string): Promise<boolean> {
    const sessionComments = this.comments.get(sessionId) || [];
    const comment = sessionComments.find(c => c.id === commentId);
    if (!comment) return false;

    comment.resolved = true;
    this.comments.set(sessionId, sessionComments);
    this.save();

    return true;
  }

  /**
   * Get session
   */
  getSession(sessionId: string): CollaborationSession | null {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Get session edits
   */
  getSessionEdits(sessionId: string): CollaborativeEdit[] {
    return this.edits.get(sessionId) || [];
  }

  /**
   * Get session comments
   */
  getSessionComments(sessionId: string): CollaborationComment[] {
    return this.comments.get(sessionId) || [];
  }

  /**
   * Get active sessions for portfolio
   */
  getPortfolioSessions(portfolioId: string): CollaborationSession[] {
    return Array.from(this.sessions.values())
      .filter(s => s.portfolioId === portfolioId && s.isActive)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  /**
   * Connect WebSocket for real-time updates
   */
  private connectWebSocket(sessionId: string) {
    if (this.websockets.has(sessionId)) return;

    try {
      const ws = new WebSocket(`${this.wsUrl}?sessionId=${sessionId}`);

      ws.onopen = () => {
        console.log('[CollaborationService] WebSocket connected:', sessionId);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // Handle incoming edits/comments from other users
          if (data.type === 'edit') {
            // Process incoming edit
          } else if (data.type === 'comment') {
            // Process incoming comment
          }
        } catch (e) {
          console.error('[CollaborationService] WebSocket message parse error:', e);
        }
      };

      ws.onerror = (error) => {
        console.error('[CollaborationService] WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('[CollaborationService] WebSocket closed:', sessionId);
        this.websockets.delete(sessionId);
      };

      this.websockets.set(sessionId, ws);
    } catch (e) {
      console.warn('[CollaborationService] WebSocket connection failed:', e);
    }
  }

  /**
   * Broadcast edit to other users
   */
  private broadcastEdit(sessionId: string, edit: CollaborativeEdit) {
    const ws = this.websockets.get(sessionId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'edit', data: edit }));
    }
  }

  /**
   * Broadcast comment to other users
   */
  private broadcastComment(sessionId: string, comment: CollaborationComment) {
    const ws = this.websockets.get(sessionId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'comment', data: comment }));
    }
  }

  /**
   * Generate consistent color for user
   */
  private generateUserColor(userId: string): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
      '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
    ];
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }

  /**
   * Save to localStorage
   */
  private save(): boolean {
    try {
      localStorage.setItem('_collab_sessions', JSON.stringify(Array.from(this.sessions.values())));
      localStorage.setItem('_collab_edits', JSON.stringify(Object.fromEntries(this.edits)));
      localStorage.setItem('_collab_comments', JSON.stringify(Object.fromEntries(this.comments)));
      return true;
    } catch (e) {
      console.error('[CollaborationService] Save failed:', e);
      return false;
    }
  }
}

export const collaborationService = new CollaborationService();

export const initializeCollaborationService = (wsUrl?: string) => {
  collaborationService.initialize(wsUrl);
};
