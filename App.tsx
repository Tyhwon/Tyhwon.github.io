
import React, { useState, useEffect, useRef } from 'react';
import PhoneFrame from './components/PhoneFrame';
import GameStats from './components/GameStats';
import { GameState, Rank, PlayerStats, NewsItem } from './types';
import { INITIAL_NEWS, RANK_THRESHOLDS } from './constants';
import { GAME_ASSETS } from './assets';
import { generateMoreNews } from './services/gemini';
import { 
  RefreshCw, 
  ChevronRight, 
  Power, 
  Image as ImageIcon, 
  CheckCircle2, 
  X, 
  LogOut, 
  Volume2, 
  VolumeX, 
  Play, 
  Settings, 
  Skull,
  Download
} from 'lucide-react';

const ImageWithFallback: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className = "" }) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const layoutClasses = className.replace(/object-\w+/g, '').trim();
  const imageClasses = className.match(/object-\w+/g)?.join(' ') || '';

  if (error) {
    return (
      <div className={`${layoutClasses} bg-slate-800 flex flex-col items-center justify-center border border-slate-700 text-slate-500 gap-2 rounded-xl`}>
        <ImageIcon size={20} />
        <span className="text-[9px] uppercase font-black tracking-widest">{alt}</span>
      </div>
    );
  }

  return (
    <div className={`${layoutClasses} relative overflow-hidden`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
          <RefreshCw size={24} className="text-blue-500 animate-spin opacity-50" />
        </div>
      )}
      <img 
        src={src} 
        alt={alt} 
        className={`w-full h-full ${imageClasses} transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`} 
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }} 
      />
    </div>
  );
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [newsStack, setNewsStack] = useState<NewsItem[]>(INITIAL_NEWS);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [scale, setScale] = useState(1);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [stats, setStats] = useState<PlayerStats>({
    score: 0,
    battery: 100,
    calmIndex: 100,
    correctStreak: 0,
    rank: Rank.NOVICE
  });
  
  const [lastCorrection, setLastCorrection] = useState<NewsItem | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  const [feedback, setFeedback] = useState<{ text: string, type: 'plus' | 'minus' } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const currentNews = newsStack[currentCardIndex];

  // PWA Install Prompt Listener
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // Fullscreen & Haptic Feedback
  const triggerVibrate = (pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  // Responsive Scaling
  useEffect(() => {
    const handleResize = () => {
      const baseWidth = 450;
      const baseHeight = 900;
      const padding = window.innerWidth < 768 ? 2 : 40;
      const scaleX = (window.innerWidth - padding) / baseWidth;
      const scaleY = (window.innerHeight - padding) / baseHeight;
      let newScale = Math.min(scaleX, scaleY);
      if (window.innerWidth > 1024) newScale = Math.min(newScale, 1.0);
      setScale(newScale);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Audio Logic
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(GAME_ASSETS.GAMEPLAY_BGM);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
    }

    const handlePlay = () => {
      if (audioRef.current && (gameState === GameState.PLAYING || gameState === GameState.MENU) && !isMuted) {
        audioRef.current.play().catch(() => {});
      }
    };

    window.addEventListener('mousedown', handlePlay, { once: true });
    window.addEventListener('touchstart', handlePlay, { once: true });

    if (isMuted || gameState === GameState.SHUTDOWN) {
      audioRef.current.pause();
    }

    return () => {
      window.removeEventListener('mousedown', handlePlay);
      window.removeEventListener('touchstart', handlePlay);
    };
  }, [gameState, isMuted]);

  useEffect(() => {
    const newRank = [...RANK_THRESHOLDS].reverse().find(t => stats.score >= t.score);
    if (newRank && newRank.rank !== stats.rank) {
      setStats(prev => ({ ...prev, rank: newRank.rank }));
    }
  }, [stats.score, stats.rank]);

  const loadMoreNews = async () => {
    setIsGenerating(true);
    try {
      const moreNews = await generateMoreNews(stats.rank);
      if (moreNews && moreNews.length > 0) {
        setNewsStack(prev => [...prev, ...moreNews]);
      } else {
        throw new Error("No data");
      }
    } catch (e) {
      const recycled = [...INITIAL_NEWS].sort(() => Math.random() - 0.5);
      setNewsStack(prev => [...prev, ...recycled]);
    } finally {
      setIsGenerating(false);
    }
  };

  const startGame = () => {
    toggleFullscreen(); // Aktifkan fullscreen saat mulai main
    setIsProcessing(false);
    setExitDirection(null);
    setCurrentCardIndex(0);
    setNewsStack([...INITIAL_NEWS].sort(() => Math.random() - 0.5));
    setStats({
      score: 0,
      battery: 100,
      calmIndex: 100,
      correctStreak: 0,
      rank: Rank.NOVICE
    });
    setGameState(GameState.PLAYING);
  };

  const toggleMute = () => setIsMuted(prev => !prev);
  const exitGame = () => confirm("Hentikan verifikasi?") && setGameState(GameState.MENU);

  const handleDecision = (decision: 'FACT' | 'HOAX') => {
    if (isProcessing) return;
    if (!currentNews) return;
    
    setIsProcessing(true);
    const isCorrect = currentNews.type === decision;
    setExitDirection(decision === 'FACT' ? 'right' : 'left');

    if (isCorrect) {
      triggerVibrate(20); // Getar halus untuk jawaban benar
      const points = 100 + Math.min(stats.correctStreak * 10, 50);
      setStats(prev => ({
        ...prev,
        score: prev.score + points,
        calmIndex: Math.min(100, prev.calmIndex + 5),
        correctStreak: prev.correctStreak + 1
      }));
      setFeedback({ text: `+${points}`, type: 'plus' });
      setTimeout(() => {
        setFeedback(null);
        setExitDirection(null);
        setCurrentCardIndex(prev => prev + 1);
        setIsProcessing(false);
      }, 400);
    } else {
      triggerVibrate([100, 50, 100]); // Getar kuat untuk jawaban salah
      setStats(prev => ({
        ...prev,
        battery: Math.max(0, prev.battery - 20),
        calmIndex: Math.max(0, prev.calmIndex - 15),
        correctStreak: 0
      }));
      setFeedback({ text: `-20 HP`, type: 'minus' });
      setLastCorrection(currentNews);
      setTimeout(() => {
        setFeedback(null);
        setGameState(GameState.EDUCATION);
      }, 500);
    }
  };

  return (
    <div 
      className="fixed inset-0 w-full h-full flex items-center justify-center bg-[#010102] overflow-hidden"
      style={{ 
        backgroundImage: `url(${GAME_ASSETS.DESK_BG})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-[15px] z-0"></div>
      
      <div 
        className="relative z-10 transition-all duration-300 ease-out flex items-center justify-center"
        style={{ transform: `scale(${scale})` }}
      >
        <PhoneFrame>
          {gameState === GameState.MENU && (
            <div className="flex-1 flex flex-col p-6 animate-in fade-in zoom-in duration-700 bg-slate-900/95 backdrop-blur-3xl">
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="relative mb-2">
                  <div className="absolute inset-0 bg-blue-600 blur-[80px] opacity-20 animate-pulse"></div>
                  <div className="relative flex flex-col items-center select-none py-8">
                    <span className="text-7xl font-black text-white tracking-[-0.05em] uppercase italic leading-none opacity-90">
                      CYBER
                    </span>
                    <span className="text-7xl font-black text-blue-500 tracking-[-0.05em] uppercase italic leading-none mt-[-10px]">
                      SHIELD
                    </span>
                    <div className="mt-8 flex items-center gap-3">
                      <div className="h-[2px] w-8 bg-blue-500/40"></div>
                      <span className="text-[10px] text-blue-300 font-black tracking-[0.5em] uppercase opacity-50">Anti-Hoax Bureau</span>
                      <div className="h-[2px] w-8 bg-blue-500/40"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-16">
                <button 
                  onClick={startGame} 
                  className="w-full bg-gradient-to-br from-blue-500 to-blue-700 rounded-[32px] p-[2px] shadow-[0_20px_60px_rgba(0,0,0,0.8)] transition-all active:scale-95 group"
                >
                  <div className="w-full h-full bg-slate-950/30 rounded-[30px] flex items-center justify-center gap-4 hover:bg-transparent transition-colors py-5">
                    <div className="bg-white text-blue-700 p-3 rounded-full shadow-2xl">
                      <Play size={28} fill="currentColor" />
                    </div>
                    <span className="text-white font-black uppercase tracking-[0.3em] text-2xl italic">Initialize</span>
                  </div>
                </button>

                {deferredPrompt && (
                  <button 
                    onClick={handleInstallClick}
                    className="w-full h-16 bg-blue-500/10 rounded-[24px] border border-blue-500/30 hover:bg-blue-500/20 transition-all flex items-center justify-center gap-3 animate-pulse"
                  >
                    <Download size={20} className="text-blue-400" />
                    <span className="text-[12px] font-black text-blue-300 uppercase tracking-widest">Install ke HP</span>
                  </button>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <button className="h-16 bg-slate-800/40 rounded-[24px] border border-slate-700/30 hover:bg-slate-700/60 transition-all active:scale-95 flex items-center justify-center gap-2 group">
                    <Settings size={22} className="text-slate-400 group-hover:rotate-45 transition-transform" />
                    <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">Config</span>
                  </button>
                  <button 
                    onClick={() => setGameState(GameState.SHUTDOWN)}
                    className="h-16 bg-red-950/10 rounded-[24px] border border-red-900/20 hover:bg-red-900/40 transition-all active:scale-95 flex items-center justify-center gap-2 group"
                  >
                    <Skull size={22} className="text-red-600/70 group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] font-black text-red-400/80 uppercase tracking-widest">Abort</span>
                  </button>
                </div>
              </div>

              <div className="text-center pb-12 flex flex-col items-center gap-3">
                <div className="text-[9px] text-slate-600 font-mono uppercase tracking-[0.6em] opacity-40">OS_V3.0_MOBILE_READY</div>
                <button onClick={toggleMute} className="text-slate-500 hover:text-white transition-colors bg-slate-800/40 p-3 rounded-full border border-slate-700/20">
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
              </div>
            </div>
          )}

          {gameState === GameState.PLAYING && (
            <div className="flex-1 flex flex-col h-full bg-slate-950 relative overflow-hidden">
              <GameStats stats={stats} />
              <div className="absolute top-6 left-6 z-[50]">
                 <button onClick={toggleMute} className="p-3 bg-slate-800/60 rounded-full border border-slate-700/30 backdrop-blur-md">
                  {isMuted ? <VolumeX size={18} className="text-slate-400" /> : <Volume2 size={18} className="text-blue-400" />}
                </button>
              </div>
              <button onClick={exitGame} className="absolute top-6 right-6 z-[50] p-3 bg-red-600/30 rounded-full border border-red-500/30 backdrop-blur-md">
                <Power size={18} className="text-red-500" />
              </button>
              
              <div className="flex-1 flex flex-col items-center p-5 relative">
                {feedback && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[200] animate-in zoom-in duration-300">
                    <div className={`px-8 py-5 rounded-[40px] border-4 shadow-2xl backdrop-blur-3xl font-black text-4xl italic ${feedback.type === 'plus' ? 'bg-emerald-500/60 border-emerald-400 text-white' : 'bg-red-500/60 border-red-500 text-white'}`}>
                      {feedback.text}
                    </div>
                  </div>
                )}

                <div className="flex-1 w-full flex items-center justify-center py-4">
                  <div 
                    key={currentCardIndex}
                    className="relative w-full max-w-[290px] h-[430px] z-10"
                    style={{
                      transform: exitDirection 
                        ? `translateX(${exitDirection === 'right' ? 650 : -650}px) rotate(${exitDirection === 'right' ? 45 : -45}deg)`
                        : `none`,
                      opacity: exitDirection ? 0 : 1,
                      transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease-in'
                    }}
                  >
                    {currentNews ? (
                      <div className="w-full h-full bg-white rounded-[38px] shadow-2xl flex flex-col overflow-hidden border-2 border-slate-100">
                        <div className="h-44 bg-slate-200">
                          <ImageWithFallback src={currentNews.imageUrl} alt="News" className="w-full h-full object-cover" />
                        </div>
                        <div className="p-6 pt-5 flex-1 flex flex-col">
                          <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-full w-fit mb-2.5">
                            {currentNews.source}
                          </span>
                          <h2 className="text-[16px] font-black text-slate-900 leading-[1.15] mb-2.5 line-clamp-2">
                            {currentNews.headline}
                          </h2>
                          <div className="text-[11.5px] text-slate-600 leading-relaxed line-clamp-6 font-medium">
                            {currentNews.content}
                          </div>
                          <div className="mt-auto pt-4 border-t border-slate-100 text-[8px] text-slate-400 font-mono italic truncate">
                            {currentNews.url}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-slate-900 rounded-[38px] flex flex-col items-center justify-center p-8 border-2 border-slate-800">
                        <RefreshCw size={44} className="text-blue-500 animate-spin mb-4" />
                        <p className="text-[11px] font-black text-blue-400 uppercase tracking-widest">SYNC_PROGRESS...</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-full flex gap-4 mt-2 mb-10 h-24">
                  <button onClick={() => handleDecision('HOAX')} className="flex-1 bg-red-600 rounded-[32px] border-b-[8px] border-red-800 active:translate-y-2 active:border-b-0 flex flex-col items-center justify-center gap-1 shadow-2xl">
                    <X size={34} className="text-white" strokeWidth={5} />
                    <span className="text-[10px] font-black text-white tracking-widest uppercase">Hoax</span>
                  </button>
                  <button onClick={() => handleDecision('FACT')} className="flex-1 bg-emerald-600 rounded-[32px] border-b-[8px] border-emerald-800 active:translate-y-2 active:border-b-0 flex flex-col items-center justify-center gap-1 shadow-2xl">
                    <CheckCircle2 size={34} className="text-white" strokeWidth={4} />
                    <span className="text-[10px] font-black text-white tracking-widest uppercase">Fakta</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {gameState === GameState.EDUCATION && (
            <div className="flex-1 flex flex-col p-6 h-full bg-slate-950 overflow-y-auto scrollbar-hide">
              <div className="bg-red-500/20 p-6 rounded-[32px] border-2 border-red-500/30 mb-5">
                <h2 className="text-xl font-black text-white mb-1 italic uppercase">Salah Analisis!</h2>
                <p className="text-[10px] text-red-300 font-bold tracking-widest uppercase">Analisis Koreksi</p>
              </div>
              <div className="bg-slate-900/80 rounded-[32px] p-6 border border-slate-800 mb-5">
                <p className="text-[14px] font-bold text-slate-100 mb-5 leading-snug">{lastCorrection?.headline}</p>
                <div className={`p-5 rounded-2xl border-2 ${lastCorrection?.type === 'HOAX' ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'} font-black text-2xl text-center uppercase italic`}>
                   BERITA {lastCorrection?.type}
                </div>
              </div>
              <div className="bg-blue-600/5 p-6 rounded-[28px] border border-blue-900/40 mb-6">
                <p className="text-[13px] text-slate-300 leading-relaxed italic">"{lastCorrection?.explanation}"</p>
              </div>
              <button onClick={() => stats.battery <= 0 ? setGameState(GameState.GAME_OVER) : setGameState(GameState.PLAYING)} className="w-full py-6 bg-white text-slate-950 rounded-[36px] font-black uppercase text-base border-b-[8px] border-slate-300 active:translate-y-2 active:border-b-0 transition-all">
                Lanjutkan <ChevronRight size={20} className="inline ml-1" />
              </button>
            </div>
          )}

          {gameState === GameState.GAME_OVER && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950">
              <div className="w-32 h-32 bg-red-600/10 text-red-500 rounded-[48px] flex items-center justify-center border-4 border-red-500/40 mb-10">
                <LogOut size={64} />
              </div>
              <h2 className="text-5xl font-black text-white mb-2 italic">DIHENTIKAN</h2>
              <div className="w-full bg-slate-900/50 rounded-[36px] p-7 border border-slate-800 mb-12">
                <div className="flex justify-between items-center text-[12px] font-black text-slate-500 mb-2">
                  <span>HASIL_AKHIR</span>
                </div>
                <div className="flex justify-between items-end">
                   <span className="text-[10px] text-slate-600 font-bold mb-1">SKOR:</span>
                   <span className="text-4xl text-white font-mono tracking-tighter">{stats.score.toLocaleString()}</span>
                </div>
              </div>
              <button onClick={startGame} className="w-full py-6 bg-blue-600 rounded-[36px] text-white font-black uppercase tracking-widest border-b-[8px] border-blue-800 active:translate-y-2 active:border-b-0 transition-all text-lg italic">RE-INITIALIZE</button>
            </div>
          )}
        </PhoneFrame>
      </div>
    </div>
  );
};

export default App;
