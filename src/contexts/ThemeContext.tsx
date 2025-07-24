import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('auto');
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    const updateTheme = () => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');

      if (theme === 'auto') {
        const hour = new Date().getHours();
        const isNightTime = hour < 7 || hour >= 19; // Dark mode from 7 PM to 7 AM
        const computedTheme = isNightTime ? 'dark' : 'light';
        root.classList.add(computedTheme);
        setActualTheme(computedTheme);
        
        // Add smooth transition for auto theme changes
        root.style.transition = 'background-color 0.3s ease, color 0.3s ease';
      } else {
        root.classList.add(theme);
        setActualTheme(theme);
        root.style.transition = 'background-color 0.3s ease, color 0.3s ease';
      }
    };

    updateTheme();
    localStorage.setItem('theme', theme);

    // Update theme every minute when in auto mode
    let interval: NodeJS.Timeout;
    if (theme === 'auto') {
      interval = setInterval(updateTheme, 60000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, actualTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}