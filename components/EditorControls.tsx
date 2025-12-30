import React from 'react';
import { FontFamily, ThemeType, NoteStyle } from '../types';
import { 
  Type, 
  Palette, 
  AlignLeft, 
  AlignCenter, 
  AlignJustify, 
  Minus, 
  Plus,
  Calendar,
  PenTool
} from 'lucide-react';

interface EditorControlsProps {
  style: NoteStyle;
  onChange: (newStyle: NoteStyle) => void;
}

const EditorControls: React.FC<EditorControlsProps> = ({ style, onChange }) => {
  
  const updateStyle = (key: keyof NoteStyle, value: any) => {
    onChange({ ...style, [key]: value });
  };

  return (
    <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl p-4 flex flex-col gap-6 shadow-sm">
      
      {/* Theme Selection */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Palette className="w-3 h-3" /> 主题风格
        </label>
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {[
            { id: ThemeType.PureWhite, bg: 'bg-white border-gray-200', label: '纯白' },
            { id: ThemeType.WarmIvory, bg: 'bg-[#F9F5E8] border-[#E6DCC3]', label: '暖宣' },
            { id: ThemeType.SoftGray, bg: 'bg-[#F3F4F6] border-gray-300', label: '静灰' },
            { id: ThemeType.DarkMode, bg: 'bg-gray-800 border-gray-700', label: '暗夜' },
          ].map((theme) => (
            <button
              key={theme.id}
              onClick={() => updateStyle('theme', theme.id)}
              className={`w-10 h-10 rounded-full border-2 flex-shrink-0 transition-all hover:scale-110 ${theme.bg} ${style.theme === theme.id ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
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
            { id: FontFamily.Serif, name: '宋体 (Serif)', class: 'font-serif' },
            { id: FontFamily.Sans, name: '黑体 (Sans)', class: 'font-sans' },
            { id: FontFamily.Handwritten, name: '马善政 (手写)', class: "font-['Ma_Shan_Zheng']" },
            { id: FontFamily.Calligraphy, name: '志莽行 (行书)', class: "font-['Zhi_Mang_Xing']" },
          ].map((font) => (
            <button
              key={font.id}
              onClick={() => updateStyle('font', font.id)}
              className={`px-3 py-2 text-sm rounded-lg border transition-all text-left ${font.class}
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
        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2 border border-gray-100">
           {/* Font Size */}
           <div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-2">
              <button 
                onClick={() => updateStyle('fontSize', Math.max(1, style.fontSize - 1))}
                disabled={style.fontSize <= 1}
                className="p-1.5 hover:bg-gray-200 rounded-md disabled:opacity-30"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-xs w-4 text-center font-medium">{style.fontSize}</span>
              <button 
                 onClick={() => updateStyle('fontSize', Math.min(3, style.fontSize + 1))}
                 disabled={style.fontSize >= 3}
                 className="p-1.5 hover:bg-gray-200 rounded-md disabled:opacity-30"
              >
                <Plus className="w-3 h-3" />
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
                  className={`p-1.5 rounded-md transition-colors ${style.alignment === align.id ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <align.icon className="w-4 h-4" />
                </button>
              ))}
           </div>
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3 pt-2 border-t border-gray-100">
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
            className="w-full mt-2 p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 bg-gray-50"
          />
        )}
      </div>

    </div>
  );
};

export default EditorControls;