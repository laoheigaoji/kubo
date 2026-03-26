import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Video, 
  Mic, 
  User, 
  Gamepad2, 
  Image as ImageIcon, 
  Sparkles, 
  Camera, 
  ChevronLeft, 
  BarChart3, 
  Trash2, 
  Smartphone, 
  HelpCircle,
  Play,
  X,
  Check,
  Music,
  Volume2,
  Settings2,
  Clock,
  Heart,
  Star,
  Calendar,
  Zap,
  Search,
  Plus,
  FileText,
  ChevronRight,
  Pause,
  RotateCcw,
  Clipboard
} from 'lucide-react';
import { 
  AppState, 
  VideoSettings, 
  AudioSettings, 
  AudioLibraryItem,
  CameraSettings,
  VideoSize, 
  MirrorEffect, 
  DeDuplicationFilter, 
  VideoSource, 
  PlaybackMode 
} from './types';
import { DIGITAL_HUMANS, LIVE_COMPONENTS, ENTERTAINMENT_TOOLS } from './constants';
import { DigitalRain, CoolParticles } from './components/Effects/CanvasEffects';

const INITIAL_STATE: AppState = {
  video: {
    enabled: true,
    size: 'full',
    mirror: 'none',
    filter: 'none',
    intensity: 80,
    volume: 60,
    source: 'local',
    relayUrl: 'https://pull-flv-t1.douyincdn.com/thirdgame/stream-406621324152931131_l...',
    localVideoUrl: null,
  },
  audio: {
    enabled: false,
    mode: 'sequential',
    volume: 100,
    interval: 0,
    localAudioUrl: null,
    library: [],
  },
  camera: {
    enabled: false,
    position: 'front',
    aiMatting: true,
    smoothing: 3,
    brightness: 100,
    contrast: 50,
    scale: 1,
  },
  selectedDigitalHuman: null,
  digitalHumanScale: 1,
  activeComponents: [],
  componentStates: {},
  activeEffect: null,
  activeEntertainment: null,
  isLive: false,
};

