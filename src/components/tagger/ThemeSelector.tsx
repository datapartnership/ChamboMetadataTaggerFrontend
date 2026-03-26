import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight, X, Check } from 'lucide-react';
import { UNBIS_THESAURUS, ThemeLevel1, ThemeLevel2, SelectedTheme, formatThemeDisplay } from '../../data/unbisThesaurus';

interface ThemeSelectorProps {
  selectedThemes: SelectedTheme[];
  onChange: (themes: SelectedTheme[]) => void;
  maxThemes?: number;
  disabled?: boolean;
}

export const ThemeSelector = ({ selectedThemes, onChange, maxThemes = 3, disabled = false }: ThemeSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedLevel1, setExpandedLevel1] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setExpandedLevel1(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isThemeSelected = (level1Code: string, level2Code?: string): boolean => {
    return selectedThemes.some(t => {
      if (level2Code) {
        return t.level2Code === level2Code;
      }
      return t.level1Code === level1Code && !t.level2Code;
    });
  };

  const handleSelectLevel1 = (level1: ThemeLevel1) => {
    const existing = selectedThemes.find(t => t.level1Code === level1.code && !t.level2Code);
    
    if (existing) {
      // Remove if already selected
      onChange(selectedThemes.filter(t => !(t.level1Code === level1.code && !t.level2Code)));
    } else if (selectedThemes.length < maxThemes) {
      // Add if under limit
      onChange([...selectedThemes, {
        level1Code: level1.code,
        level1Name: level1.name,
      }]);
    }
  };

  const handleSelectLevel2 = (level1: ThemeLevel1, level2: ThemeLevel2) => {
    const existing = selectedThemes.find(t => t.level2Code === level2.code);
    
    if (existing) {
      // Remove if already selected
      onChange(selectedThemes.filter(t => t.level2Code !== level2.code));
    } else if (selectedThemes.length < maxThemes) {
      // Add if under limit
      onChange([...selectedThemes, {
        level1Code: level1.code,
        level1Name: level1.name,
        level2Code: level2.code,
        level2Name: level2.name,
      }]);
    }
  };

  const handleRemoveTheme = (theme: SelectedTheme) => {
    onChange(selectedThemes.filter(t => {
      if (theme.level2Code) {
        return t.level2Code !== theme.level2Code;
      }
      return !(t.level1Code === theme.level1Code && !t.level2Code);
    }));
  };

  const toggleLevel1Expand = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedLevel1(expandedLevel1 === code ? null : code);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected themes display */}
      <div 
        className={`min-h-[44px] p-3 bg-white border border-slate-200 rounded-lg focus-within:ring-2 focus-within:ring-primary-700 focus-within:border-transparent ${disabled ? 'bg-slate-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {selectedThemes.length === 0 ? (
          <span className="text-slate-400">Select themes from UNBIS Thesaurus...</span>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedThemes.map((theme, index) => (
              <span
                key={`${theme.level1Code}-${theme.level2Code || 'main'}-${index}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-medium rounded-full shadow-sm hover:shadow-md transition-all"
              >
                {formatThemeDisplay(theme)}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!disabled) handleRemoveTheme(theme);
                  }}
                  disabled={disabled}
                  className="ml-1 hover:bg-primary-700 rounded-full p-0.5 transition-colors disabled:pointer-events-none"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
        <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Dropdown menu */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {UNBIS_THESAURUS.map((level1) => (
            <div key={level1.code} className="border-b border-slate-100 last:border-b-0">
              {/* Level 1 header */}
              <div 
                className="flex items-center gap-2 px-3 py-2.5 hover:bg-slate-50 cursor-pointer"
              >
                <button
                  type="button"
                  onClick={(e) => toggleLevel1Expand(level1.code, e)}
                  className="p-0.5 hover:bg-slate-200 rounded transition-colors"
                >
                  {expandedLevel1 === level1.code ? (
                    <ChevronDown className="w-4 h-4 text-slate-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  )}
                </button>
                <div 
                  className="flex-1 flex items-center justify-between"
                  onClick={() => handleSelectLevel1(level1)}
                >
                  <span className="font-medium text-slate-900">{level1.name}</span>
                  {isThemeSelected(level1.code) && (
                    <Check className="w-4 h-4 text-primary-600" />
                  )}
                </div>
              </div>

              {/* Level 2 items */}
              {expandedLevel1 === level1.code && (
                <div className="bg-slate-50 border-t border-slate-100">
                  {level1.subThemes.map((level2) => (
                    <div
                      key={level2.code}
                      className={`flex items-center justify-between px-3 py-2 pl-10 hover:bg-slate-100 cursor-pointer ${
                        isThemeSelected(level1.code, level2.code) ? 'bg-primary-50' : ''
                      }`}
                      onClick={() => handleSelectLevel2(level1, level2)}
                    >
                      <span className="text-sm text-slate-700">{level2.name}</span>
                      {isThemeSelected(level1.code, level2.code) && (
                        <Check className="w-4 h-4 text-primary-600" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Helper text */}
      <p className="mt-2 text-xs text-slate-500">
        Select up to {maxThemes} themes. Click the arrow to expand sub-themes (optional).
      </p>
    </div>
  );
};
