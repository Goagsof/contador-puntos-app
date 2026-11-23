import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

const VALID_THEMES = ['light', 'dark'];
const VALID_ACCENTS = [
  'azul',      // default
  'green',
  'lila',
  'menta',
  'amarillo',
  'naranja',
  'rosa',
  'celeste',
];

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (VALID_THEMES.includes(saved)) return saved;
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  const [accent, setAccent] = useState(() => {
    const saved = localStorage.getItem('accent');
    if (VALID_ACCENTS.includes(saved)) return saved;
    return 'azul';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accent);
    localStorage.setItem('accent', accent);
  }, [accent]);

  const toggleTheme = () =>
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, accent, setAccent, toggleTheme, VALID_ACCENTS }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
} 