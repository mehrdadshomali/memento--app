import { useState } from 'react';
import './App.css';
import { 
  Sidebar, 
  Dashboard, 
  LocationPage, 
  RoutinesPage, 
  ContentManager, 
  StatsPage, 
  SettingsPage 
} from './components';
import { mockPatientData } from './data/mockData';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const data = mockPatientData;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard data={data} />;
      case 'location':
        return <LocationPage patient={data.patient} activities={data.activities} />;
      case 'routines':
        return <RoutinesPage routines={data.routines} />;
      case 'content':
        return <ContentManager cards={data.cards} />;
      case 'stats':
        return <StatsPage stats={data.stats} activities={data.activities} />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard data={data} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
