// ThemeContext.js
import React, { createContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');  // actual theme in use
  const [mode, setMode] = useState('system');   // 'light' | 'dark' | 'system'

  useEffect(() => {
    (async () => {
      const savedMode = await AsyncStorage.getItem('themeMode');
      if (savedMode) {
        setMode(savedMode);
        if (savedMode === 'system') {
          const systemTheme = Appearance.getColorScheme() || 'light';
          setTheme(systemTheme);
        } else {
          setTheme(savedMode);
        }
      } else {
        const systemTheme = Appearance.getColorScheme() || 'light';
        setTheme(systemTheme);
        setMode('system');
      }
    })();
  }, []);

  // Listen for system theme changes only if mode === 'system'
  useEffect(() => {
    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      if (mode === 'system') {
        setTheme(colorScheme || 'light');
      }
    });
    return () => listener.remove();
  }, [mode]);

  // Function to change mode manually
  const setThemeMode = async (newMode) => {
    setMode(newMode);
    await AsyncStorage.setItem('themeMode', newMode);

    if (newMode === 'system') {
      const systemTheme = Appearance.getColorScheme() || 'light';
      setTheme(systemTheme);
    } else {
      setTheme(newMode);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, mode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
