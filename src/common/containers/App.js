import React from 'react';
import DarkModeProvider from '../contexts/DarkModeProvider';

export default function App({ children }) {
  return (
    <DarkModeProvider>
      {children}
    </DarkModeProvider>
  );
}
