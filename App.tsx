import React, { useState, useEffect } from 'react';
import { Tab } from './types';
import HashMapVisualizer from './components/HashMapVisualizer';
import InterviewPrep from './components/InterviewPrep';
import MetaphorGenerator from './components/MetaphorGenerator';
import { Database, Brain, Image as ImageIcon, Key } from 'lucide-react';

// Local interface for aistudio to avoid global namespace conflicts
interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.VISUALIZER);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      // Cast window to any to access aistudio without type conflict
      const aistudio = (window as any).aistudio as AIStudio | undefined;
      if (aistudio && await aistudio.hasSelectedApiKey()) {
        setHasKey(true);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    const aistudio = (window as any).aistudio as AIStudio | undefined;
    if (aistudio) {
      await aistudio.openSelectKey();
      // Assume success as per instructions to avoid race conditions
      setHasKey(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
                <Database className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">HashMap <span className="text-slate-400 font-normal">大师课</span></span>
          </div>

          <nav className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab(Tab.VISUALIZER)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === Tab.VISUALIZER ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              可视化
            </button>
            <button
              onClick={() => setActiveTab(Tab.INTERVIEW)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === Tab.INTERVIEW ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Brain className="w-3.5 h-3.5" /> 面试
            </button>
            <button
              onClick={() => setActiveTab(Tab.ART)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === Tab.ART ? 'bg-slate-800 text-pink-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" /> 艺术生成
            </button>
          </nav>

          <div className="flex items-center gap-4">
            {!hasKey ? (
              <button
                onClick={handleSelectKey}
                className="flex items-center gap-2 bg-amber-500/10 text-amber-500 border border-amber-500/50 hover:bg-amber-500/20 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
              >
                <Key className="w-3.5 h-3.5" />
                选择 API Key
              </button>
            ) : (
                <span className="text-xs text-emerald-500 font-medium flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    API 已连接
                </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 overflow-hidden">
        {activeTab === Tab.VISUALIZER && (
            <div className="h-[calc(100vh-8rem)]">
                <HashMapVisualizer />
            </div>
        )}
        
        {activeTab === Tab.INTERVIEW && (
            <div className="animate-fadeIn">
                <InterviewPrep />
            </div>
        )}

        {activeTab === Tab.ART && (
            <div className="animate-fadeIn h-[calc(100vh-8rem)]">
                <MetaphorGenerator />
            </div>
        )}
      </main>
    </div>
  );
};

export default App;