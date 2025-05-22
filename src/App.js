import React from 'react';
import NFTMinter from './components/NFTMinter';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 to-blue-200 flex items-center justify-center p-4">
      <NFTMinter />
    </div>
  );
}

export default App;