/**
 * Battle Mode Service - Competitive Analysis & Brand Comparison
 * Handles brand battles, scoring, and strategic recommendations
 */

import { BrandDNA } from '../types';

export interface BattleScore {
  category: string;
  score: number; // 0-100
  brandAScore: number;
  brandBScore: number;
  explanation: string;
}

export interface BattleReport {
  id: string;
  brandAId: string;
  brandBId: string;
  brandAName: string;
  brandBName: string;
  winner: 'A' | 'B' | 'tie';
  winningFactors: string[];
  losingFactors: Record<string, string>;
  scores: BattleScore[];
  competitiveGap: number; // percentage
  strategicRecommendations: string[];
  marketPosition: {
    brandA: string;
    brandB: string;
  };
  createdAt: number;
}

class BattleModeService {
  private battles: Map<string, BattleReport> = new Map();

  /**
   * Initialize from localStorage
   */
  initialize() {
    try {
      const battlesData = localStorage.getItem('_battle_reports');
      if (battlesData) {
        const battles = JSON.parse(battlesData) as BattleReport[];
        battles.forEach(b => this.battles.set(b.id, b));
      }
      console.log('[BattleModeService] ✓ Initialized with', this.battles.size, 'battles');
    } catch (e) {
      console.error('[BattleModeService] Initialization failed:', e);
    }
  }

