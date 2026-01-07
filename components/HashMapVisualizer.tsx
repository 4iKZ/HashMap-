import React, { useState, useCallback, useEffect } from 'react';
import { Bucket, HashMapNode, LogEntry } from '../types';
import { ArrowDown, Database, RefreshCw, Plus, Trash2, Zap } from 'lucide-react';

const INITIAL_CAPACITY = 4;
const LOAD_FACTOR = 0.75;

const HashMapVisualizer: React.FC = () => {
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [capacity, setCapacity] = useState(INITIAL_CAPACITY);
  const [itemCount, setItemCount] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  const [inputKey, setInputKey] = useState('');
  const [inputValue, setInputValue] = useState('');

  // Animation/Highlight states
  const [activeBucketIndex, setActiveBucketIndex] = useState<number | null>(null);
  const [isRehashing, setIsRehashing] = useState(false);

  // Initialize buckets
  useEffect(() => {
    const newBuckets: Bucket[] = Array.from({ length: capacity }, (_, i) => ({
      index: i,
      nodes: [],
    }));
    setBuckets(newBuckets);
  }, [capacity]);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      message,
      type,
      timestamp: Date.now()
    }, ...prev].slice(0, 50));
  };

  // Simple string hash for visualization
  const getHash = (key: string) => {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash += key.charCodeAt(i);
    }
    return hash;
  };

  const getBucketIndex = (hash: number, currentCapacity: number) => {
    return hash % currentCapacity;
  };

  const resize = async (currentBuckets: Bucket[]) => {
    setIsRehashing(true);
    const newCapacity = capacity * 2;
    addLog(`达到 Load Factor 阈值 (${(itemCount / capacity).toFixed(2)} > ${LOAD_FACTOR})。正在扩容至 ${newCapacity}...`, 'warning');
    
    // Create new empty buckets
    const newBuckets: Bucket[] = Array.from({ length: newCapacity }, (_, i) => ({
      index: i,
      nodes: [],
    }));

    // Rehash all existing nodes
    let movedCount = 0;
    for (const bucket of currentBuckets) {
      for (const node of bucket.nodes) {
        const newIndex = getBucketIndex(node.hash, newCapacity);
        newBuckets[newIndex].nodes.push(node);
        movedCount++;
      }
    }

    // Artificial delay for visualization
    await new Promise(r => setTimeout(r, 1500));
    
    setCapacity(newCapacity);
    setBuckets(newBuckets);
    addLog(`Rehash 完成。移动了 ${movedCount} 个项目。新 Capacity: ${newCapacity}。`, 'success');
    setIsRehashing(false);
  };

  const put = async () => {
    if (!inputKey || !inputValue) {
      addLog('需要输入 Key 和 Value。', 'error');
      return;
    }

    const hash = getHash(inputKey);
    const index = getBucketIndex(hash, capacity);

    setActiveBucketIndex(index);
    addLog(`put("${inputKey}", "${inputValue}") -> Hash: ${hash} -> Index: ${index}`, 'info');

    setBuckets(prev => {
      const newBuckets = [...prev];
      const targetBucket = { ...newBuckets[index] };
      const existingNodeIndex = targetBucket.nodes.findIndex(n => n.key === inputKey);

      if (existingNodeIndex >= 0) {
        // Update
        const updatedNodes = [...targetBucket.nodes];
        updatedNodes[existingNodeIndex] = { ...updatedNodes[existingNodeIndex], value: inputValue };
        targetBucket.nodes = updatedNodes;
        newBuckets[index] = targetBucket;
        addLog(`Key "${inputKey}" 已存在。更新 Value 为 "${inputValue}"。`, 'success');
        setActiveBucketIndex(null);
        return newBuckets;
      } else {
        // Insert
        targetBucket.nodes = [...targetBucket.nodes, { key: inputKey, value: inputValue, hash }];
        newBuckets[index] = targetBucket;
        
        const newItemCount = itemCount + 1;
        setItemCount(newItemCount);
        addLog(`已插入 "${inputKey}" 到 Bucket ${index}。Load: ${(newItemCount / capacity).toFixed(2)}`, 'success');
        
        // Check load factor
        if (newItemCount / capacity > LOAD_FACTOR) {
          setTimeout(() => resize(newBuckets), 500);
        } else {
          setActiveBucketIndex(null);
        }
        
        return newBuckets;
      }
    });
    
    setInputKey('');
    setInputValue('');
  };

  const clear = () => {
    setCapacity(INITIAL_CAPACITY);
    setItemCount(0);
    setLogs([]);
    addLog('HashMap 已清空。', 'warning');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Control Panel & Logs */}
      <div className="lg:col-span-1 space-y-6 flex flex-col h-full">
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-xl">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-400">
            <Zap className="w-5 h-5" /> 操作 (Operations)
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Key (字符串)</label>
              <input
                type="text"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="例如: apple"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Value (任意值)</label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="例如: red"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={put}
                disabled={isRehashing}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" /> Put
              </button>
              <button
                onClick={clear}
                disabled={isRehashing}
                className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-slate-200 p-2 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-2 gap-4">
             <div className="text-center p-3 bg-slate-800 rounded-lg">
               <div className="text-xs text-slate-400">Capacity</div>
               <div className="text-xl font-mono text-purple-400">{capacity}</div>
             </div>
             <div className="text-center p-3 bg-slate-800 rounded-lg">
               <div className="text-xs text-slate-400">Size</div>
               <div className="text-xl font-mono text-emerald-400">{itemCount}</div>
             </div>
             <div className="col-span-2 text-center p-3 bg-slate-800 rounded-lg">
               <div className="text-xs text-slate-400">Load Factor</div>
               <div className={`text-xl font-mono ${(itemCount/capacity) > LOAD_FACTOR ? 'text-red-400' : 'text-blue-400'}`}>
                 {(itemCount / capacity).toFixed(2)} / {LOAD_FACTOR}
               </div>
             </div>
          </div>
        </div>

        <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden flex flex-col min-h-[300px]">
          <div className="p-4 border-b border-slate-800 bg-slate-900/50">
            <h3 className="font-semibold text-slate-300">执行日志 (Execution Log)</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs">
            {logs.length === 0 && <div className="text-slate-600 italic text-center mt-10">等待操作...</div>}
            {logs.map((log) => (
              <div key={log.id} className={`p-2 rounded border-l-2 animate-fadeIn ${
                log.type === 'error' ? 'bg-red-900/20 border-red-500 text-red-200' :
                log.type === 'success' ? 'bg-emerald-900/20 border-emerald-500 text-emerald-200' :
                log.type === 'warning' ? 'bg-amber-900/20 border-amber-500 text-amber-200' :
                'bg-slate-800 border-blue-500 text-slate-300'
              }`}>
                <span className="opacity-50 mr-2">[{new Date(log.timestamp).toLocaleTimeString().split(' ')[0]}]</span>
                {log.message}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visualization Area */}
      <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 shadow-xl p-6 relative overflow-hidden flex flex-col">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-purple-400">
          <Database className="w-5 h-5" /> 内存视图 (Memory View)
        </h2>
        
        {isRehashing && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
            <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <div className="text-2xl font-bold text-white">正在 Rehash...</div>
            <div className="text-slate-400">Capacity 翻倍并重新分配节点</div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {buckets.map((bucket) => (
              <div 
                key={bucket.index}
                className={`rounded-lg border-2 transition-all duration-300 p-3 min-h-[100px] flex flex-col ${
                  activeBucketIndex === bucket.index 
                    ? 'border-blue-500 bg-blue-900/10 shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                }`}
              >
                <div className="flex justify-between items-center mb-2 border-b border-slate-700 pb-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Index {bucket.index}</span>
                  <span className="text-xs text-slate-600">{bucket.nodes.length} items</span>
                </div>
                
                <div className="flex-1 space-y-2">
                  {bucket.nodes.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-700 text-xs italic">
                      空 Bucket
                    </div>
                  ) : (
                    bucket.nodes.map((node, i) => (
                      <div key={i} className="group relative">
                        {/* LinkedList Arrow */}
                        {i > 0 && (
                          <div className="flex justify-center -my-1 relative z-0">
                            <ArrowDown className="w-3 h-3 text-slate-600" />
                          </div>
                        )}
                        <div className="relative z-10 bg-slate-700 rounded p-2 text-sm border border-slate-600 group-hover:border-purple-500 transition-colors flex justify-between items-center">
                          <div>
                            <div className="font-bold text-white">{node.key}</div>
                            <div className="text-xs text-slate-400 font-mono">{node.value}</div>
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono bg-slate-800 px-1 rounded">
                            h:{node.hash}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HashMapVisualizer;