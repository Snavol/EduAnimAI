import React, { useState } from 'react';
import { generateAnimationScript } from './services/geminiService';
import { AnimationPlayer } from './components/AnimationPlayer';
import { AnimationScript } from './types';
import { Loader2, Sparkles, AlertCircle, Code, Film, PlayCircle, BookOpen } from 'lucide-react';

// Default prompt matching user request
const DEFAULT_PROMPT = "Explain World War 2 using animated characters and maps";

const App: React.FC = () => {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [script, setScript] = useState<AnimationScript | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'script'>('preview');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setScript(null);

    try {
      const result = await generateAnimationScript(prompt);
      setScript(result);
    } catch (err: any) {
      setError(err.message || "Failed to generate animation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
              <Film className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                DevForge <span className="font-light text-blue-400">EduAnim</span>
              </h1>
            </div>
          </div>
          <div className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">
            v2.0.0
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Input Section */}
        <section className="max-w-3xl mx-auto mb-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">Text to Educational Video</h2>
          <p className="text-slate-400 mb-8 text-lg">
            Turn any academic concept into a structured animation.
            <br/><span className="text-sm text-slate-500">Supported: Math, Physics, History, Biology, Geography, CS</span>
          </p>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
            <div className="relative flex flex-col md:flex-row bg-slate-900 rounded-xl border border-slate-700 shadow-2xl overflow-hidden">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Explain how a DC motor works..."
                className="w-full bg-transparent text-lg text-white px-6 py-5 focus:outline-none resize-none h-32 md:h-auto placeholder-slate-600"
              />
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="h-16 md:h-auto md:w-32 bg-blue-600 hover:bg-blue-500 text-white font-medium flex flex-col items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-t md:border-t-0 md:border-l border-slate-700"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <Sparkles size={24} />}
                <span className="text-xs mt-1 font-bold tracking-wide">{loading ? 'CREATING' : 'GENERATE'}</span>
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mt-6 p-4 bg-red-950/50 border border-red-900/50 text-red-200 rounded-lg flex items-center justify-center space-x-2 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}
        </section>

        {/* Content Area */}
        {script && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            {/* Left: Player (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                   <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                    {script.title}
                  </h3>
                  <p className="text-slate-400 text-sm mt-1 flex items-center gap-1">
                    <BookOpen size={14} /> {script.visualStyle}
                  </p>
                </div>
               
                <div className="flex space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                  <button 
                    onClick={() => setActiveTab('preview')}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'preview' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                  >
                    <PlayCircle size={16} /> Preview
                  </button>
                  <button 
                    onClick={() => setActiveTab('script')}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'script' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                  >
                    <Code size={16} /> Logic
                  </button>
                </div>
              </div>

              {activeTab === 'preview' ? (
                 <AnimationPlayer script={script} />
              ) : (
                <div className="bg-slate-950 rounded-xl border border-slate-800 h-[500px] overflow-auto p-6 font-mono text-sm leading-relaxed shadow-inner">
                  <div className="text-blue-400 font-bold mb-4 pb-2 border-b border-slate-800 tracking-widest">VIDEO BREAKDOWN:</div>
                  <pre className="text-slate-300">{JSON.stringify(script, null, 2)}</pre>
                </div>
              )}
            </div>

            {/* Right: Breakdown List (4 cols) */}
            <div className="lg:col-span-4">
              <div className="bg-slate-900/50 rounded-xl border border-slate-800 h-full max-h-[600px] flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-800 bg-slate-900">
                  <h4 className="text-sm font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
                    <Film size={16} className="text-blue-500" />
                    Scene Breakdown
                  </h4>
                </div>
                
                <div className="overflow-y-auto p-4 space-y-6 flex-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                  {script.scenes.map((scene, index) => (
                    <div key={scene.id} className="relative pl-6 border-l-2 border-slate-700 hover:border-blue-500 transition-colors group">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-900 border-2 border-slate-600 group-hover:border-blue-500 group-hover:scale-110 transition-all"></div>
                      
                      <div className="flex justify-between items-start mb-1">
                         <div className="text-xs text-blue-400 font-bold uppercase tracking-wider">
                          Scene {index + 1}
                        </div>
                        <div className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                          {scene.duration}s
                        </div>
                      </div>
                      
                      <p className="text-slate-200 text-sm leading-relaxed mb-3 font-medium">
                        {scene.narrative}
                      </p>
                      
                      <div className="space-y-2">
                        {scene.elements.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {scene.elements.map(el => (
                              <span key={el.id} className="inline-flex items-center gap-1 px-2 py-1 bg-slate-800/80 rounded border border-slate-700 text-xs text-slate-400">
                                {el.icon && <span className="opacity-80">{el.icon}</span>}
                                {el.label}
                              </span>
                            ))}
                          </div>
                        )}
                        {scene.camera && (
                           <div className="text-[10px] text-slate-500 italic">
                             Camera: Zoom {scene.camera.zoom}x
                           </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </section>
        )}

      </main>
    </div>
  );
};

export default App;