
import React, { forwardRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { NoteStyle, fontMap, themeMap, ThemeType } from '../types';

interface NoteCardProps {
  content: string;
  title?: string;
  style: NoteStyle;
}

const NoteCard = forwardRef<HTMLDivElement, NoteCardProps>(({ content, title, style }, ref) => {
  const currentTheme = themeMap[style.theme];
  const currentFont = fontMap[style.font];
  
  const fontSizeMap: Record<number, string> = {
    1: 'text-[10px]',
    2: 'text-[12px]',
    3: 'text-[14px]',
    4: 'text-[16px]',
    5: 'text-[18px]',
    6: 'text-[20px]',
    7: 'text-[22px]',
    8: 'text-[24px]',
    9: 'text-[28px]',
    10: 'text-[32px]',
    11: 'text-[36px]',
    12: 'text-[42px]',
  };

  const fontSizeClass = fontSizeMap[style.fontSize] || 'text-[16px]';
  const baseLeading = style.fontSize <= 5 ? 'leading-relaxed' : 'leading-snug';

  const alignmentClass = 
    style.alignment === 'center' ? 'text-center' :
    style.alignment === 'justify' ? 'text-justify' :
    'text-left';

  const dateStr = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short'
  });

  const processedContent = content ? content.replace(/\n/g, '  \n') : '';
  const codeBgClass = style.theme === ThemeType.DarkMode ? 'bg-white/10' : 'bg-black/5';

  return (
    <div 
      ref={ref}
      className={`w-full max-w-[480px] mx-auto min-h-[400px] p-8 md:p-12 flex flex-col shadow-sm relative overflow-hidden transition-colors duration-300 ${currentTheme.container} ${currentFont}`}
    >
      {/* Top Accent */}
      <div className={`w-8 h-1 mb-8 opacity-20 rounded-full ${style.alignment === 'center' ? 'mx-auto' : ''} bg-current ${currentTheme.text}`}></div>

      {/* Date Header */}
      {style.showDate && (
        <div className={`text-[10px] tracking-widest uppercase mb-6 opacity-50 ${currentTheme.text} ${style.alignment === 'center' ? 'text-center' : ''}`}>
          {dateStr.replace(/\//g, '.')}
        </div>
      )}

      {/* Title Section */}
      {title && (
        <h1 className={`text-2xl font-bold mb-8 ${currentTheme.text} ${style.alignment === 'center' ? 'text-center' : ''}`}>
          {title}
        </h1>
      )}

      {/* Body Content */}
      <div className={`flex-grow ${fontSizeClass} ${baseLeading} ${alignmentClass} ${currentTheme.text}`}>
        {content ? (
          <ReactMarkdown
            components={{
              p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,
              h1: ({node, ...props}) => <h1 className="text-[1.4em] font-bold mt-8 mb-4 leading-tight border-b border-current border-opacity-10 pb-2" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-[1.2em] font-bold mt-6 mb-3 leading-tight" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-[1.1em] font-bold mt-4 mb-2" {...props} />,
              ul: ({node, ...props}) => <ul className={`list-disc ${style.alignment === 'center' ? 'list-inside' : 'list-outside ml-4'} mb-4 space-y-1`} {...props} />,
              ol: ({node, ...props}) => <ol className={`list-decimal ${style.alignment === 'center' ? 'list-inside' : 'list-outside ml-4'} mb-4 space-y-1`} {...props} />,
              li: ({node, ...props}) => <li className="pl-1" {...props} />,
              blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-current pl-4 italic my-6 opacity-75" {...props} />,
              code: ({node, ...props}) => <code className={`font-mono text-[0.85em] rounded px-1 py-0.5 ${codeBgClass}`} {...props} />,
              pre: ({node, ...props}) => <pre className={`font-mono text-sm p-4 rounded-lg overflow-x-auto mb-6 ${codeBgClass}`} {...props} />,
              a: ({node, ...props}) => <a className="underline underline-offset-2 opacity-80 hover:opacity-100" {...props} />,
              hr: ({node, ...props}) => <hr className="border-t border-current opacity-20 my-8" {...props} />,
              img: ({node, ...props}) => <img className="max-w-full h-auto rounded-lg my-6 mx-auto block shadow-sm" {...props} />,
              // 关键：显式样式注入，并根据字体类型应用伪粗体逻辑
              strong: ({node, ...props}) => (
                <strong 
                  className={`font-bold opacity-100`} 
                  style={{ fontWeight: 700 }} 
                  {...props} 
                />
              ),
              em: ({node, ...props}) => <em className="italic opacity-90" {...props} />
            }}
          >
            {processedContent}
          </ReactMarkdown>
        ) : (
          <div className="whitespace-pre-wrap opacity-40">在此处输入文字或内容...</div>
        )}
      </div>

      {/* Signature Footer */}
      {style.showSignature && (
        <div className={`mt-12 pt-8 border-t border-current border-opacity-10 flex flex-col gap-2 ${currentTheme.accent}`}>
           <div className={`flex items-center gap-2 ${style.alignment === 'center' ? 'justify-center' : 'justify-end'}`}>
             <span className="text-xs tracking-widest font-medium opacity-70">
               {style.signatureText || "ZenNote"}
             </span>
           </div>
        </div>
      )}
      
      {/* Noise layer - 移除可能导致内存溢出的 SVG Filter 渲染 */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] noise-layer bg-[url('https://www.transparenttextures.com/patterns/pinstripe.png')]"></div>
    </div>
  );
});

NoteCard.displayName = 'NoteCard';

export default NoteCard;
