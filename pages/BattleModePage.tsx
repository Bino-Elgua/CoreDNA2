
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from 'recharts';
import { BrandDNA, BattleReport, GlobalSettings } from '../types';
import { battleModeService } from '../services/battleModeService';
import { toastService } from '../services/toastService';
import rlmService from '../services/rlmService';
import { useNavigate } from 'react-router-dom';

const BattleModePage: React.FC = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<BrandDNA[]>([]);
  const [brandAId, setBrandAId] = useState<string>('');
  const [brandBId, setBrandBId] = useState<string>('');
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [rlmActive, setRlmActive] = useState(false);
  
  const [battleReport, setBattleReport] = useState<BattleReport | null>(null);
  const [isFighting, setIsFighting] = useState(false);

  useEffect(() => {
      const stored = localStorage.getItem('core_dna_profiles');
      if (stored) {
          try {
              const parsed = JSON.parse(stored);
              setProfiles(parsed);
              if (parsed.length >= 2) {
                  setBrandAId(parsed[0].id);
                  setBrandBId(parsed[1].id);
              } else if (parsed.length === 1) {
                  setBrandAId(parsed[0].id);
              }
          } catch(e) {}
      }
      
      // Load settings and check RLM status
      const settingsStored = localStorage.getItem('core_dna_settings');
      if (settingsStored) {
          try {
              const parsedSettings = JSON.parse(settingsStored) as GlobalSettings;
              setSettings(parsedSettings);
              setRlmActive(parsedSettings.rlm?.enabled ?? false);
          } catch (e) {
              console.error("Failed to load settings", e);
          }
      }
  }, []);

  const handleFight = async () => {
       const brandA = profiles.find(p => p.id === brandAId);
       const brandB = profiles.find(p => p.id === brandBId);

       if (!brandA || !brandB) {
           toastService.error("Please select two distinct brands to battle.");
           return;
       }
       if (brandA.id === brandB.id) {
           toastService.error("A brand cannot battle itself. Select a different opponent.");
           return;
       }

       setIsFighting(true);
       setBattleReport(null);
       toastService.info(`⚔️ ${brandA.name} vs ${brandB.name} - Battle starting...`);

       try {
           let report: BattleReport;
           
           if (rlmActive && settings?.rlm) {
               report = await rlmService.runDeepBattleSimulation(brandA, brandB, settings.rlm);
           } else {
               report = await battleModeService.runBattle(brandA, brandB);
           }
           
           setBattleReport(report);
           toastService.success(`⚔️ Battle complete! ${report.winner === 'A' ? brandA.name : report.winner === 'B' ? brandB.name : 'Tie'} wins!`);
       } catch (e: any) {
           console.error(e);
           toastService.error(`Battle simulation failed: ${e.message}`);
       } finally {
           setIsFighting(false);
       }
   };

  const brandA = profiles.find(p => p.id === brandAId);
  const brandB = profiles.find(p => p.id === brandBId);

  return (
    <div className="container mx-auto px-4 py-8">
        {rlmActive && (
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30 rounded-xl flex items-center gap-3 backdrop-blur-sm"
            >
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                <span className="text-sm font-bold text-purple-300">RLM Active — Deep analysis with unbounded context</span>
            </motion.div>
        )}
        
        <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-dna-primary mb-6 transition-colors font-medium group"
        >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back
        </button>

        <h1 className="text-4xl font-display font-bold text-center mb-2">Competitive Battle Mode</h1>
        <p className="text-center text-gray-500 mb-12">Head-to-head strategic simulation and gap analysis.</p>

        {/* Selection Arena */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-12">
            {/* Fighter A */}
            <div className="w-full max-w-sm bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border-2 border-blue-500 shadow-xl relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/20 rounded-full blur-xl"></div>
                <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase mb-2">Challenger A</h3>
                <select 
                    value={brandAId} 
                    onChange={e => setBrandAId(e.target.value)}
                    className="w-full p-3 rounded-lg bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800 font-bold mb-4"
                >
                    <option value="">Select Brand...</option>
                    {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                {brandA && (
                    <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                        <p><span className="font-bold">Mission:</span> {brandA.mission.substring(0, 60)}...</p>
                        <p><span className="font-bold">Tone:</span> {brandA.toneOfVoice.adjectives.join(', ')}</p>
                    </div>
                )}
            </div>

            {/* VS Badge */}
            <div className="relative">
                <div className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center font-black text-2xl shadow-lg z-10 relative">VS</div>
                {isFighting && (
                    <div className="absolute inset-0 bg-red-600 rounded-full animate-ping opacity-50"></div>
                )}
            </div>

            {/* Fighter B */}
            <div className="w-full max-w-sm bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border-2 border-red-500 shadow-xl relative overflow-hidden">
                 <div className="absolute -left-6 -top-6 w-24 h-24 bg-red-500/20 rounded-full blur-xl"></div>
                 <h3 className="text-sm font-bold text-red-600 dark:text-red-400 uppercase mb-2">Opponent B</h3>
                 <select 
                    value={brandBId} 
                    onChange={e => setBrandBId(e.target.value)}
                    className="w-full p-3 rounded-lg bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 font-bold mb-4"
                >
                    <option value="">Select Brand...</option>
                    {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                {brandB && (
                    <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                        <p><span className="font-bold">Mission:</span> {brandB.mission.substring(0, 60)}...</p>
                        <p><span className="font-bold">Tone:</span> {brandB.toneOfVoice.adjectives.join(', ')}</p>
                    </div>
                )}
            </div>
        </div>

        {/* Action Button */}
        <div className="text-center mb-16">
            <button 
                onClick={handleFight}
                disabled={isFighting || !brandAId || !brandBId}
                className="px-10 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-black text-xl uppercase tracking-widest hover:scale-105 transition-transform shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isFighting ? 'Simulating Conflict...' : 'Initialize Battle'}
            </button>
        </div>

        {/* Results Arena */}
        {battleReport && (
            <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-6xl mx-auto"
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Visualizer */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-100 dark:border-gray-700 h-[500px]">
                        <h3 className="text-xl font-bold mb-6 text-center">Strategic Radar</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={battleReport.metrics}>
                                <PolarGrid strokeOpacity={0.2} />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                                <Radar
                                    name={brandA?.name || 'Brand A'}
                                    dataKey="A"
                                    stroke="#3B82F6"
                                    strokeWidth={3}
                                    fill="#3B82F6"
                                    fillOpacity={0.3}
                                />
                                <Radar
                                    name={brandB?.name || 'Brand B'}
                                    dataKey="B"
                                    stroke="#EF4444"
                                    strokeWidth={3}
                                    fill="#EF4444"
                                    fillOpacity={0.3}
                                />
                                <Legend />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1F2937', borderRadius: '8px', border: 'none', color: 'white' }} 
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Text Analysis */}
                     <div className="space-y-6">
                         <div className={`p-8 rounded-3xl text-white shadow-lg ${battleReport.winner === 'A' ? 'bg-blue-600' : battleReport.winner === 'B' ? 'bg-red-600' : 'bg-gray-600'}`}>
                             <h3 className="text-lg font-bold uppercase opacity-80 mb-2">The Victor</h3>
                             <div className="text-4xl font-black mb-4">
                                 {battleReport.winner === 'A' ? brandA?.name : battleReport.winner === 'B' ? brandB?.name : 'Stalemate'}
                             </div>
                             <p className="leading-relaxed opacity-90 mb-4">
                                 Competitive Gap: <span className="font-bold">{battleReport.competitiveGap.toFixed(1)}%</span>
                             </p>
                             <p className="leading-relaxed opacity-90">Market Position: <span className="font-bold">{battleReport.winner === 'A' ? battleReport.marketPosition.brandA : battleReport.winner === 'B' ? battleReport.marketPosition.brandB : 'Equal'}</span></p>
                         </div>

                         <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-lg">
                             <h3 className="font-bold text-dna-primary uppercase text-sm mb-4">Winning Factors</h3>
                             <ul className="text-sm text-gray-600 dark:text-gray-300 mb-6 space-y-2">
                                 {battleReport.winningFactors.slice(0, 3).map((factor, i) => (
                                     <li key={i} className="flex items-start gap-2">
                                         <span className="text-green-500 font-bold">✓</span>
                                         <span>{factor}</span>
                                     </li>
                                 ))}
                             </ul>
                             
                             <h3 className="font-bold text-orange-500 uppercase text-sm mb-4 mt-6">Areas for Improvement</h3>
                             <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                                 {Object.entries(battleReport.losingFactors).slice(0, 2).map(([category, recommendation], i) => (
                                     <li key={i} className="flex items-start gap-2">
                                         <span className="text-orange-500 font-bold">→</span>
                                         <span><span className="font-bold">{category}:</span> {recommendation}</span>
                                     </li>
                                 ))}
                             </ul>
                         </div>

                         <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-3xl p-8 border border-purple-200 dark:border-purple-700">
                             <h3 className="font-bold text-purple-900 dark:text-purple-300 uppercase text-sm mb-4">Strategic Recommendations</h3>
                             <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-2">
                                 {battleReport.strategicRecommendations.slice(0, 3).map((rec, i) => (
                                     <li key={i} className="flex items-start gap-2">
                                         <span className="text-purple-500">💡</span>
                                         <span>{rec}</span>
                                     </li>
                                 ))}
                             </ul>
                         </div>
                     </div>
                </div>
            </motion.div>
        )}
    </div>
  );
};

export default BattleModePage;