  /**
   * Run battle simulation between two brands
   */
  async runBattle(brandA: BrandDNA, brandB: BrandDNA): Promise<BattleReport> {
    const id = `battle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Calculate scores across multiple categories
      const scores = this.calculateBattleScores(brandA, brandB);
      const totalScoreA = scores.reduce((sum, s) => sum + s.brandAScore, 0) / scores.length;
      const totalScoreB = scores.reduce((sum, s) => sum + s.brandBScore, 0) / scores.length;

      // Determine winner
      let winner: 'A' | 'B' | 'tie' = 'tie';
      if (totalScoreA > totalScoreB + 5) {
        winner = 'A';
      } else if (totalScoreB > totalScoreA + 5) {
        winner = 'B';
      }

      // Get winning factors
      const winningFactors = this.getWinningFactors(brandA, brandB, winner);
      const losingFactors = this.getLosingFactors(brandA, brandB, winner);

      // Get recommendations
      const recommendations = this.generateRecommendations(brandA, brandB, scores);

      const report: BattleReport = {
        id,
        brandAId: brandA.id,
        brandBId: brandB.id,
        brandAName: brandA.name,
        brandBName: brandB.name,
        winner,
        winningFactors,
        losingFactors,
        scores,
        competitiveGap: Math.abs(totalScoreA - totalScoreB),
        strategicRecommendations: recommendations,
        marketPosition: {
          brandA: this.getMarketPosition(brandA),
          brandB: this.getMarketPosition(brandB),
        },
        createdAt: Date.now(),
      };

      this.battles.set(id, report);
      this.save();
      console.log('[BattleModeService] ✓ Battle complete:', id);
      return report;
    } catch (e: any) {
      console.error('[BattleModeService] Battle failed:', e.message);
      throw e;
    }
  }

  /**
   * Calculate scores across categories
   */
  private calculateBattleScores(brandA: BrandDNA, brandB: BrandDNA): BattleScore[] {
    const scores: BattleScore[] = [];

    // Brand Clarity Score
    scores.push(this.scoreBrandClarity(brandA, brandB));

    // Messaging Strength
    scores.push(this.scoreMessaging(brandA, brandB));

    // Value Proposition
    scores.push(this.scoreValueProp(brandA, brandB));

    // Target Audience Alignment
    scores.push(this.scoreAudience(brandA, brandB));

    // Differentiation
    scores.push(this.scoreDifferentiation(brandA, brandB));

    // Brand Voice
    scores.push(this.scoreBrandVoice(brandA, brandB));

    // Emotional Appeal
    scores.push(this.scoreEmotionalAppeal(brandA, brandB));

    // Market Viability
    scores.push(this.scoreMarketViability(brandA, brandB));

    return scores;
  }

  private scoreBrandClarity(a: BrandDNA, b: BrandDNA): BattleScore {
    const scoreA = this.clearityScore(a);
    const scoreB = this.clearityScore(b);
    return {
      category: 'Brand Clarity',
      score: (scoreA + scoreB) / 2,
      brandAScore: scoreA,
      brandBScore: scoreB,
      explanation: `${a.name} clarity: ${scoreA}/100, ${b.name} clarity: ${scoreB}/100`,
    };
  }

  private scoreMessaging(a: BrandDNA, b: BrandDNA): BattleScore {
    const scoreA = (a.keyMessaging?.length || 0) * 15 + (a.description?.length || 0) / 10;
    const scoreB = (b.keyMessaging?.length || 0) * 15 + (b.description?.length || 0) / 10;
    return {
      category: 'Messaging Strength',
      score: (Math.min(scoreA, 100) + Math.min(scoreB, 100)) / 2,
      brandAScore: Math.min(scoreA, 100),
      brandBScore: Math.min(scoreB, 100),
      explanation: 'Based on messaging clarity and description depth',
    };
  }

  private scoreValueProp(a: BrandDNA, b: BrandDNA): BattleScore {
    const scoreA = (a.values?.length || 0) * 20;
    const scoreB = (b.values?.length || 0) * 20;
    return {
      category: 'Value Proposition',
      score: (Math.min(scoreA, 100) + Math.min(scoreB, 100)) / 2,
      brandAScore: Math.min(scoreA, 100),
      brandBScore: Math.min(scoreB, 100),
      explanation: 'Based on number and clarity of values',
    };
  }

  private scoreAudience(a: BrandDNA, b: BrandDNA): BattleScore {
    const scoreA = a.targetAudience?.length || 50;
    const scoreB = b.targetAudience?.length || 50;
    return {
      category: 'Target Audience Alignment',
      score: (scoreA + scoreB) / 2,
      brandAScore: scoreA,
      brandBScore: scoreB,
      explanation: 'Based on audience definition specificity',
    };
  }

  private scoreDifferentiation(a: BrandDNA, b: BrandDNA): BattleScore {
    const scoreA = (a.uniqueValue?.length || 0) + (a.swotStrengths?.length || 0) * 5;
    const scoreB = (b.uniqueValue?.length || 0) + (b.swotStrengths?.length || 0) * 5;
    return {
      category: 'Differentiation',
      score: (Math.min(scoreA, 100) + Math.min(scoreB, 100)) / 2,
      brandAScore: Math.min(scoreA, 100),
      brandBScore: Math.min(scoreB, 100),
      explanation: 'Based on unique value and competitive strengths',
    };
  }

  private scoreBrandVoice(a: BrandDNA, b: BrandDNA): BattleScore {
    const scoreA = this.voiceScore(a);
    const scoreB = this.voiceScore(b);
    return {
      category: 'Brand Voice',
      score: (scoreA + scoreB) / 2,
      brandAScore: scoreA,
      brandBScore: scoreB,
      explanation: 'Based on tone and voice definition',
    };
  }

  private scoreEmotionalAppeal(a: BrandDNA, b: BrandDNA): BattleScore {
    const scoreA = (a.emotionalTriggers?.length || 0) * 15;
    const scoreB = (b.emotionalTriggers?.length || 0) * 15;
    return {
      category: 'Emotional Appeal',
      score: (Math.min(scoreA, 100) + Math.min(scoreB, 100)) / 2,
      brandAScore: Math.min(scoreA, 100),
      brandBScore: Math.min(scoreB, 100),
      explanation: 'Based on emotional triggers and resonance',
    };
  }

  private scoreMarketViability(a: BrandDNA, b: BrandDNA): BattleScore {
    const scoreA = (a.swotOpportunities?.length || 0) * 10 - (a.swotThreats?.length || 0) * 5;
    const scoreB = (b.swotOpportunities?.length || 0) * 10 - (b.swotThreats?.length || 0) * 5;
    return {
      category: 'Market Viability',
      score: (Math.min(scoreA, 100) + Math.min(scoreB, 100)) / 2,
      brandAScore: Math.min(scoreA, 100),
      brandBScore: Math.min(scoreB, 100),
      explanation: 'Based on market opportunities and threats',
    };
  }

  private clearityScore(brand: BrandDNA): number {
    let score = 0;
    if (brand.tagline) score += 20;
    if (brand.description) score += 20;
    if (brand.mission) score += 20;
    if (brand.vision) score += 20;
    if (brand.values?.length) score += 20;
    return Math.min(score, 100);
  }

  private voiceScore(brand: BrandDNA): number {
    let score = 0;
    if (brand.toneOfVoice?.description) score += 30;
    if (brand.toneOfVoice?.examples?.length) score += 20;
    if (brand.keyMessaging?.length) score += 25;
    if (brand.emotionalTriggers?.length) score += 25;
    return Math.min(score, 100);
  }

  private getWinningFactors(a: BrandDNA, b: BrandDNA, winner: string): string[] {
    if (winner === 'tie') return [];
    const brand = winner === 'A' ? a : b;
    const factors = [];
    if (brand.uniqueValue) factors.push(`Strong unique value: ${brand.uniqueValue}`);
    if (brand.swotStrengths?.length) factors.push(`Clear competitive strengths: ${brand.swotStrengths[0]}`);
    if (brand.values?.length) factors.push(`Well-defined values: ${brand.values.join(', ')}`);
    if (brand.emotionalTriggers?.length) factors.push(`Strong emotional appeal: ${brand.emotionalTriggers[0]}`);
    return factors.slice(0, 4);
  }

  private getLosingFactors(a: BrandDNA, b: BrandDNA, winner: string): Record<string, string> {
    const loser = winner === 'A' ? b : a;
    const factors: Record<string, string> = {};
    if (!loser.uniqueValue || loser.uniqueValue.length < 20) {
      factors['Differentiation'] = 'Unique value proposition could be stronger';
    }
    if (!loser.swotThreats || loser.swotThreats.length === 0) {
      factors['Market Analysis'] = 'Consider market threats and weaknesses';
    }
    if (!loser.emotionalTriggers || loser.emotionalTriggers.length < 2) {
      factors['Emotional Connection'] = 'Strengthen emotional triggers and resonance';
    }
    return factors;
  }

  private generateRecommendations(a: BrandDNA, b: BrandDNA, scores: BattleScore[]): string[] {
    const recommendations = [];
    
    const lowestScore = scores.reduce((min, s) => s.score < min.score ? s : min);
    recommendations.push(`Strengthen ${lowestScore.category.toLowerCase()}: This is the weakest competitive area`);

    if (!a.mission && !b.mission) {
      recommendations.push('Define clear mission statements for both brands');
    }

    const withWeakValues = (!a.values || a.values.length < 3) ? a : (!b.values || b.values.length < 3) ? b : null;
    if (withWeakValues) {
      recommendations.push(`Expand ${withWeakValues.name}'s core values definition`);
    }

