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
  Clock
} from 'lucide-react';
import { 
  AppState, 
  VideoSettings, 
  AudioSettings, 
  CameraSettings,
  VideoSize, 
  MirrorEffect, 
  DeDuplicationFilter, 
  VideoSource, 
  PlaybackMode 
} from './types';
import { DIGITAL_HUMANS, LIVE_COMPONENTS } from './constants';
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
                <SidebarIcon icon={<Gamepad2 size={24} />} label="娱乐" onClick={() => {}} />
                <SidebarIcon icon={<ImageIcon size={24} />} label="图片" onClick={() => {}} />
                <SidebarIcon icon={<Sparkles size={24} />} label="特效" onClick={() => setActiveModal('components')} active={activeModal === 'components'} />
                <SidebarIcon icon={<Camera size={24} />} label="摄像头" onClick={() => setActiveModal('camera')} active={activeModal === 'camera'} />
              </div>

              {/* Right Sidebar */}
              <div className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 md:gap-6 scale-90 md:scale-100">
                <SidebarIcon icon={<BarChart3 size={24} />} label="数据" onClick={() => {}} />
                <SidebarIcon icon={<Trash2 size={24} />} label="清屏" onClick={() => setState(prev => ({ ...prev, activeComponents: [], activeEffect: null, selectedDigitalHuman: null, camera: { ...prev.camera, enabled: false } }))} />
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
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">语音</h2>
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full"><X size={20} /></button>
      </div>
      
      <div className="space-y-8">
        <section>
          <h3 className="text-lg font-bold mb-4">语音</h3>
          <div className="flex gap-8">
            <Radio label="开启" checked={state.audio.enabled} onChange={() => onUpdate({ ...state.audio, enabled: true })} />
            <Radio label="关闭" checked={!state.audio.enabled} onChange={() => onUpdate({ ...state.audio, enabled: false })} />
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-4">播放模式</h3>
          <div className="flex gap-8">
            <Radio label="顺序播放" checked={state.audio.mode === 'sequential'} onChange={() => onUpdate({ ...state.audio, mode: 'sequential' })} />
            <Radio label="随机播放" checked={state.audio.mode === 'random'} onChange={() => onUpdate({ ...state.audio, mode: 'random' })} />
          </div>
        </section>

        <section>
          <div className="flex justify-between mb-4">
            <h3 className="text-lg font-bold">音量</h3>
            <span className="text-emerald-500 font-bold">{state.audio.volume}</span>
          </div>
          <input 
            type="range" 
            className="w-full accent-emerald-500" 
            value={state.audio.volume} 
            onChange={e => onUpdate({ ...state.audio, volume: parseInt(e.target.value) })} 
          />
        </section>

        <section>
          <div className="flex justify-between mb-4">
            <h3 className="text-lg font-bold">播放间隔</h3>
            <span className="text-emerald-500 font-bold">{state.audio.interval}s</span>
          </div>
          <input 
            type="range" 
            className="w-full accent-emerald-500" 
            value={state.audio.interval} 
            onChange={e => onUpdate({ ...state.audio, interval: parseInt(e.target.value) })} 
          />
        </section>

        <section>
          <h3 className="text-lg font-bold mb-4">音频源</h3>
          <div className="mt-4">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:bg-white/5 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Music className="w-8 h-8 mb-3 text-white/40" />
                <div className="flex flex-col items-center justify-center">
                  <p className="mb-2 text-sm text-white/60">
                    <span className="font-semibold">点击上传本地音频</span>
                  </p>
                  <p className="text-xs text-white/40">MP3, WAV, OGG (MAX. 20MB)</p>
                </div>
              </div>
              <input 
                type="file" 
                className="hidden" 
                accept="audio/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    onUpdate({ ...state.audio, localAudioUrl: url });
                  }
                }}
              />
            </label>
            {state.audio.localAudioUrl && (
              <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Music size={16} className="text-emerald-500 shrink-0" />
                  <span className="text-xs text-emerald-500 truncate">音频已加载</span>
                </div>
                <button 
                  onClick={() => onUpdate({ ...state.audio, localAudioUrl: null })}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        </section>

        <button className="w-full bg-emerald-600 py-4 rounded-xl font-bold mt-4" onClick={onClose}>完成</button>
      </div>
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