export default function App() {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (state.camera.enabled) {
      navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: state.camera.position === 'front' ? 'user' : 'environment' } 
      })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => console.error("Camera error:", err));
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [state.camera.enabled, state.camera.position]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleComponent = (id: string) => {
    setState(prev => {
      const isEffect = LIVE_COMPONENTS.find(c => c.id === id)?.type === 'effect';
      if (isEffect) {
        return { ...prev, activeEffect: prev.activeEffect === id ? null : id };
      }
      const isActive = prev.activeComponents.includes(id);
      const newComponents = isActive
        ? prev.activeComponents.filter(c => c !== id)
        : [...prev.activeComponents, id];
      
      const newStates = { ...prev.componentStates };
      if (!isActive && !newStates[id]) {
        newStates[id] = { scale: 1 };
      }
      
      return {
        ...prev,
        activeComponents: newComponents,
        componentStates: newStates
      };
    });
  };

  const updateComponentScale = (id: string, scale: number) => {
    setState(prev => ({
      ...prev,
      componentStates: {
        ...prev.componentStates,
        [id]: { scale }
      }
    }));
  };

  const renderModal = () => {
    switch (activeModal) {
      case 'components': return <ComponentsModal state={state} onToggle={toggleComponent} onClose={() => setActiveModal(null)} />;
      case 'digital-human': return <DigitalHumanModal state={state} onSelect={(id) => setState(prev => ({ ...prev, selectedDigitalHuman: id }))} onClose={() => setActiveModal(null)} />;
      case 'audio': return <AudioModal state={state} onUpdate={(audio) => setState(prev => ({ ...prev, audio }))} onClose={() => setActiveModal(null)} />;
      case 'video': return <VideoModal state={state} onUpdate={(video) => setState(prev => ({ ...prev, video }))} onClose={() => setActiveModal(null)} />;
      case 'camera': return <CameraModal state={state} onUpdate={(camera) => setState(prev => ({ ...prev, camera }))} onClose={() => setActiveModal(null)} />;
      case 'entertainment': return <EntertainmentModal state={state} onSelect={(id) => setState(prev => ({ ...prev, activeEntertainment: id }))} onClose={() => setActiveModal(null)} />;
      default: return null;
    }
  };

  return (
    <div className="relative h-screen w-full bg-[#0a0a0a] text-white font-sans overflow-hidden flex flex-col items-center justify-center">
      {/* Background Preview */}
      <div 
        className={`relative w-full h-full transition-all duration-700 ease-in-out ${state.isLive ? 'max-w-none' : 'max-w-[450px] shadow-2xl'} bg-cover bg-center overflow-hidden`} 
        style={{ backgroundImage: state.video.localVideoUrl ? 'none' : 'url(https://picsum.photos/seed/mountain/1080/1920)' }}
        onDoubleClick={() => state.isLive && setState(prev => ({ ...prev, isLive: false }))}
      >
        {/* Hidden Audio Player */}
        {state.audio.enabled && state.audio.localAudioUrl && (
          <audio 
            src={state.audio.localAudioUrl} 
            autoPlay 
            loop 
            style={{ display: 'none' }} 
            ref={(el) => {
              if (el) el.volume = state.audio.volume / 100;
            }}
          />
        )}

        {/* Local Video Layer */}
        {state.video.localVideoUrl && (
          <video 
            src={state.video.localVideoUrl} 
            autoPlay 
            loop 
            muted 
            className={`absolute inset-0 w-full h-full object-cover ${state.video.mirror === 'horizontal' ? 'scale-x-[-1]' : state.video.mirror === 'vertical' ? 'scale-y-[-1]' : ''}`}
          />
        )}

        {/* Effects Layer */}
        {state.activeEffect === 'digital_rain' && <DigitalRain />}
        {state.activeEffect === 'cool_particle' && <CoolParticles />}
        
        {/* Video Filter Overlay */}
        <div className={`absolute inset-0 pointer-events-none transition-all duration-500 ${getFilterClass(state.video.filter)}`} 
             style={{ opacity: state.video.intensity / 100 }} />

        {/* Digital Human Overlay */}
        {state.selectedDigitalHuman && (
          <motion.div 
            drag={!state.isLive}
            dragMomentum={false}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: state.digitalHumanScale }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-3/4 flex items-end justify-center z-10 cursor-move group"
          >
            <div className="relative h-full flex items-end justify-center">
              <img 
                src={DIGITAL_HUMANS.find(h => h.id === state.selectedDigitalHuman)?.thumbnail} 
                alt="Digital Human"
                className="h-full object-contain pointer-events-none"
                referrerPolicy="no-referrer"
              />
              
              {/* Scale Control */}
              {!state.isLive && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md rounded-lg px-2 py-1 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 border border-white/10">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setState(prev => ({ ...prev, digitalHumanScale: Math.max(0.5, prev.digitalHumanScale - 0.1) })) }}
                    className="w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded text-white"
                  >-</button>
                  <span className="text-[10px] font-mono w-8 text-center text-white">{Math.round(state.digitalHumanScale * 100)}%</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setState(prev => ({ ...prev, digitalHumanScale: Math.min(3, prev.digitalHumanScale + 0.1) })) }}
                    className="w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded text-white"
                  >+</button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Entertainment Tool View */}
        {state.activeEntertainment && (
          <div className="absolute inset-0 z-50 pointer-events-auto">
            <EntertainmentToolView 
              toolId={state.activeEntertainment} 
              onClose={() => setState(prev => ({ ...prev, activeEntertainment: null }))} 
            />
          </div>
        )}

        {/* Real Camera Window */}
        {state.camera.enabled && (
          <motion.div 
            drag={!state.isLive}
            dragMomentum={false}
            className="absolute z-20 cursor-move group"
            style={{ 
              bottom: 100, 
              right: 20,
              scale: state.camera.scale
            }}
          >
            <div className={`relative overflow-hidden rounded-2xl border-2 border-white/20 shadow-2xl bg-black ${state.camera.aiMatting ? 'mask-camera' : ''}`}>
              <video 
                ref={videoRef}
                autoPlay 
                playsInline
                className="w-40 h-56 object-cover"
                style={{ 
                  filter: `brightness(${state.camera.brightness}%) contrast(${state.camera.contrast}%) blur(${state.camera.smoothing * 0.5}px)`,
                  transform: state.camera.position === 'front' ? 'scaleX(-1)' : 'none'
                }}
              />
              
              {/* Scale Control */}
              {!state.isLive && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md rounded-lg px-2 py-1 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 border border-white/10">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setState(prev => ({ ...prev, camera: { ...prev.camera, scale: Math.max(0.5, prev.camera.scale - 0.1) } })) }}
                    className="w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded"
                  >-</button>
                  <span className="text-[10px] font-mono w-8 text-center">{Math.round(state.camera.scale * 100)}%</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setState(prev => ({ ...prev, camera: { ...prev.camera, scale: Math.min(3, prev.camera.scale + 0.1) } })) }}
                    className="w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded"
                  >+</button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Active Components Layer */}
        <div className="absolute inset-0 pointer-events-none p-8">
          {state.activeComponents.map(id => {
            const comp = LIVE_COMPONENTS.find(c => c.id === id);
            if (!comp) return null;
            const componentState = state.componentStates[id] || { scale: 1 };
            return (
              <motion.div 
                key={id}
                drag={!state.isLive}
                dragMomentum={false}
                className="absolute pointer-events-auto cursor-move flex flex-col items-center group"
                style={{ 
                  top: 200 + (parseInt(id) * 20 % 300), 
                  left: 100 + (parseInt(id) * 30 % 200),
                  scale: componentState.scale
                }}
              >
                <div className="relative p-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm flex items-center gap-2 shadow-lg hover:border-emerald-500/50 transition-colors">
                  <span className="text-2xl">{comp.icon}</span>
                  <span className="text-sm font-medium whitespace-nowrap">{comp.name}</span>
                  
                  {/* Scale Control - Hidden during Live */}
                  {!state.isLive && (
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md rounded-lg px-2 py-1 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 border border-white/10">
                      <button 
                        onClick={(e) => { e.stopPropagation(); updateComponentScale(id, Math.max(0.5, componentState.scale - 0.1)); }}
                        className="w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded"
                      >-</button>
                      <span className="text-[10px] font-mono w-8 text-center">{Math.round(componentState.scale * 100)}%</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); updateComponentScale(id, Math.min(3, componentState.scale + 0.1)); }}
                        className="w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded"
                      >+</button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
          
          {/* Default Text Overlay - Hidden in Live Mode */}
          {!state.isLive && (
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 text-center w-full px-10">
              <p className="text-white/80 text-lg mb-4 tracking-widest">生活不会辜负每一个努力的人</p>
              <h1 className="text-6xl font-black tracking-tighter text-white/90 drop-shadow-2xl">
                加油！<span className="border-2 border-white/30 px-2">直播搞起</span>
              </h1>
            </div>
          )}
        </div>

        {/* UI Controls - Hidden during Live */}
        <AnimatePresence>
          {!state.isLive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Left Sidebar */}
              <div className="absolute left-2 md:left-4 top-10 flex flex-col gap-4 md:gap-6 scale-90 md:scale-100">
                <SidebarIcon icon={<Video size={24} />} label="视频" onClick={() => setActiveModal('video')} active={activeModal === 'video'} />
                <SidebarIcon icon={<Mic size={24} />} label="语音" onClick={() => setActiveModal('audio')} active={activeModal === 'audio'} />
                <SidebarIcon icon={<User size={24} />} label="数字人" onClick={() => setActiveModal('digital-human')} active={activeModal === 'digital-human'} />
                <SidebarIcon icon={<Gamepad2 size={24} />} label="娱乐" onClick={() => setActiveModal('entertainment')} active={activeModal === 'entertainment'} />
                <SidebarIcon icon={<ImageIcon size={24} />} label="图片" onClick={() => {}} />
                <SidebarIcon icon={<Sparkles size={24} />} label="特效" onClick={() => setActiveModal('components')} active={activeModal === 'components'} />
                <SidebarIcon icon={<Camera size={24} />} label="摄像头" onClick={() => setActiveModal('camera')} active={activeModal === 'camera'} />
              </div>

              {/* Right Sidebar */}
              <div className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 md:gap-6 scale-90 md:scale-100">
                <SidebarIcon icon={<BarChart3 size={24} />} label="数据" onClick={() => {}} />
                <SidebarIcon icon={<Trash2 size={24} />} label="清屏" onClick={() => setState(prev => ({ ...prev, activeComponents: [], activeEffect: null, selectedDigitalHuman: null, activeEntertainment: null, camera: { ...prev.camera, enabled: false } }))} />
                <SidebarIcon icon={<Smartphone size={24} />} label="竖屏" onClick={() => {}} />
                <SidebarIcon icon={<HelpCircle size={24} />} label="帮助" onClick={() => {}} />
              </div>

              {/* Bottom Action */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
                <button 
                  onClick={() => setState(prev => ({ ...prev, isLive: true }))}
                  className="px-12 bg-gradient-to-r from-emerald-600 to-teal-700 py-4 rounded-2xl flex items-center justify-center gap-3 text-lg font-bold shadow-xl active:scale-95 transition-transform whitespace-nowrap"
                >
                  <Play fill="currentColor" size={24} />
                  开始直播
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Exit Hint */}
        {state.isLive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-xs text-white/60 pointer-events-none"
          >
            双击屏幕退出直播模式
          </motion.div>
        )}

        {/* Modals Overlay */}
        <AnimatePresence>
          {activeModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end"
              onClick={() => setActiveModal(null)}
            >
              <motion.div 
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-full bg-[#1c1c1e] rounded-t-[40px] p-8 max-h-[85%] overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                {renderModal()}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SidebarIcon({ icon, label, onClick, active }: { icon: React.ReactNode, label?: string, onClick: () => void, active?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1 group" onClick={onClick}>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all ${active ? 'bg-white text-black scale-110' : 'bg-black/40 text-white hover:bg-black/60'}`}>
        {icon}
      </div>
      {label && <span className="text-[10px] font-bold text-white/80 uppercase tracking-tighter">{label}</span>}
    </div>
  );
}

// --- Modals ---

function ComponentsModal({ state, onToggle, onClose }: { state: AppState, onToggle: (id: string) => void, onClose: () => void }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">组件添加</h2>
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full"><X size={20} /></button>
      </div>
      <div className="grid grid-cols-5 gap-4">
        {LIVE_COMPONENTS.map(comp => {
          const isActive = state.activeComponents.includes(comp.id) || state.activeEffect === comp.id;
          return (
            <div 
              key={comp.id} 
              className="flex flex-col items-center gap-2 cursor-pointer group"
              onClick={() => onToggle(comp.id)}
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-all ${isActive ? 'bg-emerald-500/20 border-2 border-emerald-500 scale-105' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}>
                {comp.icon}
              </div>
              <span className="text-[10px] text-center text-white/60 truncate w-full">{comp.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DigitalHumanModal({ state, onSelect, onClose }: { state: AppState, onSelect: (id: string) => void, onClose: () => void }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">数字人</h2>
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full"><X size={20} /></button>
      </div>
      <div className="grid grid-cols-3 gap-6">
        {DIGITAL_HUMANS.map(human => (
          <div 
            key={human.id} 
            className="flex flex-col items-center gap-3 cursor-pointer"
            onClick={() => onSelect(human.id)}
          >
            <div className={`relative w-full aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all ${state.selectedDigitalHuman === human.id ? 'border-emerald-500 scale-105 shadow-lg shadow-emerald-500/20' : 'border-white/10'}`}>
              <img src={human.thumbnail} alt={human.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              {state.selectedDigitalHuman === human.id && (
                <div className="absolute top-2 right-2 bg-emerald-500 rounded-full p-1">
                  <Check size={12} />
                </div>
              )}
            </div>
            <span className="font-bold text-sm">{human.name}</span>
          </div>
        ))}
      </div>
      <div className="mt-8 pt-8 border-t border-white/10">
        <p className="text-white/40 text-sm">未选择</p>
      </div>
    </div>
  );
}

function AudioModal({ state, onUpdate, onClose }: { state: AppState, onUpdate: (audio: AudioSettings) => void, onClose: () => void }) {
  const [view, setView] = useState<'library' | 'record' | 'tts'>('library');
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [activeTab, setActiveTab] = useState<'script' | 'product' | 'reply'>('script');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLibrary = state.audio.library.filter(item => 
    item.type === activeTab && 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveAudio = (item: AudioLibraryItem) => {
    onUpdate({
      ...state.audio,
      library: [item, ...state.audio.library]
    });
    setView('library');
  };

  if (view === 'record') {
    return <RecordVoiceView onBack={() => setView('library')} onSave={handleSaveAudio} />;
  }

  if (view === 'tts') {
    return <TTSView onBack={() => setView('library')} onSave={handleSaveAudio} />;
  }

  return (
    <div className="relative min-h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl font-bold">语音库</h2>
        <button 
          onClick={() => setShowAddOptions(true)}
          className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-1"
        >
          添加语音
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
        <input 
          type="text" 
          placeholder="请输入关键词搜索" 
          className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 mb-6">
        {(['script', 'product', 'reply'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === tab ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
          >
            {tab === 'script' ? '话术语音' : tab === 'product' ? '商品语音' : '回复语音'}
            {activeTab === tab && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-emerald-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {filteredLibrary.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-20 opacity-40">
            <Music size={48} className="mb-4" />
            <p className="text-sm">暂无语音，请添加</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLibrary.map(item => (
              <div key={item.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                    <Volume2 size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{item.name}</h4>
                    <p className="text-[10px] text-white/40 mt-0.5">{item.duration} | {item.createdAt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors">
                    <Play size={16} fill="currentColor" />
                  </button>
                  <button 
                    onClick={() => {
                      onUpdate({
                        ...state.audio,
                        library: state.audio.library.filter(i => i.id !== item.id)
                      });
                    }}
                    className="p-2 hover:bg-red-500/20 rounded-lg text-white/40 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating TTS Button */}
      <button 
        onClick={() => setView('tts')}
        className="absolute bottom-4 left-4 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 shadow-lg shadow-indigo-500/20 flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform border border-white/20"
      >
        <span className="text-[10px] font-bold leading-none">语音</span>
        <span className="text-[10px] font-bold leading-none">合成</span>
      </button>

      {/* Add Options Modal */}
      <AnimatePresence>
        {showAddOptions && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-6"
            onClick={() => setShowAddOptions(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#2c2c2e] w-full max-w-xs rounded-2xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-white/5">
                <h3 className="text-center font-bold text-lg">请选择添加方式</h3>
              </div>
              <div className="flex flex-col">
                <button 
                  className="py-5 px-6 hover:bg-white/5 transition-colors text-center font-medium border-b border-white/5"
                  onClick={() => {
                    // Simulate file selection
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'audio/*';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        handleSaveAudio({
                          id: Math.random().toString(36).substr(2, 9),
                          name: file.name.split('.')[0],
                          type: activeTab,
                          url: URL.createObjectURL(file),
                          duration: '00:00',
                          createdAt: new Date().toLocaleDateString()
                        });
                      }
                    };
                    input.click();
                    setShowAddOptions(false);
                  }}
                >
                  从手机中选择
                </button>
                <button 
                  className="py-5 px-6 hover:bg-white/5 transition-colors text-center font-medium"
                  onClick={() => {
                    setView('record');
                    setShowAddOptions(false);
                  }}
                >
                  录制语音
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RecordVoiceView({ onBack, onSave }: { onBack: () => void, onSave: (item: AudioLibraryItem) => void }) {
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [name, setName] = useState('');
  const [script, setScript] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      setTimer(0);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setScript(text);
    } catch (err) {
      console.error('Failed to read clipboard', err);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[600px]">
      <div className="flex justify-between items-center mb-6">
        <button onClick={onBack} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl font-bold">录制语音文件</h2>
        <div className="w-10" />
      </div>

      <div className="space-y-4 flex-1">
        {/* Name Input */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
          <span className="font-bold text-sm">名称:</span>
          <input 
            type="text" 
            placeholder="请填写名称" 
            className="bg-transparent text-right text-sm focus:outline-none placeholder:text-white/20"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        {/* Timer Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col items-center gap-6">
          <div className="text-5xl font-mono tracking-wider">{formatTime(timer)}</div>
          <button 
            onClick={handleToggleRecording}
            className={`px-8 py-3 rounded-xl font-bold transition-all active:scale-95 flex items-center gap-2 ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
          >
            {isRecording ? <Pause size={20} /> : <Mic size={20} />}
            {isRecording ? '停止录音' : '开始录音'}
          </button>
        </div>

        {/* Script Area */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-4">
          <textarea 
            className="w-full h-40 bg-white/5 rounded-xl p-4 text-sm resize-none focus:outline-none placeholder:text-white/20"
            placeholder="请粘贴需要录制的语音文本"
            value={script}
            onChange={e => setScript(e.target.value)}
          />
          <div className="flex justify-center">
            <button 
              onClick={handlePaste}
              className="bg-emerald-500 hover:bg-emerald-600 px-8 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2"
            >
              <Clipboard size={18} />
              粘贴文本
            </button>
          </div>
        </div>
      </div>

      <button 
        onClick={() => {
          if (!name) return;
          onSave({
            id: Math.random().toString(36).substr(2, 9),
            name,
            type: 'script',
            url: '', // In a real app, this would be the recorded blob URL
            duration: formatTime(timer).substring(3),
            createdAt: new Date().toLocaleDateString()
          });
        }}
        className="w-full bg-emerald-500 hover:bg-emerald-600 py-4 rounded-xl font-bold mt-6 shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform"
      >
        保存录音
      </button>
    </div>
  );
}

function TTSView({ onBack, onSave }: { onBack: () => void, onSave: (item: AudioLibraryItem) => void }) {
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [speed, setSpeed] = useState(1.0);
  const [volume, setVolume] = useState(100);
  const [pitch, setPitch] = useState(0);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const handleSynthesize = () => {
    setIsSynthesizing(true);
    setTimeout(() => {
      setIsSynthesizing(false);
      // In a real app, this would trigger the actual TTS engine
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full min-h-[600px]">
      <div className="flex justify-between items-center mb-6">
        <button onClick={onBack} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl font-bold">文字合成语音</h2>
        <div className="w-10" />
      </div>

      <div className="space-y-4 flex-1">
        {/* Name Input */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
          <span className="font-bold text-sm">名称:</span>
          <input 
            type="text" 
            placeholder="请填写名称" 
            className="bg-transparent text-right text-sm focus:outline-none placeholder:text-white/20"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        {/* Text Area */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-bold text-sm">文案: (不超过300个字)</span>
            <span className="text-[10px] text-white/40">{text.length}/300</span>
          </div>
          <textarea 
            className="w-full h-40 bg-transparent text-sm resize-none focus:outline-none placeholder:text-white/20"
            placeholder="请输入语音文案"
            maxLength={300}
            value={text}
            onChange={e => setText(e.target.value)}
          />
        </div>

        {/* Settings Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-center">
            <span className="font-bold text-sm">声音:</span>
            <button className="text-sm text-white/40 hover:text-white flex items-center gap-1">
              请选择 <ChevronRight size={16} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-xs text-white/60 w-12">语速:</span>
              <input 
                type="range" 
                min="0.5" max="2.0" step="0.1"
                className="flex-1 accent-emerald-500"
                value={speed}
                onChange={e => setSpeed(parseFloat(e.target.value))}
              />
              <span className="text-xs font-mono w-8 text-right">{speed.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-white/60 w-12">音量:</span>
              <input 
                type="range" 
                min="0" max="100"
                className="flex-1 accent-emerald-500"
                value={volume}
                onChange={e => setVolume(parseInt(e.target.value))}
              />
              <span className="text-xs font-mono w-8 text-right">{volume}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-white/60 w-12">音调:</span>
              <input 
                type="range" 
                min="-10" max="10"
                className="flex-1 accent-emerald-500"
                value={pitch}
                onChange={e => setPitch(parseInt(e.target.value))}
              />
              <span className="text-xs font-mono w-8 text-right">{pitch}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button 
            onClick={handleSynthesize}
            disabled={isSynthesizing}
            className="bg-emerald-500 hover:bg-emerald-600 px-12 py-3 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {isSynthesizing ? <RotateCcw size={20} className="animate-spin" /> : <Sparkles size={20} />}
            {isSynthesizing ? '合成中...' : '合成'}
          </button>
        </div>
      </div>

      <button 
        onClick={() => {
          if (!name) return;
          onSave({
            id: Math.random().toString(36).substr(2, 9),
            name,
            type: 'script',
            url: '',
            duration: '00:15',
            createdAt: new Date().toLocaleDateString()
          });
        }}
        className="w-full bg-emerald-500 hover:bg-emerald-600 py-4 rounded-xl font-bold mt-6 shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform"
      >
        保存语音
      </button>
    </div>
  );
}

function VideoModal({ state, onUpdate, onClose }: { state: AppState, onUpdate: (video: VideoSettings) => void, onClose: () => void }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">视频</h2>
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full"><X size={20} /></button>
      </div>

      <div className="space-y-8">
        <section>
          <h3 className="text-lg font-bold mb-4">视频</h3>
          <div className="flex gap-8">
            <Radio label="开启" checked={state.video.enabled} onChange={() => onUpdate({ ...state.video, enabled: true })} />
            <Radio label="关闭" checked={!state.video.enabled} onChange={() => onUpdate({ ...state.video, enabled: false })} />
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-4">视频大小</h3>
          <div className="grid grid-cols-3 gap-4">
            {(['default', '16:9', '4:3', 'full', 'stretch'] as VideoSize[]).map(s => (
              <Radio key={s} label={s === 'default' ? '默认' : s === 'full' ? '全屏' : s === 'stretch' ? '拉伸全屏' : s} checked={state.video.size === s} onChange={() => onUpdate({ ...state.video, size: s })} />
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-4">镜像效果</h3>
          <div className="flex flex-wrap gap-6">
            <Radio label="不开启" checked={state.video.mirror === 'none'} onChange={() => onUpdate({ ...state.video, mirror: 'none' })} />
            <Radio label="左右镜像" checked={state.video.mirror === 'horizontal'} onChange={() => onUpdate({ ...state.video, mirror: 'horizontal' })} />
            <Radio label="上下镜像" checked={state.video.mirror === 'vertical'} onChange={() => onUpdate({ ...state.video, mirror: 'vertical' })} />
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-4">智能去重</h3>
          <div className="grid grid-cols-3 gap-4">
            {(['none', 'filter1', 'blur', 'bw', 'brightness', 'filter5'] as DeDuplicationFilter[]).map(f => (
              <div 
                key={f} 
                className={`p-3 rounded-xl border-2 text-center cursor-pointer transition-all ${state.video.filter === f ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 bg-white/5'}`}
                onClick={() => onUpdate({ ...state.video, filter: f })}
              >
                <div className="text-xs font-bold">{getFilterName(f)}</div>
                {state.video.filter === f && <Check size={12} className="mx-auto mt-1 text-emerald-500" />}
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex justify-between mb-4">
            <h3 className="text-lg font-bold">去重强度</h3>
            <span className="text-emerald-500 font-bold">{state.video.intensity}</span>
          </div>
          <input 
            type="range" 
            className="w-full accent-emerald-500" 
            value={state.video.intensity} 
            onChange={e => onUpdate({ ...state.video, intensity: parseInt(e.target.value) })} 
          />
        </section>

        <section>
          <h3 className="text-lg font-bold mb-4">视频源</h3>
          <div className="flex gap-6">
            <Radio label="本地视频" checked={state.video.source === 'local'} onChange={() => onUpdate({ ...state.video, source: 'local' })} />
            <Radio label="网络视频" checked={state.video.source === 'network'} onChange={() => onUpdate({ ...state.video, source: 'network' })} />
            <Radio label="转播" checked={state.video.source === 'relay'} onChange={() => onUpdate({ ...state.video, source: 'relay' })} />
          </div>
          {state.video.source === 'local' && (
            <div className="mt-4">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:bg-white/5 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Video className="w-8 h-8 mb-3 text-white/40" />
                  <p className="mb-2 text-sm text-white/60">
                    <span className="font-semibold">点击上传本地视频</span>
                  </p>
                  <p className="text-xs text-white/40">MP4, WebM (MAX. 50MB)</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      onUpdate({ ...state.video, localVideoUrl: url });
                    }
                  }}
                />
              </label>
              {state.video.localVideoUrl && (
                <p className="mt-2 text-xs text-emerald-500 flex items-center gap-1">
                  <Check size={12} /> 视频已加载
                </p>
              )}
            </div>
          )}
          {state.video.source === 'relay' && (
            <div className="mt-4 flex gap-2">
              <input 
                type="text" 
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm" 
                placeholder="请粘贴分享链接后点击解析"
                value={state.video.relayUrl}
                onChange={e => onUpdate({ ...state.video, relayUrl: e.target.value })}
              />
              <button className="bg-emerald-600 px-6 rounded-xl font-bold">解析</button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function CameraModal({ state, onUpdate, onClose }: { state: AppState, onUpdate: (camera: CameraSettings) => void, onClose: () => void }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">摄像头</h2>
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full"><X size={20} /></button>
      </div>

      <div className="space-y-8">
        <section>
          <h3 className="text-lg font-bold mb-4">摄像头</h3>
          <div className="flex gap-8">
            <Radio label="开启" checked={state.camera.enabled} onChange={() => onUpdate({ ...state.camera, enabled: true })} />
            <Radio label="关闭" checked={!state.camera.enabled} onChange={() => onUpdate({ ...state.camera, enabled: false })} />
          </div>
        </section>

        <section>
          <div className="flex gap-8">
            <Radio label="前置" checked={state.camera.position === 'front'} onChange={() => onUpdate({ ...state.camera, position: 'front' })} />
            <Radio label="后置" checked={state.camera.position === 'back'} onChange={() => onUpdate({ ...state.camera, position: 'back' })} />
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-4">AI抠像</h3>
          <div className="flex gap-8">
            <Radio label="开启" checked={state.camera.aiMatting} onChange={() => onUpdate({ ...state.camera, aiMatting: true })} />
            <Radio label="关闭" checked={!state.camera.aiMatting} onChange={() => onUpdate({ ...state.camera, aiMatting: false })} />
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-4">美颜</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-white/60">磨皮</span>
                <span className="text-emerald-500 font-bold">{state.camera.smoothing}</span>
              </div>
              <input 
                type="range" 
                className="w-full accent-emerald-500" 
                min="0" max="10"
                value={state.camera.smoothing} 
                onChange={e => onUpdate({ ...state.camera, smoothing: parseInt(e.target.value) })} 
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-white/60">亮度</span>
                <span className="text-emerald-500 font-bold">{state.camera.brightness}</span>
              </div>
              <input 
                type="range" 
                className="w-full accent-emerald-500" 
                min="50" max="150"
                value={state.camera.brightness} 
                onChange={e => onUpdate({ ...state.camera, brightness: parseInt(e.target.value) })} 
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-white/60">对比度</span>
                <span className="text-emerald-500 font-bold">{state.camera.contrast}</span>
              </div>
              <input 
                type="range" 
                className="w-full accent-emerald-500" 
                min="0" max="100"
                value={state.camera.contrast} 
                onChange={e => onUpdate({ ...state.camera, contrast: parseInt(e.target.value) })} 
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

const Radio: React.FC<{ label: string; checked: boolean; onChange: () => void }> = ({ label, checked, onChange }) => {
  return (
    <div className="flex items-center gap-2 cursor-pointer group" onClick={onChange}>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${checked ? 'border-emerald-500' : 'border-white/30 group-hover:border-white/50'}`}>
        {checked && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
      </div>
      <span className={`text-sm font-medium ${checked ? 'text-white' : 'text-white/60'}`}>{label}</span>
    </div>
  );
};

function getFilterName(f: DeDuplicationFilter) {
  switch (f) {
    case 'none': return '关闭滤镜';
    case 'filter1': return '去重1号';
    case 'blur': return '周边模糊';
    case 'bw': return '经典黑白';
    case 'brightness': return '亮度滤镜';
    case 'filter5': return '去重5号';
    default: return '';
  }
}

function getFilterClass(f: DeDuplicationFilter) {
  switch (f) {
    case 'blur': return 'backdrop-blur-sm';
    case 'bw': return 'grayscale';
    case 'brightness': return 'brightness-125 contrast-110';
    case 'filter1': return 'sepia-[.2] contrast-125';
    case 'filter5': return 'hue-rotate-15 saturate-150';
    default: return '';
  }
}

function EntertainmentModal({ state, onSelect, onClose }: { state: AppState, onSelect: (id: string | null) => void, onClose: () => void }) {
  return (
    <div className="h-full flex flex-col bg-[#F8FBFF] relative overflow-hidden">
      {/* Abstract Background Pattern */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-200 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-purple-200 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col h-full p-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black text-[#1A237E] tracking-tight">推荐</h2>
          <button onClick={onClose} className="p-2 bg-black/5 rounded-full hover:bg-black/10 transition-colors">
            <X size={24} className="text-[#1A237E]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-5">
          {ENTERTAINMENT_TOOLS.map((tool) => (
            <div
              key={tool.id}
              className="flex items-center gap-4 p-5 rounded-[28px] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-white/60 transition-all hover:shadow-[0_15px_50px_rgba(0,0,0,0.06)] hover:-translate-y-1 active:scale-[0.98]"
            >
              <div className={`w-16 h-16 shrink-0 flex items-center justify-center rounded-[20px] text-3xl shadow-lg ${
                tool.id === 'phone' ? 'bg-[#FF5252]' :
                tool.id === 'car' ? 'bg-[#448AFF]' :
                tool.id === 'birthday' ? 'bg-[#4CAF50]' :
                tool.id === 'constellation' ? 'bg-[#FFD740]' :
                'bg-[#7C4DFF]'
              }`}>
                {tool.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-[#1A237E] truncate">{tool.name}</h3>
                <p className="text-[11px] text-[#1A237E]/50 line-clamp-2 leading-tight font-semibold mt-0.5">{tool.description}</p>
              </div>
              <button
                onClick={() => {
                  onSelect(tool.id);
                  onClose();
                }}
                className="px-6 py-2.5 bg-[#2979FF] hover:bg-[#2962FF] text-white text-sm font-black rounded-full shadow-xl shadow-blue-500/25 transition-all active:scale-90 shrink-0"
              >
                立即测试
              </button>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4">
          <button 
            className="w-full bg-[#1A237E] text-white py-4 rounded-2xl font-black shadow-2xl shadow-indigo-900/30 transition-all active:scale-95 text-lg" 
            onClick={onClose}
          >
            返回主页
          </button>
        </div>
      </div>
    </div>
  );
}

function EntertainmentToolView({ toolId, onClose }: { toolId: string, onClose: () => void }) {
  const tool = ENTERTAINMENT_TOOLS.find(t => t.id === toolId);
  const [isCalculating, setIsCalculating] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [inputs, setInputs] = useState<any>({});

  if (!tool) return null;

  const handleCalculate = () => {
    setIsCalculating(true);
    // Simulate calculation time
    setTimeout(() => {
      let newResult = {};
      switch (toolId) {
        case 'zodiac':
          const zodiacs = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
          const meanings = ['天伦之乐', '相敬如宾', '龙凤呈祥', '百年好合', '心心相印', '白头偕老'];
          newResult = {
            male: inputs.male || zodiacs[Math.floor(Math.random() * zodiacs.length)],
            female: inputs.female || zodiacs[Math.floor(Math.random() * zodiacs.length)],
            score: Math.floor(Math.random() * 20) + 80 + '%',
            meaning: meanings[Math.floor(Math.random() * meanings.length)]
          };
          break;
        case 'constellation':
          const constellations = ['白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座', '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座'];
          const cMeanings = ['凤凰于飞', '琴瑟和鸣', '珠联璧合', '佳偶天成', '相濡以沫'];
          newResult = {
            male: inputs.male || constellations[Math.floor(Math.random() * constellations.length)],
            female: inputs.female || constellations[Math.floor(Math.random() * constellations.length)],
            score: Math.floor(Math.random() * 30) + 70,
            meaning: cMeanings[Math.floor(Math.random() * cMeanings.length)]
          };
          break;
        case 'birthday':
          const bMeanings = ['合家欢乐开开心心', '福星高照万事大吉', '财源广进大吉大利', '前程似锦一帆风顺'];
          newResult = {
            date: inputs.date || '2026-03-25',
            score: Math.floor(Math.random() * 10) + 90,
            meaning: bMeanings[Math.floor(Math.random() * bMeanings.length)]
          };
          break;
        case 'car':
          const provinces = ['京', '沪', '津', '渝', '冀', '晋', '蒙', '辽', '吉', '黑', '苏', '浙', '皖', '闽', '赣', '鲁', '豫', '鄂', '湘', '粤', '桂', '琼', '川', '贵', '云', '藏', '陕', '甘', '青', '宁', '新'];
          const cities = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
          const carMeanings = ['路路畅通', '出入平安', '财源滚滚', '大吉大利'];
          const locations = ['山西·长治', '北京·朝阳', '广东·深圳', '上海·浦东', '浙江·杭州'];
          newResult = {
            plate: inputs.plate || (provinces[Math.floor(Math.random() * provinces.length)] + cities[Math.floor(Math.random() * cities.length)] + Math.floor(Math.random() * 90000 + 10000)),
            value: Math.floor(Math.random() * 50000 + 10000) + '元',
            location: locations[Math.floor(Math.random() * locations.length)],
            meaning: carMeanings[Math.floor(Math.random() * carMeanings.length)]
          };
          break;
        case 'phone':
          const pLevels = ['牛掰', '极好', '优秀', '大吉'];
          const pMeanings = ['花开富贵', '财运亨通', '事业有成', '万事如意'];
          newResult = {
            number: inputs.number || Math.floor(Math.random() * 9000 + 1000).toString(),
            value: Math.floor(Math.random() * 100000 + 10000),
            level: pLevels[Math.floor(Math.random() * pLevels.length)],
            meaning: pMeanings[Math.floor(Math.random() * pMeanings.length)]
          };
          break;
      }
      setResults(newResult);
      setIsCalculating(false);
    }, 1500);
  };

  const renderToolContent = () => {
    switch (toolId) {
      case 'zodiac':
        return (
          <div className="flex flex-col h-full bg-[#FFB347] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,_#fff_0%,_transparent_70%)]" />
            
            <div className="mt-8 mx-auto relative z-10">
              <div className="bg-[#5C6BC0] px-12 py-2 rounded-full border-4 border-[#9FA8DA] shadow-lg">
                <h2 className="text-white text-xl font-bold tracking-[0.2em]">生肖测评</h2>
              </div>
            </div>

            <div className="mt-6 mx-4 bg-white rounded-[32px] p-6 shadow-2xl relative z-10">
              <div className="space-y-4">
                <div className="bg-[#E3F2FD] p-4 rounded-full flex items-center gap-4 shadow-inner cursor-pointer hover:bg-[#BBDEFB] transition-colors" onClick={() => {
                  const zodiacs = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
                  setInputs({ ...inputs, male: zodiacs[Math.floor(Math.random() * zodiacs.length)] });
                }}>
                  <span className="text-[#1A237E] font-bold shrink-0">生肖(男):</span>
                  <span className="text-[#1A237E] font-bold">{inputs.male || '请选择'}</span>
                </div>
                <div className="bg-[#E3F2FD] p-4 rounded-full flex items-center gap-4 shadow-inner cursor-pointer hover:bg-[#BBDEFB] transition-colors" onClick={() => {
                  const zodiacs = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
                  setInputs({ ...inputs, female: zodiacs[Math.floor(Math.random() * zodiacs.length)] });
                }}>
                  <span className="text-[#1A237E] font-bold shrink-0">生肖(女):</span>
                  <span className="text-[#1A237E] font-bold">{inputs.female || '请选择'}</span>
                </div>
              </div>

              <button 
                onClick={handleCalculate}
                disabled={isCalculating}
                className="mt-8 w-full relative group"
              >
                <div className="absolute inset-0 bg-[#D84315] rounded-full blur-sm group-hover:blur-md transition-all" />
                <div className="relative bg-gradient-to-b from-[#FFF176] to-[#FBC02D] border-4 border-[#FFEB3B] rounded-full py-3 shadow-lg">
                  <span className="text-[#BF360C] text-2xl font-black tracking-[0.3em]">
                    {isCalculating ? '测算中...' : '立即测算'}
                  </span>
                </div>
              </button>
            </div>

            {results && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 flex-1 flex flex-col"
              >
                <div className="bg-[#F06292] py-3 px-6 flex justify-between text-white font-bold text-lg">
                  <span>生肖({results.male}+{results.female})</span>
                  <span>幸福指数</span>
                  <span>寓意</span>
                </div>
                <div className="flex-1 bg-transparent py-4 px-6 flex justify-between text-[#1A237E] font-bold text-xl">
                  <span>{results.male}{results.female}</span>
                  <span>{results.score}</span>
                  <span>{results.meaning}</span>
                </div>
              </motion.div>
            )}
          </div>
        );

      case 'constellation':
        return (
          <div className="flex flex-col h-full bg-[#1A237E] relative overflow-hidden">
            <div className="absolute inset-0 opacity-40">
              <div className="absolute top-10 left-10 w-20 h-20 bg-red-500 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-20 right-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
            </div>
            
            <div className="mt-8 mx-auto relative z-10">
              <div className="bg-[#5C6BC0] px-12 py-2 rounded-full border-4 border-[#9FA8DA] shadow-lg">
                <h2 className="text-white text-xl font-bold tracking-[0.2em]">星座测评</h2>
              </div>
            </div>

            <div className="mt-6 mx-4 bg-white rounded-[32px] p-6 shadow-2xl relative z-10">
              <div className="space-y-4">
                <div className="bg-[#E3F2FD] p-4 rounded-full flex items-center gap-4 shadow-inner cursor-pointer hover:bg-[#BBDEFB] transition-colors" onClick={() => {
                  const constellations = ['白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座', '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座'];
                  setInputs({ ...inputs, male: constellations[Math.floor(Math.random() * constellations.length)] });
                }}>
                  <span className="text-[#1A237E] font-bold shrink-0">男星座:</span>
                  <span className="text-[#1A237E] font-bold">{inputs.male || '请选择'}</span>
                </div>
                <div className="bg-[#E3F2FD] p-4 rounded-full flex items-center gap-4 shadow-inner cursor-pointer hover:bg-[#BBDEFB] transition-colors" onClick={() => {
                  const constellations = ['白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座', '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座'];
                  setInputs({ ...inputs, female: constellations[Math.floor(Math.random() * constellations.length)] });
                }}>
                  <span className="text-[#1A237E] font-bold shrink-0">女星座:</span>
                  <span className="text-[#1A237E] font-bold">{inputs.female || '请选择'}</span>
                </div>
              </div>

              <button 
                onClick={handleCalculate}
                disabled={isCalculating}
                className="mt-8 w-full relative group"
              >
                <div className="absolute inset-0 bg-[#D84315] rounded-full blur-sm group-hover:blur-md transition-all" />
                <div className="relative bg-gradient-to-b from-[#FFF176] to-[#FBC02D] border-4 border-[#FFEB3B] rounded-full py-3 shadow-lg">
                  <span className="text-[#BF360C] text-2xl font-black tracking-[0.3em]">
                    {isCalculating ? '测算中...' : '立即测算'}
                  </span>
                </div>
              </button>
            </div>

            {results && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 flex-1 flex flex-col"
              >
                <div className="bg-[#FF0000] py-3 px-6 flex justify-between text-white font-bold text-lg">
                  <span>星座({results.male}+{results.female})</span>
                  <span>幸福指数</span>
                  <span>寓意</span>
                </div>
                <div className="flex-1 bg-transparent py-4 px-6 flex justify-between text-white font-bold text-xl">
                  <span>{results.male}{results.female}</span>
                  <span className="flex items-center gap-1"><Heart size={20} fill="red" className="text-red-500" /> {results.score}</span>
                  <span>{results.meaning}</span>
                </div>
              </motion.div>
            )}
          </div>
        );

      case 'birthday':
        return (
          <div className="flex flex-col h-full bg-[#7986CB] relative overflow-hidden">
            <div className="mt-8 mx-auto relative z-10">
              <div className="bg-[#5C6BC0] px-12 py-2 rounded-full border-4 border-[#9FA8DA] shadow-lg">
                <h2 className="text-white text-xl font-bold tracking-[0.1em]">请输入测试所需信息</h2>
              </div>
            </div>

            <div className="mt-6 mx-4 bg-white rounded-[32px] p-6 shadow-2xl relative z-10">
              <div className="space-y-4">
                <div className="bg-[#E3F2FD] p-4 rounded-full flex items-center gap-4 shadow-inner">
                  <span className="text-[#1A237E] font-bold shrink-0">生辰:</span>
                  <input 
                    type="date" 
                    className="bg-transparent text-[#1A237E] font-bold outline-none flex-1"
                    value={inputs.date || '2026-03-25'}
                    onChange={(e) => setInputs({ ...inputs, date: e.target.value })}
                  />
                </div>
              </div>

              <button 
                onClick={handleCalculate}
                disabled={isCalculating}
                className="mt-8 w-full relative group"
              >
                <div className="absolute inset-0 bg-[#D84315] rounded-full blur-sm group-hover:blur-md transition-all" />
                <div className="relative bg-gradient-to-b from-[#FFF176] to-[#FBC02D] border-4 border-[#FFEB3B] rounded-full py-3 shadow-lg">
                  <span className="text-[#BF360C] text-2xl font-black tracking-[0.3em]">
                    {isCalculating ? '测算中...' : '立即测算'}
                  </span>
                </div>
              </button>
            </div>

            {results && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 flex-1 flex flex-col"
              >
                <div className="py-3 px-6 flex justify-between text-white font-bold text-xl">
                  <span>生辰</span>
                  <span>评分:</span>
                  <span>寓意</span>
                </div>
                <div className="flex-1 bg-transparent py-4 px-6 flex justify-between text-white font-bold text-xl">
                  <span>{results.date}</span>
                  <span>{results.score}</span>
                  <span>{results.meaning}</span>
                </div>
              </motion.div>
            )}
          </div>
        );

      case 'car':
        return (
          <div className="flex flex-col h-full bg-[#B71C1C] relative overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-[#FFD54F]/20 to-transparent" />
              <img src="https://picsum.photos/seed/car_bg/800/1200" className="absolute inset-0 w-full h-full object-cover opacity-30" referrerPolicy="no-referrer" />
            </div>

            <div className="mt-12 mx-auto relative z-10 text-center">
              <h1 className="text-5xl font-black text-[#FFD54F] drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] italic tracking-tighter">
                车牌吉运鉴定
              </h1>
            </div>

            <div className="mt-8 mx-4 bg-white rounded-2xl p-6 shadow-2xl relative z-10 border-4 border-[#FFD54F]/30">
              <h3 className="text-[#B71C1C] text-xl font-bold text-center mb-6">车牌号评测</h3>
              <div className="border-2 border-[#E0E0E0] rounded-full p-4 flex items-center gap-4">
                <span className="text-black font-bold shrink-0">车牌号:</span>
                <input 
                  type="text"
                  placeholder="如: 晋D34553"
                  className="bg-transparent text-black font-bold outline-none flex-1"
                  value={inputs.plate || ''}
                  onChange={(e) => setInputs({ ...inputs, plate: e.target.value })}
                />
              </div>

              <button 
                onClick={handleCalculate}
                disabled={isCalculating}
                className="mt-8 w-full relative group"
              >
                <div className="absolute inset-0 bg-[#D84315] rounded-full blur-sm" />
                <div className="relative bg-gradient-to-b from-[#FFF176] to-[#FBC02D] border-2 border-[#FFEB3B] rounded-full py-3 shadow-lg">
                  <span className="text-[#BF360C] text-xl font-black tracking-[0.2em]">
                    {isCalculating ? '鉴定中...' : '立即鉴定'}
                  </span>
                </div>
              </button>
            </div>

            {results && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-8 mx-4 relative z-10 flex flex-col overflow-hidden rounded-xl shadow-2xl"
              >
                <div className="bg-[#0D47A1] py-4 text-center">
                  <span className="text-white text-4xl font-black tracking-widest">{results.plate}</span>
                </div>
                <div className="grid grid-cols-2">
                  <div className="bg-[#BDBDBD] p-4 text-center border-r border-white/20">
                    <span className="text-[#0D47A1] font-bold text-lg">车牌估值</span>
                  </div>
                  <div className="bg-white p-4 text-center">
                    <span className="text-[#0D47A1] font-black text-2xl tracking-tighter">{results.value}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2">
                  <div className="bg-[#0D47A1] p-2 text-center border-r border-white/20">
                    <span className="text-white font-bold">车牌归属</span>
                  </div>
                  <div className="bg-[#0D47A1] p-2 text-center">
                    <span className="text-white font-bold">{results.location}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2">
                  <div className="bg-[#BDBDBD] p-2 text-center border-r border-white/20">
                    <span className="text-[#0D47A1] font-bold">寓意:</span>
                  </div>
                  <div className="bg-[#BDBDBD] p-2 text-center">
                    <span className="text-[#0D47A1] font-bold">{results.meaning}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        );

      case 'phone':
        return (
          <div className="flex flex-col h-full bg-[#F44336] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-64">
              <img src="https://picsum.photos/seed/koi/800/400" className="w-full h-full object-cover opacity-60" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#F44336]" />
            </div>

            <div className="mt-12 mx-auto relative z-10 text-center">
              <h1 className="text-5xl font-black text-white drop-shadow-lg italic leading-tight">
                手机号码<br/>幸运测试
              </h1>
            </div>

            <div className="mt-8 mx-4 bg-white rounded-xl p-1 shadow-2xl relative z-10">
              <div className="border-4 border-[#FFD54F] rounded-lg p-6">
                <h3 className="text-[#B71C1C] text-xl font-bold text-center mb-6">手机后四位测试</h3>
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-black font-bold shrink-0">手机后四位</span>
                  <input 
                    type="text"
                    maxLength={4}
                    placeholder="如: 1111"
                    className="flex-1 bg-[#F5F5F5] p-3 rounded text-black font-bold outline-none"
                    value={inputs.number || ''}
                    onChange={(e) => setInputs({ ...inputs, number: e.target.value.replace(/\D/g, '') })}
                  />
                </div>
                <button 
                  onClick={handleCalculate}
                  disabled={isCalculating}
                  className="w-full bg-gradient-to-r from-[#FF9800] to-[#F57C00] py-3 rounded-lg text-white font-bold text-xl shadow-lg active:scale-95 transition-transform"
                >
                  {isCalculating ? '测算中...' : '查看结果'}
                </button>
              </div>
            </div>

            {results && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 px-4 relative z-10"
              >
                <div className="flex justify-between text-[#B71C1C] font-bold text-lg mb-4">
                  <span>手机尾号</span>
                  <span>估值</span>
                  <span>优秀程度</span>
                  <span>寓意</span>
                </div>
                <div className="flex justify-between text-[#B71C1C] font-bold text-xl">
                  <span>{results.number}</span>
                  <span>{results.value}</span>
                  <span>{results.level}</span>
                  <span>{results.meaning}</span>
                </div>
              </motion.div>
            )}
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white/5">
            <div className="text-6xl mb-6">{tool.icon}</div>
            <h3 className="text-2xl font-bold mb-4">{tool.name}</h3>
            <p className="text-white/60">{tool.description}</p>
          </div>
        );
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onDoubleClick={onClose}
      className="relative w-full h-full bg-black overflow-hidden shadow-2xl cursor-pointer"
      title="双击返回编辑模式"
    >
      {/* Content */}
      <div className="h-full relative select-none flex flex-col">
        {/* Live Header Overlay */}
        <div className="absolute top-4 left-4 z-50 flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center shadow-lg border-2 border-white/20">
            <User size={20} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-white text-xs font-bold leading-none">直播互动</span>
            <span className="text-white/60 text-[10px] leading-none mt-0.5">1.2w 本场热度</span>
          </div>
          <button className="ml-2 bg-[#FF2D55] text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg active:scale-95 transition-transform">
            关注
          </button>
        </div>

        {/* Online Users Overlay */}
        <div className="absolute top-4 right-32 z-50 flex items-center gap-1 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-white/20 bg-gray-800 overflow-hidden">
                <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>
          <span className="text-white text-[10px] font-bold ml-1">8234</span>
        </div>

        {/* Main Tool Content */}
        <div className="flex-1">
          {renderToolContent()}
        </div>

        {/* Bottom Interaction Bar */}
        <div className="absolute bottom-6 left-0 right-0 z-50 px-4 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-3 pointer-events-auto">
            <button className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/40 transition-colors">
              <Mic size={20} />
            </button>
            <div className="bg-black/20 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-full flex items-center gap-2">
              <span className="text-white/40 text-sm">说点什么...</span>
            </div>
          </div>
          <div className="flex items-center gap-3 pointer-events-auto">
            <button className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/40 transition-colors">
              <Sparkles size={20} />
            </button>
            <button className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/20 active:scale-95 transition-transform">
              <Heart size={24} fill="currentColor" />
            </button>
          </div>
        </div>
        
        {/* Double Click Hint Overlay (Fade out after 3s) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: [0, 1, 1, 0], y: [20, 0, 0, 20] }}
          transition={{ duration: 4, times: [0, 0.1, 0.8, 1] }}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        >
          <div className="bg-black/40 backdrop-blur-md px-6 py-2 rounded-full border border-white/10">
            <span className="text-white/80 text-xs font-bold tracking-widest uppercase">双击屏幕返回编辑模式</span>
          </div>
        </motion.div>

        {/* Close Button Overlay */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 bg-black/20 hover:bg-black/40 rounded-full backdrop-blur-md transition-colors"
        >
          <X size={24} className="text-white" />
        </button>

        {/* Settings Icon Overlay (matches Image 1/2/3/4) */}
        <button className="absolute top-4 right-16 z-50 p-2 text-black/40 hover:text-black/60 transition-colors">
          <Settings2 size={32} />
        </button>
      </div>
    </motion.div>
  );
}
