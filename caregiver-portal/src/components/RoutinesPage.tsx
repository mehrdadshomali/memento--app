import { useState } from 'react';
import { Plus, Edit2, Trash2, Clock, Pill, UtensilsCrossed, Footprints, Calendar, Droplets, Users, Pin } from 'lucide-react';
import type { Routine } from '../types';

interface RoutinesPageProps {
  routines: Routine[];
}

const DAYS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

const CATEGORIES: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  medication: { label: 'İlaç', icon: <Pill size={20} />, color: '#E57373' },
  meal: { label: 'Yemek', icon: <UtensilsCrossed size={20} />, color: '#FFB74D' },
  exercise: { label: 'Egzersiz', icon: <Footprints size={20} />, color: '#81C784' },
  appointment: { label: 'Randevu', icon: <Calendar size={20} />, color: '#64B5F6' },
  hygiene: { label: 'Hijyen', icon: <Droplets size={20} />, color: '#BA68C8' },
  social: { label: 'Sosyal', icon: <Users size={20} />, color: '#4DB6AC' },
  other: { label: 'Diğer', icon: <Pin size={20} />, color: '#90A4AE' },
};

export function RoutinesPage({ routines }: RoutinesPageProps) {
  const [filter, setFilter] = useState<string>('all');
  
  const filteredRoutines = filter === 'all' 
    ? routines 
    : routines.filter(r => r.category === filter);

  const sortedRoutines = [...filteredRoutines].sort((a, b) => {
    const timeA = a.time.split(':').map(Number);
    const timeB = b.time.split(':').map(Number);
    return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
  });

  return (
    <div>
      <div className="page-header">
        <h2>Rutin Yönetimi</h2>
        <p>Günlük rutinleri görüntüleyin ve yönetin</p>
      </div>

      {/* Filters */}
      <div className="tabs">
        <button 
          className={`tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Tümü
        </button>
        {Object.entries(CATEGORIES).map(([key, { label }]) => (
          <button
            key={key}
            className={`tab ${filter === key ? 'active' : ''}`}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Add Button */}
      <div style={{ marginBottom: '24px' }}>
        <button className="btn btn-primary">
          <Plus size={18} />
          Yeni Rutin Ekle
        </button>
      </div>

      {/* Routines List */}
      <div className="card">
        <div className="routine-list">
          {sortedRoutines.length > 0 ? (
            sortedRoutines.map((routine) => {
              const category = CATEGORIES[routine.category] || CATEGORIES.other;
              
              return (
                <div key={routine.id} className="routine-item">
                <div 
                    className="routine-icon" 
                    style={{ background: `${category.color}20`, color: category.color }}
                  >
                    {category.icon}
                  </div>
                  
                  <div className="routine-info">
                    <h4>{routine.title}</h4>
                    <p>
                      {routine.days.map(d => DAYS[d]).join(', ')}
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="routine-time">
                      <Clock size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                      {routine.time}
                    </div>
                    
                    <label className="toggle">
                      <input type="checkbox" defaultChecked={routine.isEnabled} />
                      <span className="toggle-slider"></span>
                    </label>
                    
                    <button className="btn btn-icon btn-secondary">
                      <Edit2 size={16} />
                    </button>
                    
                    <button className="btn btn-icon btn-secondary">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-state">
              <Clock size={48} />
              <h3>Rutin Bulunamadı</h3>
              <p>Bu kategoride henüz rutin eklenmemiş</p>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      <div style={{ 
        marginTop: '24px', 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        {Object.entries(CATEGORIES).map(([key, { label, icon, color }]) => {
          const count = routines.filter(r => r.category === key).length;
          return (
            <div 
              key={key} 
              className="stat-card"
              style={{ cursor: 'pointer' }}
              onClick={() => setFilter(key)}
            >
              <div 
                className="stat-icon" 
                style={{ background: `${color}20`, color: color }}
              >
                {icon}
              </div>
              <div className="stat-value">{count}</div>
              <div className="stat-label">{label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
