
import React, { useState, useRef, useCallback } from 'react';
import { toBlob } from 'html-to-image';
import { Download, Eraser, Eye, Edit3, CheckCircle2, Link2, Sparkles, Loader2 } from 'lucide-react';
import NoteCard from './components/NoteCard';
import EditorControls from './components/EditorControls';
import { FontFamily, NoteStyle, ThemeType } from './types';
import { fetchXThread } from './services/geminiService';

const App: React.FC = () => {
  const [content, setContent] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [xUrl, setXUrl] = useState<string>("");
  
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const cardRef = useRef<HTMLDivElement>(null);

  const [style, setStyle] = useState<NoteStyle>({
    font: FontFamily.NotoSerif,
    theme: ThemeType.WarmIvory,
    fontSize: 4, 
    alignment: 'left',
    showDate: true,
    showSignature: true,
    signatureText: 'ZenNote',
  });

  const handleFetchX = async () => {
    if (!xUrl) return;
    setIsFetching(true);
    try {
      const { title: fetchedTitle, content: fetchedContent } = await fetchXThread(xUrl);
      setTitle(fetchedTitle);
      setContent(fetchedContent);
      setXUrl("");
      setActiveTab('edit');
    } catch (err: any) {
      alert(err.message || "同步失败，请检查网络或重试");
    } finally {
      setIsFetching(false);
    }
  };

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    
    setIsDownloading(true);
    try {
      const rect = cardRef.current.getBoundingClientRect();
      const height = rect.height;
      
      // 动态分辨率：高度超过 4000px 降为 1.0 倍率，确保手机端不崩溃
      let pixelRatio = 2.0;
      if (height > 4500) pixelRatio = 1.0;
      else if (height > 2500) pixelRatio = 1.5;

      await new Promise(resolve => setTimeout(resolve, 400));

      // 切换为 JPEG 格式以大幅减少内存占用
      const blob = await toBlob(cardRef.current, { 
        quality: 0.85,
        pixelRatio,
        backgroundColor: style.theme === ThemeType.DarkMode ? '#1c1c1e' : 
                        style.theme === ThemeType.WarmIvory ? '#F9F5E8' : 
                        style.theme === ThemeType.SoftGray ? '#F3F4F6' : '#FFFFFF',
        filter: (node) => {
          const el = node as HTMLElement;
          return !el.classList?.contains('noise-layer-complex'); // 过滤掉导致崩溃的复杂滤镜
        }
      });

      if (!blob) throw new Error('生成失败');

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `ZenNote-${Date.now()}.jpg`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(url), 100);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('Save error:', err);
      alert('保存失败。内容可能过长或手机内存不足。建议缩短文字或调小字号后再试。');
    } finally {
      setIsDownloading(false);
    }
  }, [style.theme]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans bg-stone-100 overflow-hidden select-none">
      
      {/* Mobile Header */}
      <div className="md:hidden flex bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30 pt-[env(safe-area-inset-top)]">
        <button onClick={() => setActiveTab('edit')} className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 ${activeTab === 'edit' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-400'}`}>
          <Edit3 className="w-4 h-4" /> 编写
        </button>
        <button onClick={() => setActiveTab('preview')} className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 ${activeTab === 'preview' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-400'}`}>
          <Eye className="w-4 h-4" /> 预览
        </button>
      </div>

      {/* Left Sidebar: Editor */}
      <div className={`w-full md:w-1/2 lg:w-5/12 flex flex-col ${activeTab === 'preview' ? 'hidden md:flex' : 'flex'} md:h-screen md:sticky top-0 p-4 md:p-8 gap-4 overflow-y-auto bg-stone-100 pb-40`}>
        <div className="hidden md:flex items-center gap-2 mb-2">
           <span className="bg-gray-900 text-white w-8 h-8 flex items-center justify-center rounded-lg font-bold">禅</span>
           <h1 className="text-xl font-bold text-gray-800">ZenNote</h1>
        </div>

        {/* X Import Bar */}
        <div className="flex gap-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-200">
          <div className="pl-3 py-2 text-gray-400"><Link2 className="w-4 h-4" /></div>
          <input 
            type="text" 
            placeholder="粘贴推文链接自动同步内容..."
            value={xUrl}
            onChange={(e) => setXUrl(e.target.value)}
            className="flex-1 border-none bg-transparent text-sm focus:ring-0"
          />
          <button 
            onClick={handleFetchX}
            disabled={isFetching || !xUrl}
            className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black disabled:bg-gray-100 disabled:text-gray-400 flex items-center gap-2 transition-all"
          >
            {isFetching ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            {isFetching ? '同步中' : '一键同步'}
          </button>
        </div>

        <div className="flex flex-col gap-4">
           <input 
             type="text" 
             placeholder="输入标题..."
             value={title}
             onChange={(e) => setTitle(e.target.value)}
             className="w-full bg-white border-none rounded-2xl p-4 text-lg font-bold shadow-sm"
           />
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="输入正文内容，支持 Markdown..."
            className="w-full min-h-[300px] md:min-h-[450px] resize-none bg-white border-none rounded-2xl p-5 text-base leading-relaxed shadow-sm"
          />
        </div>

        <EditorControls style={style} onChange={setStyle} />
      </div>

      {/* Right Sidebar: Preview */}
      <div className={`w-full md:w-1/2 lg:w-7/12 bg-[#ccc] ${activeTab === 'edit' ? 'hidden md:flex' : 'flex'} min-h-[calc(100vh-100px)] md:min-h-screen p-4 md:p-12 flex-col items-center justify-start relative overflow-y-auto pb-48`}>
        <div className="relative w-full max-w-[420px] flex flex-col gap-6">
           <div className="shadow-2xl rounded-sm overflow-hidden bg-white">
              <NoteCard ref={cardRef} content={content} title={title} style={style} />
           </div>

           <div className="hidden md:flex gap-4 justify-center">
              <button onClick={() => {setContent(''); setTitle('')}} className="px-6 py-3 bg-white text-gray-600 rounded-full font-bold shadow-lg flex items-center gap-2 hover:bg-gray-50"><Eraser className="w-4 h-4" /> 清空</button>
              <button onClick={handleDownload} disabled={isDownloading} className="px-8 py-3 bg-gray-900 text-white rounded-full font-bold shadow-xl flex items-center gap-2 hover:bg-black active:scale-95 transition-all">
                {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>保存高清长图</span>
              </button>
           </div>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-green-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-bold">图片已下载</span>
        </div>
      )}

      {/* Mobile Actions */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[400px]">
        <div className="flex items-center gap-3 p-3 bg-gray-900/95 backdrop-blur-xl rounded-full shadow-2xl border border-white/10">
          <button onClick={() => {setContent(''); setTitle('')}} className="w-12 h-12 flex items-center justify-center bg-white/10 text-white rounded-full"><Eraser className="w-5 h-5" /></button>
          <button 
            onClick={handleDownload}
            disabled={isDownloading || !content}
            className="flex-1 h-12 flex items-center justify-center bg-white text-gray-900 rounded-full font-bold gap-2 active:scale-95 disabled:bg-gray-700 disabled:text-gray-500"
          >
            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isDownloading ? '处理中...' : '保存长图'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
