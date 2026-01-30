
import React from 'react';
import { FontFamily, ThemeType, NoteStyle, fontMap } from '../types';
import { 
  Type, 
  Palette, 
  AlignLeft, 
  AlignCenter, 
  AlignJustify, 
  Minus, 
  Plus,
  Calendar,
  PenTool,
  Table
} from 'lucide-react';

interface EditorControlsProps {
  style: NoteStyle;
  onChange: (newStyle: NoteStyle) => void;
}

const EditorControls: React.FC<EditorControlsProps> = ({ style, onChange }) => {
  
  const updateStyle = (key: keyof NoteStyle, value: any) => {
    onChange({ ...style, [key]: value });
  };

  // 辅助函数：确保获取有效的字号数值
  const currentTableSize = style.tableFontSize || 3;
  const currentFontSize = style.fontSize || 4;

  return (
    <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl p-4 flex flex-col gap-6 shadow-sm overflow-visible">
      
      {/* Theme Selection */}
      <div className="space-y-3 overflow-visible">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Palette className="w-3 h-3" /> 主题风格
        </label>
        <div className="flex gap-4 overflow-x-auto py-2 px-1 no-scrollbar scroll-smooth overflow-visible">
          {[
            { id: ThemeType.PureWhite, bg: 'bg-white border-gray-200', label: '纯白' },
            { id: ThemeType.WarmIvory, bg: 'bg-[#F9F5E8] border-[#E6DCC3]', label: '暖宣' },
            { id: ThemeType.SoftGray, bg: 'bg-[#F3F4F6] border-gray-300', label: '静灰' },
            { id: ThemeType.DarkMode, bg: 'bg-gray-800 border-gray-700', label: '暗夜' },
          ].map((theme) => (
            <button
              key={theme.id}
              onClick={() => updateStyle('theme', theme.id)}
              className={`w-10 h-10 rounded-full border-2 flex-shrink-0 transition-all hover:scale-110 active:scale-95 ${theme.bg} ${style.theme === theme.id ? 'ring-4 ring-offset-2 ring-gray-400 scale-105' : ''}`}
              title={theme.label}
            />
          ))}
        </div>
      </div>

      {/* Font Selection */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Type className="w-3 h-3" /> 字体选择
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: FontFamily.NotoSans, name: '思源黑体' },
            { id: FontFamily.NotoSerif, name: '思源宋体' },
            { id: FontFamily.WenKai, name: '霞鹜文楷' },
            { id: FontFamily.WenKaiMono, name: '文楷等宽' },
          ].map((font) => (
            <button
              key={font.id}
              onClick={() => updateStyle('font', font.id)}
              className={`px-3 py-2.5 text-sm rounded-lg border transition-all text-left truncate ${fontMap[font.id]}
                ${style.font === font.id 
                  ? 'bg-gray-900 text-white border-gray-900' 
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
            >
              {font.name}
            </button>
          ))}
        </div>
      </div>

      {/* Typography Details */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <AlignLeft className="w-3 h-3" /> 排版细节
        </label>
        <div className="flex flex-col gap-3">
          {/* Main Font Size & Alignment */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2 border border-gray-100">
             {/* Font Size */}
             <div className="flex items-center gap-2 border-r border-gray-200 pr-3 mr-1">
                <button 
                  onClick={() => updateStyle('fontSize', Math.max(1, currentFontSize - 1))}
                  disabled={currentFontSize <= 1}
                  className="p-2 hover:bg-gray-200 rounded-md disabled:opacity-30 active:scale-90 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="flex flex-col items-center min-w-[2.5rem]">
                  <span className="text-xs font-bold leading-none">{currentFontSize}</span>
                  <span className="text-[8px] opacity-40 uppercase">正文</span>
                </div>
                <button 
                   onClick={() => updateStyle('fontSize', Math.min(12, currentFontSize + 1))}
                   disabled={currentFontSize >= 12}
                   className="p-2 hover:bg-gray-200 rounded-md disabled:opacity-30 active:scale-90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
             </div>

             {/* Alignment */}
             <div className="flex items-center gap-1">
                {[
                  { id: 'left', icon: AlignLeft },
                  { id: 'center', icon: AlignCenter },
                  { id: 'justify', icon: AlignJustify },
                ].map((align) => (
                  <button
                    key={align.id}
                    onClick={() => updateStyle('alignment', align.id)}
                    className={`p-2.5 rounded-md transition-colors ${style.alignment === align.id ? 'bg-white shadow-sm text-black border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <align.icon className="w-4 h-4" />
                  </button>
                ))}
             </div>
          </div>

          {/* Table Font Size Control */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2 border border-gray-100 group">
             <div className="flex items-center gap-2 text-gray-500 pl-2">
               <Table className="w-4 h-4" />
               <span className="text-xs font-medium">表格字号</span>
             </div>
             <div className="flex items-center gap-2">
                <button 
                  onClick={() => updateStyle('tableFontSize', Math.max(1, currentTableSize - 1))}
                  disabled={currentTableSize <= 1}
                  className="p-2 hover:bg-gray-200 rounded-md disabled:opacity-30 active:scale-90 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="flex items-center justify-center min-w-[1.5rem]">
                  <span className="text-xs font-bold">{currentTableSize}</span>
                </div>
                <button 
                   onClick={() => updateStyle('tableFontSize', Math.min(12, currentTableSize + 1))}
                   disabled={currentTableSize >= 12}
                   className="p-2 hover:bg-gray-200 rounded-md disabled:opacity-30 active:scale-90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-gray-600 flex items-center gap-2">
            <Calendar className="w-3 h-3" /> 显示日期
          </label>
          <button 
            onClick={() => updateStyle('showDate', !style.showDate)}
            className={`w-9 h-5 rounded-full relative transition-colors ${style.showDate ? 'bg-gray-900' : 'bg-gray-200'}`}
          >
            <span className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform ${style.showDate ? 'translate-x-4' : 'translate-x-0'}`} />
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-gray-600 flex items-center gap-2">
            <PenTool className="w-3 h-3" /> 底部署名
          </label>
          <button 
            onClick={() => updateStyle('showSignature', !style.showSignature)}
            className={`w-9 h-5 rounded-full relative transition-colors ${style.showSignature ? 'bg-gray-900' : 'bg-gray-200'}`}
          >
            <span className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform ${style.showSignature ? 'translate-x-4' : 'translate-x-0'}`} />
          </button>
        </div>

        {style.showSignature && (
          <input 
            type="text"
            value={style.signatureText}
            onChange={(e) => updateStyle('signatureText', e.target.value)}
            placeholder="署名内容"
            className="w-full mt-2 p-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 bg-gray-50/50"
          />
        )}
      </div>

    </div>
  );
};

export default EditorControls;
