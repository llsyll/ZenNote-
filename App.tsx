import React, { useState, useRef, useCallback } from 'react';
import { toPng } from 'html-to-image';
import { Download, Sparkles, Eraser, Share2 } from 'lucide-react';
import NoteCard from './components/NoteCard';
import EditorControls from './components/EditorControls';
import { FontFamily, NoteStyle, ThemeType } from './types';
import { polishText, summarizeToTitle } from './services/geminiService';

const App: React.FC = () => {
  // Content State
  const [content, setContent] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  
  // UI State
  const [isPolishing, setIsPolishing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Style State
  const [style, setStyle] = useState<NoteStyle>({
    font: FontFamily.Serif,
    theme: ThemeType.WarmIvory,
    fontSize: 2,
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
      // Delay slightly to ensure rendering
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Create image with double pixel density for clearer text on mobile
      const dataUrl = await toPng(cardRef.current, { 
        pixelRatio: 3,
        cacheBust: true,
      });
      
      const link = document.createElement('a');
      link.download = `zennote-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Could not generate image', err);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  }, []);

  const handleAiPolish = async () => {
    if (!content.trim()) return;
    setIsPolishing(true);
    try {
      const [polished, generatedTitle] = await Promise.all([
        polishText(content),
        !title ? summarizeToTitle(content) : Promise.resolve(title)
      ]);
      
      setContent(polished);
      if (!title) setTitle(generatedTitle);
    } catch (error) {
      console.error(error);
      alert("AI Service is currently unavailable. Please check your API key.");
    } finally {
      setIsPolishing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans bg-stone-100">
      
      {/* Left Side: Editor & Controls */}
      <div className="w-full md:w-1/2 lg:w-5/12 flex flex-col h-screen sticky top-0 p-4 md:p-6 lg:p-8 gap-6 overflow-y-auto z-10">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-serif font-bold text-gray-800 tracking-tight flex items-center gap-2">
             <span className="bg-gray-900 text-white w-8 h-8 flex items-center justify-center rounded-lg text-lg">禅</span>
             ZenNote
          </h1>
        </div>

        {/* Input Area */}
        <div className="flex-grow flex flex-col gap-4 relative group">
           <input 
             type="text" 
             placeholder="输入标题 (可选)"
             value={title}
             onChange={(e) => setTitle(e.target.value)}
             className="w-full bg-white border border-transparent focus:border-gray-200 rounded-xl p-4 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-gray-100 transition-all shadow-sm"
           />
          <textarea 
            value={content}
            onChange={handleContentChange}
            placeholder="在此输入正文内容..."
            className="w-full flex-grow resize-none bg-white border border-transparent focus:border-gray-200 rounded-xl p-5 text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-gray-100 transition-all shadow-sm placeholder:text-gray-300"
          />
          
          {/* Floating AI Action Button inside text area */}
          {content.length > 10 && (
            <button
              onClick={handleAiPolish}
              disabled={isPolishing}
              className="absolute bottom-4 right-4 bg-gray-900/90 hover:bg-black text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 backdrop-blur-sm shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPolishing ? (
                <span className="animate-pulse">思考中...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-yellow-300" /> AI 润色排版
                </>
              )}
            </button>
          )}
        </div>

        {/* Mobile View Controls (Desktop shows here too for consistency) */}
        <EditorControls style={style} onChange={setStyle} />
      </div>

      {/* Right Side: Live Preview */}
      <div className="w-full md:w-1/2 lg:w-7/12 bg-[#e5e5e5] p-4 md:p-8 lg:p-12 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Dot pattern background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

        <div className="relative w-full max-w-[480px] flex flex-col gap-6 z-0">
           
           {/* The Actual Card to Capture */}
           <div className="shadow-2xl rounded-sm overflow-hidden ring-1 ring-black/5 transform transition-transform hover:scale-[1.01] duration-500">
              <NoteCard 
                ref={cardRef} 
                content={content} 
                title={title} 
                style={style} 
              />
           </div>

           {/* Action Buttons */}
           <div className="flex gap-4 justify-center">
              <button 
                onClick={() => {setContent(''); setTitle('')}}
                className="px-6 py-3 bg-white text-gray-600 rounded-full font-medium shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all flex items-center gap-2"
              >
                <Eraser className="w-4 h-4" /> 清空
              </button>

              <button 
                onClick={handleDownload}
                disabled={isDownloading}
                className="px-8 py-3 bg-gray-900 text-white rounded-full font-medium shadow-xl hover:shadow-2xl hover:bg-black transition-all flex items-center gap-2 transform active:scale-95 disabled:opacity-70"
              >
                {isDownloading ? (
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>{isDownloading ? '生成中...' : '保存长图'}</span>
              </button>
           </div>

           <p className="text-center text-xs text-gray-500 mt-2">
             预览效果即最终下载效果
           </p>
        </div>
      </div>
    </div>
  );
};

export default App;