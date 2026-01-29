
import React, { useState, useRef, useCallback } from 'react';
import { toBlob } from 'html-to-image';
import { Download, Eraser, Eye, Edit3, CheckCircle2 } from 'lucide-react';
import NoteCard from './components/NoteCard';
import EditorControls from './components/EditorControls';
import { FontFamily, NoteStyle, ThemeType } from './types';

const App: React.FC = () => {
  const [content, setContent] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState(false);
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
    signatureText: 'By ZenNote',
  });

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    
    setIsDownloading(true);
    
    try {
      // 1. 获取目标元素实际高度
      const rect = cardRef.current.getBoundingClientRect();
      const height = rect.height;

      /**
       * 2. 核心崩溃解决方案：动态分辨率策略
       * 移动端 Canvas 限制非常死，我们必须根据高度动态调整 pixelRatio。
       * 阈值设定参考：
       * - 高度 < 2500px (普通短文): 2.0x (高清)
       * - 高度 < 5000px (长文): 1.5x (兼顾)
       * - 高度 >= 5000px (极长文): 1.0x (保命模式)
       */
      let smartPixelRatio = 2.0;
      if (height > 5000) {
        smartPixelRatio = 1.0;
      } else if (height > 2500) {
        smartPixelRatio = 1.5;
      }

      // 给 UI 渲染一点点喘息时间
      await new Promise(resolve => setTimeout(resolve, 300));

      const blob = await toBlob(cardRef.current, { 
        quality: 0.85, // 稍微降低质量以进一步减轻内存
        pixelRatio: smartPixelRatio,
        cacheBust: false,
        backgroundColor: style.theme === ThemeType.DarkMode ? '#1c1c1e' : 
                        style.theme === ThemeType.WarmIvory ? '#F9F5E8' : 
                        style.theme === ThemeType.SoftGray ? '#F3F4F6' : '#FFFFFF',
        filter: (node) => {
          const el = node as HTMLElement;
          // 彻底干掉所有可能导致截图引擎内存溢出的滤镜和复杂层
          if (el.classList?.contains('noise-layer')) return false;
          if (el.tagName === 'svg' && el.closest('.noise-layer')) return false;
          return true;
        }
      });

      if (!blob) throw new Error('Blob generation failed');

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
      alert('保存失败。可能是文字内容过长超出了手机硬件极限。建议：\n1. 尝试减少文字长度；\n2. 调小排版中的字体大小。');
    } finally {
      setIsDownloading(false);
    }
  }, [style.theme]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans bg-stone-100 overflow-hidden select-none">
      
      {/* Mobile Header Tab Switcher */}
      <div className="md:hidden flex bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30 pt-[env(safe-area-inset-top)]">
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
      <div className={`w-full md:w-1/2 lg:w-5/12 flex flex-col ${activeTab === 'preview' ? 'hidden md:flex' : 'flex'} md:h-screen md:sticky top-0 p-4 md:p-6 lg:p-8 gap-4 overflow-y-auto bg-stone-100 z-10 pb-40`}>
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
            onChange={(e) => setContent(e.target.value)}
            placeholder="在此输入正文内容..."
            className="w-full min-h-[350px] md:flex-grow resize-none bg-white border-none rounded-2xl p-5 text-base leading-relaxed focus:ring-2 focus:ring-gray-200 transition-all shadow-sm"
          />
        </div>

        <EditorControls style={style} onChange={setStyle} />
      </div>

      {/* Right Side: Live Preview */}
      <div className={`w-full md:w-1/2 lg:w-7/12 bg-[#d6d6d6] ${activeTab === 'edit' ? 'hidden md:flex' : 'flex'} min-h-[calc(100vh-100px)] md:min-h-screen p-4 md:p-6 flex flex-col items-center justify-start md:justify-center relative overflow-y-auto pb-48 md:pb-12`}>
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

        <div className="relative w-full max-w-[420px] flex flex-col gap-6 z-0">
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
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-green-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-bold">图片已开始下载</span>
        </div>
      )}

      {/* Mobile Floating Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center pointer-events-none pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-900/95 backdrop-blur-lg rounded-full shadow-xl border border-white/10 w-[92%] max-w-[400px] pointer-events-auto">
          <button 
            onClick={() => {setContent(''); setTitle(''); setActiveTab('edit')}}
            className="flex-shrink-0 w-11 h-11 flex items-center justify-center bg-white/10 text-white rounded-full active:bg-white/20 transition-colors"
          >
            <Eraser className="w-5 h-5" />
          </button>
          
          <button 
            onClick={handleDownload}
            disabled={isDownloading || !content}
            className="flex-1 h-11 flex items-center justify-center bg-white text-gray-900 rounded-full font-bold gap-2 active:scale-[0.97] transition-all disabled:bg-gray-700 disabled:text-gray-500 overflow-hidden px-2"
          >
            {isDownloading ? (
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></span>
            ) : (
              <Download className="w-4 h-4 flex-shrink-0" />
            )}
            <span className="truncate text-[13px] leading-none uppercase tracking-wide">
              {isDownloading ? '生成中...' : '保存长图'}
            </span>
          </button>

          <button 
             onClick={() => setActiveTab(activeTab === 'edit' ? 'preview' : 'edit')}
             className="flex-shrink-0 w-11 h-11 flex items-center justify-center bg-white/10 text-white rounded-full active:bg-white/20 transition-colors"
           >
             {activeTab === 'edit' ? <Eye className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
