import React, { useState } from 'react';
import { generateMetaphorImage } from '../services/geminiService';
import { AspectRatio, ImageSize } from '../types';
import { Image as ImageIcon, Loader2, Download, AlertTriangle, Wand2 } from 'lucide-react';

const PROMPTS = [
  "一个未来的赛博朋克图书馆，发光的数据流代表 HashMap 查找系统",
  "一张高度细节的 3D 插图，展示装有发光球体的桶 (Buckets)，由激光束连接",
  "数字虚空中数据冲突和链式结构的抽象可视化，高对比度",
  "一个带有无限抽屉的蒸汽朋克档案柜系统，代表可调整大小的 HashMap"
];

const MetaphorGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState(PROMPTS[0]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.SQUARE);
  const [imageSize, setImageSize] = useState<ImageSize>(ImageSize.SIZE_1K);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState(false);

   React.useEffect(() => {
    if (process.env.API_KEY) setHasKey(true);
  }, []);

  const handleGenerate = async () => {
    if (!hasKey) {
        setError("请先点击顶部的按钮选择付费 API Key。");
        return;
    }
    setLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const base64Image = await generateMetaphorImage(prompt, aspectRatio, imageSize);
      setGeneratedImage(base64Image);
    } catch (err: any) {
      setError(err.message || "无法生成图片。请确保您的 API Key 可以访问付费模型。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
      {/* Controls */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-xl">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-pink-400">
            <Wand2 className="w-5 h-5" /> 配置 (Config)
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">提示词 (Prompt)</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none transition-all h-24 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">纵横比 (Aspect Ratio)</label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none"
                >
                  {Object.values(AspectRatio).map((ratio) => (
                    <option key={ratio} value={ratio}>{ratio}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">尺寸 (Size)</label>
                <select
                  value={imageSize}
                  onChange={(e) => setImageSize(e.target.value as ImageSize)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none"
                >
                  {Object.values(ImageSize).map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors mt-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
              生成概念图
            </button>
          </div>
          
          <div className="mt-6">
            <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">快速创意 (Quick Ideas)</label>
            <div className="space-y-2">
                {PROMPTS.map((p, i) => (
                    <div 
                        key={i} 
                        onClick={() => setPrompt(p)}
                        className="text-xs text-slate-400 hover:text-white cursor-pointer hover:bg-slate-800 p-2 rounded transition-colors truncate"
                    >
                        {p}
                    </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="lg:col-span-2 flex flex-col">
        <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 shadow-xl p-6 flex flex-col items-center justify-center relative min-h-[400px]">
          {error && (
             <div className="absolute top-4 left-4 right-4 bg-red-900/50 border border-red-500 p-3 rounded flex items-center gap-2 text-red-200 text-sm">
                <AlertTriangle className="w-4 h-4" /> {error}
             </div>
          )}
          
          {loading ? (
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 text-pink-500 animate-spin mx-auto" />
              <div className="text-slate-400 text-sm animate-pulse">正在构思您的比喻...</div>
            </div>
          ) : generatedImage ? (
            <div className="relative w-full h-full flex items-center justify-center group">
              <img 
                src={generatedImage} 
                alt="Generated Metaphor" 
                className="max-w-full max-h-[600px] object-contain rounded-lg shadow-2xl"
              />
              <a 
                href={generatedImage} 
                download={`hashmap-metaphor-${Date.now()}.png`}
                className="absolute bottom-4 right-4 bg-black/70 hover:bg-black/90 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Download className="w-6 h-6" />
              </a>
            </div>
          ) : (
            <div className="text-center text-slate-600">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>配置设置并点击生成以可视化 HashMap 概念。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetaphorGenerator;