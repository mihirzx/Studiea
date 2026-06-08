import { render, screen, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeContext';

function Probe() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button onClick={toggleTheme} data-testid="probe">
      {theme}
    </button>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('respects a saved "dark" preference and applies the dark class', () => {
    localStorage.setItem('studiea_theme', 'dark');
    render(<ThemeProvider><Probe /></ThemeProvider>);

    expect(screen.getByTestId('probe')).toHaveTextContent('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('toggleTheme flips the theme, the html class, and persists to localStorage', () => {
    localStorage.setItem('studiea_theme', 'light');
    render(<ThemeProvider><Probe /></ThemeProvider>);

    expect(document.documentElement.classList.contains('dark')).toBe(false);

    act(() => screen.getByTestId('probe').click());

    expect(screen.getByTestId('probe')).toHaveTextContent('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('studiea_theme')).toBe('dark');

    act(() => screen.getByTestId('probe').click());

    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('studiea_theme')).toBe('light');
  });
});
