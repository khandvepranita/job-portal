import React, { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  useEffect(() => {
    // Force light theme and remove any lingering dark mode attributes or local storage
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.removeItem('app_theme');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: 'light', toggleTheme: () => {}, isDark: false }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