    recommendations.push('Develop more specific audience personas');
    recommendations.push('Create consistent messaging across all brand touchpoints');

    return recommendations.slice(0, 5);
  }

  private getMarketPosition(brand: BrandDNA): string {
    const strengths = brand.swotStrengths?.length || 0;
    const opportunities = brand.swotOpportunities?.length || 0;
    const hasUniqueValue = !!brand.uniqueValue;

    if (strengths >= 3 && opportunities >= 2 && hasUniqueValue) {
      return 'Market Leader';
    } else if (strengths >= 2 || opportunities >= 2) {
      return 'Strong Competitor';
    } else if (hasUniqueValue) {
      return 'Niche Specialist';
    } else {
      return 'Emerging Brand';
    }
  }

  /**
   * Get battle history
   */
  getBattleHistory(): BattleReport[] {
    return Array.from(this.battles.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Get battle report
   */
  getBattle(id: string): BattleReport | null {
    return this.battles.get(id) || null;
  }

  /**
   * Delete battle
   */
  deleteBattle(id: string): boolean {
    return this.battles.delete(id) && this.save() && true;
  }

  /**
   * Save to localStorage
   */
  private save(): boolean {
    try {
      localStorage.setItem('_battle_reports', JSON.stringify(Array.from(this.battles.values())));
      return true;
    } catch (e) {
      console.error('[BattleModeService] Save failed:', e);
      return false;
    }
  }
}

export const battleModeService = new BattleModeService();

export const initializeBattleModeService = () => {
  battleModeService.initialize();
};
