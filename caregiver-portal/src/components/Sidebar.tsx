import { Home, MapPin, Calendar, Image, BarChart3, Settings } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Ana Sayfa', icon: Home },
  { id: 'location', label: 'Konum Takibi', icon: MapPin },
  { id: 'routines', label: 'Rutinler', icon: Calendar },
  { id: 'content', label: 'İçerik Yönetimi', icon: Image },
  { id: 'stats', label: 'İstatistikler', icon: BarChart3 },
  { id: 'settings', label: 'Ayarlar', icon: Settings },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span style={{ fontSize: '1.5rem' }}>◐</span>
        <h1>MEMENTO</h1>
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => onTabChange(item.id)}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      
      <div style={{ 
        padding: '16px', 
        borderTop: '1px solid var(--color-border)',
        marginTop: 'auto',
        fontSize: '0.8rem',
        color: 'var(--color-text-muted)'
      }}>
        <p>Memento Bakıcı Paneli</p>
        <p>v1.0.0</p>
      </div>
    </aside>
  );
}
