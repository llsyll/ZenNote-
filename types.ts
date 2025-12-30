export enum FontFamily {
  Serif = 'font-serif',
  Sans = 'font-sans',
  Handwritten = 'font-handwritten',
  Calligraphy = 'font-calligraphy'
}

export enum ThemeType {
  PureWhite = 'pure-white',
  WarmIvory = 'warm-ivory',
  SoftGray = 'soft-gray',
  DarkMode = 'dark-mode'
}

export interface NoteStyle {
  font: FontFamily;
  theme: ThemeType;
  fontSize: number; // 1: Small, 2: Medium, 3: Large
  alignment: 'left' | 'center' | 'justify';
  showDate: boolean;
  showSignature: boolean;
  signatureText: string;
}

// Helper to map enum to actual CSS classes
export const fontMap: Record<FontFamily, string> = {
  [FontFamily.Serif]: "font-['Noto_Serif_SC']",
  [FontFamily.Sans]: "font-['Noto_Sans_SC']",
  [FontFamily.Handwritten]: "font-['Ma_Shan_Zheng']",
  [FontFamily.Calligraphy]: "font-['Zhi_Mang_Xing']"
};

export const themeMap: Record<ThemeType, { container: string, text: string, accent: string }> = {
  [ThemeType.PureWhite]: {
    container: 'bg-white',
    text: 'text-gray-800',
    accent: 'text-gray-400'
  },
  [ThemeType.WarmIvory]: {
    container: 'bg-[#F9F5E8]', // Warm paper color
    text: 'text-[#4A4036]', // Dark brown/sepia
    accent: 'text-[#8C7E72]'
  },
  [ThemeType.SoftGray]: {
    container: 'bg-[#F3F4F6]',
    text: 'text-slate-700',
    accent: 'text-slate-400'
  },
  [ThemeType.DarkMode]: {
    container: 'bg-[#1c1c1e]',
    text: 'text-gray-200',
    accent: 'text-gray-600'
  }
};