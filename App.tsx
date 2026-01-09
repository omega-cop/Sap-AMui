import React, { useState, useEffect } from 'react';
import { ScanLine, Box, Settings as SettingsIcon } from 'lucide-react';
import { Scanner } from './components/Scanner';
import { Inventory } from './components/Inventory';
import { Settings } from './components/Settings';

enum Tab {
  SCAN = 'SCAN',
  INVENTORY = 'INVENTORY',
  SETTINGS = 'SETTINGS'
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.SCAN);
  const [isNavVisible, setIsNavVisible] = useState(true);

  // Reset nav visibility when changing tabs
  useEffect(() => {
    setIsNavVisible(true);
  }, [activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case Tab.SCAN:
        return <Scanner />;
      case Tab.INVENTORY:
        return <Inventory setNavVisible={setIsNavVisible} />;
      case Tab.SETTINGS:
        return <Settings setNavVisible={setIsNavVisible} />;
      default:
        return <Scanner />;
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-gray-50">
      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav 
        className={`bg-white border-t border-gray-200 pb-safe pt-2 px-6 fixed bottom-0 w-full z-40 h-[80px] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-transform duration-300 ease-in-out ${isNavVisible ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="flex justify-around items-center h-full pb-2">
          
          <button 
            onClick={() => setActiveTab(Tab.INVENTORY)}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === Tab.INVENTORY ? 'text-brand-600 -translate-y-1' : 'text-gray-400'}`}
          >
            <Box className={`w-6 h-6 ${activeTab === Tab.INVENTORY ? 'fill-current opacity-20' : ''}`} strokeWidth={2.5} />
            <span className="text-xs font-bold">Kho hàng</span>
          </button>

          {/* Center Scan Button - Elevated */}
          <button 
            onClick={() => setActiveTab(Tab.SCAN)}
            className={`
              relative -top-6 w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-4 border-gray-50 transition-transform duration-300
              ${activeTab === Tab.SCAN 
                ? 'bg-brand-600 text-white scale-110 shadow-brand-200' 
                : 'bg-white text-gray-400 hover:text-brand-600'
              }
            `}
          >
            <ScanLine className="w-8 h-8" />
          </button>

          <button 
            onClick={() => setActiveTab(Tab.SETTINGS)}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === Tab.SETTINGS ? 'text-brand-600 -translate-y-1' : 'text-gray-400'}`}
          >
            <SettingsIcon className={`w-6 h-6 ${activeTab === Tab.SETTINGS ? 'fill-current opacity-20' : ''}`} strokeWidth={2.5} />
            <span className="text-xs font-bold">Cài đặt</span>
          </button>

        </div>
      </nav>
    </div>
  );
};

export default App;