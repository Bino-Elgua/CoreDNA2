
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CampaignAsset, UserProfile } from '../types';
import { generateVeoVideo } from '../services/geminiService';
import { generateVideo, getRemainingVideos, getUserCredits, getVideoTierInfo } from '../services/videoService';

interface AssetCardProps {
  asset: CampaignAsset;
  onRegenerateImage: (assetId: string, prompt: string) => void;
  onUpdateContent: (assetId: string, newContent: string) => void;
  onUpdateSchedule: (assetId: string, date: string) => void;
  onVideoReady?: (assetId: string, url: string) => void;
  onOpenEditor: (asset: CampaignAsset) => void;
  user?: UserProfile; // For tier-based access
}

const AssetCard: React.FC<AssetCardProps> = ({ asset, onRegenerateImage, onUpdateContent, onUpdateSchedule, onVideoReady, onOpenEditor, user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(asset.content);
  const [showQuickSchedule, setShowQuickSchedule] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [isAnimating, setIsAnimating] = useState(asset.isGeneratingVideo || false);
  
  // Phase 1 & 2: Video generation UI state
  const [generateVideoMode, setGenerateVideoMode] = useState(false);
  const [selectedEngine, setSelectedEngine] = useState<'ltx2' | 'sora2' | 'veo3'>('ltx2');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoCount, setVideoCount] = useState(0);
  const [tierLimit, setTierLimit] = useState(5);
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    setContent(asset.content);
  }, [asset.content]);

  // Load user video quota and credits
  useEffect(() => {
    if (user) {
      const tierInfo = getVideoTierInfo(user.tier);
      setTierLimit(tierInfo.monthlyLimit === Infinity ? 999 : tierInfo.monthlyLimit);
      
      getRemainingVideos(user.id, user.tier).then(remaining => {
        setVideoCount(tierInfo.monthlyLimit === Infinity ? 0 : (tierInfo.monthlyLimit - remaining));
      });
      
      getUserCredits(user.id).then(c => setCredits(c));
    }
  }, [user]);

  const handleDownload = () => {
    if (!asset.imageUrl && !asset.videoUrl) return;
    const link = document.createElement('a');
    link.href = asset.videoUrl || asset.imageUrl || '';
    link.download = `${asset.title.replace(/\s+/g, '_')}.${asset.videoUrl ? 'mp4' : 'png'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDirectSchedule = () => {
       if (!selectedDate) return;
       
       const stored = localStorage.getItem('core_dna_schedule');
       const currentSchedule = stored ? JSON.parse(stored) : [];
       
       const newScheduledItem = {
           ...asset,
           scheduledAt: new Date(selectedDate).toISOString(),
           brandName: 'Current Session' // In real app, pull from context
       };
       
       localStorage.setItem('core_dna_schedule', JSON.stringify([...currentSchedule, newScheduledItem]));
       onUpdateSchedule(asset.id, new Date(selectedDate).toISOString());
       setShowQuickSchedule(false);
       alert(`Asset locked in for ${new Date(selectedDate).toLocaleDateString()}!`);
   };

  // Phase 1 & 3: Generate video from image
  const handleGenerateVideo = async () => {
    if (!user || !asset.imageUrl) {
      alert('Please generate an image first');
      return;
    }

    setIsGeneratingVideo(true);
    try {
      const result = await generateVideo({
        imageUrl: asset.imageUrl,
        prompt: asset.content,
        engine: selectedEngine,
        userId: user.id,
        tier: user.tier,
      });

      onVideoReady?.(asset.id, result.videoUrl);
      alert(`✨ Video generated with ${result.engineUsed} (${result.costCredits} credits used)`);
      
      // Refresh credits display
      const updatedCredits = await getUserCredits(user.id);
      setCredits(updatedCredits);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Video generation failed';
      alert(`Error: ${message}`);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#0a1120] rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/5 flex flex-col h-full group relative"
    >
      {/* Platform Badge Overlay */}
      <div className="absolute top-6 left-6 z-10">
          <span className="px-4 py-1.5 bg-black/40 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-dna-secondary border border-white/10">
              {asset.channel}
          </span>
      </div>

      <div className="flex flex-col h-full">
        {/* Visual Top Area */}
        <div className="aspect-video bg-black relative overflow-hidden group/img cursor-pointer">
          {asset.videoUrl ? (
              <video src={asset.videoUrl} controls className="w-full h-full object-cover" poster={asset.imageUrl} />
          ) : asset.isGeneratingImage || isAnimating ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950 z-10">
                <div className="w-12 h-12 border-4 border-dna-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-dna-primary animate-pulse">Neural Render Engine...</span>
             </div>
          ) : asset.imageUrl ? (
            <img src={asset.imageUrl} alt={asset.title} className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105 opacity-80 group-hover/img:opacity-100" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-950 text-gray-700 text-[10px] uppercase font-black tracking-[0.3em]">Pending Visual Assets</div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a1120] to-transparent opacity-60 pointer-events-none" />
          
          {/* Phase 3: Click-to-Video Overlay */}
          {user && ['hunter', 'agency'].includes(user.tier) && asset.imageUrl && !asset.videoUrl && (
            <div className="relative group cursor-pointer" onClick={() => setGenerateVideoMode(true)}>
              <img src={asset.imageUrl} alt="Campaign asset" className="rounded-lg" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setGenerateVideoMode(true);
                }}
                title="Turn into video"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700"
              >
                ▶️
              </button>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="p-8 flex-grow flex flex-col">
          <div className="flex-grow">
            <h3 className="font-display font-black text-xl text-white uppercase tracking-tight mb-4">{asset.title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed line-clamp-3 italic">"{content}"</p>
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-4">
             <div className="flex justify-between items-center">
                 <button onClick={() => onOpenEditor(asset)} className="text-[10px] font-black text-dna-primary uppercase tracking-widest hover:text-white transition-colors">Command Editor &rarr;</button>
                 <div className="flex gap-2">
                    <button onClick={() => setShowQuickSchedule(!showQuickSchedule)} className={`p-2 rounded-xl border border-white/5 transition-all ${showQuickSchedule ? 'bg-dna-secondary text-black' : 'bg-white/5 text-gray-400 hover:text-white'}`}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </button>
                    <button onClick={handleDownload} disabled={!asset.imageUrl && !asset.videoUrl} className="p-2 bg-white/5 border border-white/5 text-gray-400 hover:text-white rounded-xl disabled:opacity-20">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    </button>
                 </div>
             </div>

             <AnimatePresence>
                {showQuickSchedule && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-black/40 rounded-2xl p-4 border border-white/5 space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Fast Track Schedule</span>
                            <button onClick={() => setShowQuickSchedule(false)} className="text-gray-500 hover:text-white">&times;</button>
                        </div>
                        <div className="flex gap-2">
                            <input 
                                type="date" 
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="flex-1 bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-dna-secondary" 
                            />
                            <button 
                                onClick={handleDirectSchedule}
                                disabled={!selectedDate}
                                className="bg-dna-secondary text-black px-4 rounded-lg text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-30"
                            >
                                Lock In
                            </button>
                        </div>
                    </motion.div>
                )}
             </AnimatePresence>

             {asset.scheduledAt && (
                 <div className="flex items-center gap-2 text-[10px] font-black text-green-500 uppercase tracking-widest bg-green-500/5 p-3 rounded-xl border border-green-500/10">
                     <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                     Live Target: {new Date(asset.scheduledAt).toLocaleDateString()}
                 </div>
             )}

             {/* Phase 1: Video Generation Section */}
             {user && !['free'].includes(user.tier) ? null : (
               <div className="video-generation-section bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                 <p className="text-sm mb-3">
                   Powered by <strong>LTX-2</strong> — optimized for social shorts (15 seconds, vertical)
                 </p>

                 <div>
                   <label className="flex items-center gap-3">
                     <input
                       type="checkbox"
                       checked={generateVideoMode}
                       onChange={(e) => setGenerateVideoMode(e.target.checked)}
                       className="w-4 h-4 rounded border-gray-300 text-blue-600"
                     />
                     <span className="text-sm">
                       Create video from this image ({videoCount}/{tierLimit} this month)
                     </span>
                   </label>
                   {user?.tier === 'free' && (
                     <p className="text-xs text-gray-600 mt-2">
                       Limited to 5 videos/month. Upgrade for more.
                     </p>
                   )}
                 </div>

                 {/* Phase 2: Premium Engine Selection (Hunter/Agency Only) */}
                 {generateVideoMode && user && ['hunter', 'agency'].includes(user.tier) && generateVideo && (
                   <div className="premium-engine-selector mt-4">
                     <label className="block text-sm font-medium mb-2">Video Engine</label>
                     <select
                       value={selectedEngine}
                       onChange={(e) => setSelectedEngine(e.target.value as any)}
                       className="w-full px-4 py-2 border rounded-lg"
                     >
                       <option value="ltx2">Standard (LTX-2) — 1 credit</option>
                       <option value="sora2">Premium (Sora 2 Pro) — 5 credits</option>
                       <option value="veo3">Premium (Veo 3) — 5 credits</option>
                     </select>
                     {selectedEngine !== 'ltx2' && (
                       <p className="text-xs text-blue-700 mt-2">
                         ✨ Premium engines offer superior realism, physics, and coherence
                       </p>
                     )}
                   </div>
                 )}

                 {generateVideoMode && (
                   <button
                     onClick={handleGenerateVideo}
                     disabled={isGeneratingVideo || !asset.imageUrl}
                     className="w-full mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     {isGeneratingVideo ? 'Generating...' : 'Generate Video'}
                   </button>
                 )}
               </div>
             )}

             {/* Phase 6: Legal Disclosure (After generation) */}
             {asset.videoUrl && (
               <div className="text-xs text-gray-600 mt-2">
                 Generated with: <strong>
                   {selectedEngine === 'ltx2' ? 'LTX-2 (open-source)' :
                    selectedEngine === 'sora2' ? 'Sora 2 Pro (OpenAI)' :
                    'Veo 3 (Google)'}
                 </strong>
                 {' — You own this content'}
               </div>
             )}
             </div>
             </div>
             </div>
             </motion.div>
             );
             };

             export default AssetCard;
