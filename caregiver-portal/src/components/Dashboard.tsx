import { Activity, CheckCircle, Clock, Gamepad2 } from 'lucide-react';
import type { PatientData } from '../types';
import { ActivityFeed } from './ActivityFeed';
import { LocationCard } from './LocationCard';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface DashboardProps {
  data: PatientData;
}

export function Dashboard({ data }: DashboardProps) {
  const { patient, stats, activities, routines } = data;
  const todayStats = stats[stats.length - 1];
  const completionRate = Math.round((todayStats.routinesCompleted / todayStats.totalRoutines) * 100);
  
  const lastActiveText = patient.lastActive 
    ? formatDistanceToNow(new Date(patient.lastActive), { addSuffix: true, locale: tr })
    : 'Bilinmiyor';

  return (
    <div>
      <div className="page-header">
        <h2>Hoş Geldiniz</h2>
        <p>Hasta durumunu ve aktivitelerini buradan takip edebilirsiniz</p>
      </div>

      {/* Patient Card */}
      <div className="patient-card">
        <div className="patient-avatar">👤</div>
        <div className="patient-info">
          <h3>{patient.name}</h3>
          <p>Son aktivite: {lastActiveText}</p>
        </div>
        <div className="patient-status">
          <span className={`status-badge ${patient.location?.isHome ? 'home' : 'away'}`}>
            {patient.location?.isHome ? '🏠 Evde' : '📍 Dışarıda'}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <Gamepad2 size={24} />
          </div>
          <div className="stat-value">{todayStats.gamesPlayed}</div>
          <div className="stat-label">Bugün Oynanan Oyun</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon success">
            <CheckCircle size={24} />
          </div>
          <div className="stat-value">{todayStats.routinesCompleted}/{todayStats.totalRoutines}</div>
          <div className="stat-label">Tamamlanan Rutin</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon warning">
            <Clock size={24} />
          </div>
          <div className="stat-value">{todayStats.timeSpentMinutes} dk</div>
          <div className="stat-label">Uygulama Süresi</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon info">
            <Activity size={24} />
          </div>
          <div className="stat-value">%{completionRate}</div>
          <div className="stat-label">Günlük Tamamlanma</div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="two-column">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Son Aktiviteler</h3>
          </div>
          <ActivityFeed activities={activities.slice(0, 5)} />
        </div>
        
        <LocationCard patient={patient} />
      </div>

      {/* Today's Routines */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">Bugünün Rutinleri</h3>
        </div>
        <div className="routine-list">
          {routines.slice(0, 4).map((routine) => (
            <div key={routine.id} className="routine-item">
              <div className="routine-icon" style={{ background: `${routine.color}20` }}>
                {routine.icon}
              </div>
              <div className="routine-info">
                <h4>{routine.title}</h4>
                <p>{getCategoryLabel(routine.category)}</p>
              </div>
              <div className="routine-time">{routine.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    medication: 'İlaç',
    meal: 'Yemek',
    exercise: 'Egzersiz',
    appointment: 'Randevu',
    hygiene: 'Hijyen',
    social: 'Sosyal',
    other: 'Diğer',
  };
  return labels[category] || category;
}
