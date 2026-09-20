import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTheme } from '../theme';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const stored = await AsyncStorage.getItem('darkMode');
      if (stored !== null) {
        setIsDark(stored === 'true');
      } else {
        setIsDark(systemColorScheme === 'dark');
      }
    } catch {
      setIsDark(systemColorScheme === 'dark');
    } finally {
      setIsLoaded(true);
    }
  };

  const toggleTheme = useCallback(async () => {
    const newValue = !isDark;
    setIsDark(newValue);
    try {
      await AsyncStorage.setItem('darkMode', newValue.toString());
    } catch (err) {
      console.warn('Error saving theme preference:', err.message);
    }
  }, [isDark]);

  const setDarkMode = useCallback(async (value) => {
    setIsDark(value);
    try {
      await AsyncStorage.setItem('darkMode', value.toString());
    } catch (err) {
      console.warn('Error saving theme preference:', err.message);
    }
  }, []);

  const theme = getTheme(isDark);

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        isLoaded,
        theme,
        colors: theme.colors,
        toggleTheme,
        setDarkMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
