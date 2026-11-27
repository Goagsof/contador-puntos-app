// From Uiverse.io by ArturCodeCraft - https://uiverse.io/ArturCodeCraft/big-chipmunk-22
// MIT License, Copyright (c) ArturCodeCraft (Artur)
// Adaptado a React + sistema de temas del proyecto.

import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle ${isDark ? 'is-dark' : 'is-light'}`}
      title={isDark ? 'Cambiar a claro' : 'Cambiar a oscuro'}
      aria-label={isDark ? 'Cambiar a claro' : 'Cambiar a oscuro'}
    >
      <span className="change-theme__icon">
        <span className="icon-sun-moon" />
        <span className="sun-rays">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </span>
      </span>
    </button>
  );
}