
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { Download, Eraser, Eye, Edit3, CheckCircle2 } from 'lucide-react';
import NoteCard from './components/NoteCard';
import EditorControls from './components/EditorControls';
import { FontFamily, NoteStyle, ThemeType } from './types';

const App: React.FC = () => {
  // Content State
  const [content, setContent] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  
  // UI State
  const [isDownloading, setIsDownloading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const cardRef = useRef<HTMLDivElement>(null);

  // Style State
  const [style, setStyle] = useState<NoteStyle>({
    font: FontFamily.Serif,
    theme: ThemeType.WarmIvory,
    fontSize: 4, // 默认档位，微调后的 4 相当于原来的标准大小
    alignment: 'left',
    showDate: true,
    showSignature: true,
    signatureText: 'By ZenNote',
  });

  // Handlers
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 350));
      
      const dataUrl = await toPng(cardRef.current, { 
        pixelRatio: 2.5,
        cacheBust: true,
        skipFonts: false,
      });
      
      const link = document.createElement('a');
      link.download = `zennote-${Date.now()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('Could not generate image', err);
      alert('图片生成失败，请稍后重试。');
    } finally {
      setIsDownloading(false);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans bg-stone-100 overflow-hidden select-none">
      
      {/* Mobile Header Tab Switcher */}
      <div className="md:hidden flex bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30 pt-[env(safe-area-inset-top)]">
        <button 
          onClick={() => setActiveTab('edit')}
          className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'edit' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-400'}`}
        >
          <Edit3 className="w-4 h-4" /> 编写
        </button>
        <button 
          onClick={() => setActiveTab('preview')}
          className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'preview' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-400'}`}
        >
          <Eye className="w-4 h-4" /> 预览
        </button>
      </div>

      {/* Left Side: Editor */}
      <div className={`w-full md:w-1/2 lg:w-5/12 flex flex-col ${activeTab === 'preview' ? 'hidden md:flex' : 'flex'} md:h-screen md:sticky top-0 p-4 md:p-6 lg:p-8 gap-4 overflow-y-auto bg-stone-100 z-10`}>
        <div className="hidden md:flex items-center justify-between mb-2">
          <h1 className="text-2xl font-serif font-bold text-gray-800 tracking-tight flex items-center gap-2">
             <span className="bg-gray-900 text-white w-8 h-8 flex items-center justify-center rounded-lg text-lg">禅</span>
             ZenNote
          </h1>
        </div>

        <div className="flex flex-col gap-4 relative md:flex-grow">
           <input 
             type="text" 
             placeholder="输入标题..."
             value={title}
             onChange={(e) => setTitle(e.target.value)}
             className="w-full bg-white border-none rounded-2xl p-4 text-lg font-bold focus:ring-2 focus:ring-gray-200 transition-all shadow-sm"
           />
          <textarea 
            value={content}
            onChange={handleContentChange}
            placeholder="在此输入正文内容..."
            className="w-full min-h-[300px] md:flex-grow resize-none bg-white border-none rounded-2xl p-5 text-base leading-relaxed focus:ring-2 focus:ring-gray-200 transition-all shadow-sm"
          />
        </div>

        <EditorControls style={style} onChange={setStyle} />
        
        {/* Safe area padding for mobile */}
        <div className="h-40 md:hidden"></div>
      </div>

      {/* Right Side: Live Preview */}
      <div className={`w-full md:w-1/2 lg:w-7/12 bg-[#d6d6d6] ${activeTab === 'edit' ? 'hidden md:flex' : 'flex'} min-h-[calc(100vh-100px)] md:min-h-screen p-4 md:p-12 flex-col items-center justify-start md:justify-center relative overflow-y-auto`}>
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

        <div className="relative w-full max-w-[420px] flex flex-col gap-6 z-0 mb-32 md:mb-0">
           <div className="shadow-[0_20px_50px_rgba(0,0,0,0.2)] rounded-sm overflow-hidden transform-gpu origin-top scale-[0.98] md:scale-100">
              <NoteCard 
                ref={cardRef} 
                content={content} 
                title={title} 
                style={style} 
              />
           </div>

           {/* Desktop Action Buttons */}
           <div className="hidden md:flex gap-4 justify-center">
              <button onClick={() => {setContent(''); setTitle('')}} className="px-6 py-3 bg-white text-gray-600 rounded-full font-bold shadow-lg hover:bg-gray-50 transition-all flex items-center gap-2"><Eraser className="w-4 h-4" /> 清空</button>
              <button onClick={handleDownload} disabled={isDownloading} className="px-8 py-3 bg-gray-900 text-white rounded-full font-bold shadow-xl hover:bg-black transition-all flex items-center gap-2 active:scale-95">
                {isDownloading ? <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span> : <Download className="w-4 h-4" />}
                <span>保存长图</span>
              </button>
           </div>
        </div>
      </div>

      {/* Success Notification Toast */}
      {showSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-green-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-bold">图片已开始下载</span>
        </div>
      )}

      {/* Mobile Floating Action Bar - 修复按钮挤压变形 */}
      <div className="md:hidden fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-4 bg-white/80 backdrop-blur-2xl border border-white/30 rounded-full shadow-[0_15px_35px_rgba(0,0,0,0.2)] z-50 ring-1 ring-black/5 pb-[calc(1rem+env(safe-area-inset-bottom))] w-[90%] max-w-[360px]">
        <button 
          onClick={() => {setContent(''); setTitle(''); setActiveTab('edit')}}
          className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gray-100 text-gray-400 rounded-full active:bg-gray-200"
        >
          <Eraser className="w-5 h-5" />
        </button>
        
        {/* 使用 flex-1 和 min-w-0 确保文字不强制换行 */}
        <button 
          onClick={handleDownload}
          disabled={isDownloading || !content}
          className="flex-1 min-w-0 h-12 flex items-center justify-center bg-gray-900 text-white rounded-full font-bold shadow-lg shadow-gray-900/30 gap-2 active:scale-95 transition-transform disabled:bg-gray-300 whitespace-nowrap overflow-hidden px-4"
        >
          {isDownloading ? (
            <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
          ) : (
            <Download className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="truncate">{isDownloading ? '生成中' : '保存图片'}</span>
        </button>

        {activeTab === 'edit' && content && (
           <button 
             onClick={() => setActiveTab('preview')}
             className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gray-900 text-white rounded-full active:scale-90"
           >
             <Eye className="w-5 h-5" />
           </button>
        )}
      </div>
    </div>
  );
};

export default App;
