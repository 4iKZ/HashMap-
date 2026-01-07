import React, { useState } from 'react';
import { generateInterviewAnswer } from '../services/geminiService';
import { SearchResult } from '../types';
import { Search, Loader2, BookOpen, ExternalLink, AlertTriangle } from 'lucide-react';

const COMMON_QUESTIONS = [
  "HashMap 在 Java 中内部是如何工作的？",
  "当两个 Key 生成相同的 hash code 时会发生什么（Hash 冲突）？",
  "HashMap 和 ConcurrentHashMap 有什么区别？",
  "为什么 HashMap 的 put/get 时间复杂度是 O(1)？",
  "详细解释扩容（Rehashing）过程。",
  "为什么 HashMap 中的 String key 是不可变的？",
];

const InterviewPrep: React.FC = () => {
  const [customQuestion, setCustomQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [sources, setSources] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState(false);

  React.useEffect(() => {
    // Check if key is potentially available (simple check)
    if (process.env.API_KEY) setHasKey(true);
  }, []);

  const handleAsk = async (question: string) => {
    if (!hasKey) {
        setError("请先点击顶部的按钮选择 API Key。");
        return;
    }
    setLoading(true);
    setError(null);
    setAnswer(null);
    setSources([]);

    try {
      const result = await generateInterviewAnswer(question);
      setAnswer(result.text);
      
      // Extract sources
      const extractedSources: SearchResult[] = [];
      result.groundingChunks?.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          extractedSources.push({
            title: chunk.web.title,
            uri: chunk.web.uri,
          });
        }
      });
      setSources(extractedSources);

    } catch (err: any) {
      setError(err.message || "无法生成回答。请确保您的 API Key 支持 Search Grounding。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-900 rounded-xl p-8 border border-slate-800 shadow-xl">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-3 text-emerald-400">
          <BookOpen className="w-8 h-8" />
          技术深度解析
        </h2>
        <p className="text-slate-400 mb-6">
          询问关于 HashMap 的复杂问题。我们使用 Google Search Grounding 来确保信息符合最新的语言规范（如 Java 21, Python 3.12）。
        </p>

        {/* Input Area */}
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="在此输入您的面试问题..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-4 pr-12 py-4 text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
              onKeyDown={(e) => e.key === 'Enter' && handleAsk(customQuestion)}
            />
            <button
              onClick={() => handleAsk(customQuestion)}
              disabled={loading || !customQuestion.trim()}
              className="absolute right-2 top-2 bottom-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 rounded-md transition-colors"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {COMMON_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => {
                    setCustomQuestion(q);
                    handleAsk(q);
                }}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-full border border-slate-700 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-xl flex items-center gap-3 text-red-200">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          {error}
        </div>
      )}

      {/* Answer Area */}
      {answer && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-slate-900 rounded-xl p-8 border border-slate-800 shadow-xl">
            <h3 className="text-lg font-semibold text-emerald-400 mb-4 border-b border-slate-800 pb-2">AI 回答</h3>
            <div className="prose prose-invert max-w-none prose-p:text-slate-300 prose-headings:text-slate-100 prose-strong:text-emerald-300">
               {/* Basic Markdown rendering support or plain text */}
               <div className="whitespace-pre-wrap leading-relaxed">{answer}</div>
            </div>
          </div>

          {/* Sources */}
          {sources.length > 0 && (
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-xl">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">来源</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sources.map((source, idx) => (
                  <a
                    key={idx}
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors group"
                  >
                    <ExternalLink className="w-4 h-4 text-emerald-500 group-hover:text-emerald-400" />
                    <span className="text-sm text-slate-300 truncate group-hover:text-white">{source.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InterviewPrep;