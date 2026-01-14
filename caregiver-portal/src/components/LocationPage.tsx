import { MapPin, Home, Clock, AlertTriangle, Navigation } from 'lucide-react';
import type { Patient, ActivityLog } from '../types';
import { formatDistanceToNow, format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface LocationPageProps {
  patient: Patient;
  activities: ActivityLog[];
}

export function LocationPage({ patient, activities }: LocationPageProps) {
  const { location, homeLocation } = patient;
  const locationAlerts = activities.filter(a => a.type === 'location_alert');
  
  const lastUpdate = location?.timestamp 
    ? formatDistanceToNow(new Date(location.timestamp), { addSuffix: true, locale: tr })
    : 'Bilinmiyor';

  const openMaps = () => {
    if (location) {
      const url = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
      window.open(url, '_blank');
    }
  };

  const openDirections = () => {
    if (location && homeLocation) {
      const url = `https://www.google.com/maps/dir/${location.latitude},${location.longitude}/${homeLocation.latitude},${homeLocation.longitude}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Konum Takibi</h2>
        <p>Hastanın gerçek zamanlı konumunu takip edin</p>
      </div>

      {/* Status Banner */}
      <div className={`patient-card ${location?.isHome ? '' : 'away'}`} style={{
        background: location?.isHome 
          ? 'linear-gradient(135deg, #81C784 0%, #A5D6A7 100%)'
          : 'linear-gradient(135deg, #FFB74D 0%, #FFCC80 100%)'
      }}>
        <div className="patient-avatar">
          {location?.isHome ? '🏠' : '📍'}
        </div>
        <div className="patient-info">
          <h3>{patient.name}</h3>
          <p>{location?.isHome ? 'Şu anda evde' : 'Şu anda dışarıda'}</p>
        </div>
        <div className="patient-status">
          <button className="btn btn-secondary" onClick={openMaps}>
            <MapPin size={16} />
            Haritada Gör
          </button>
          {!location?.isHome && (
            <button className="btn btn-secondary" onClick={openDirections} style={{ marginTop: '8px' }}>
              <Navigation size={16} />
              Eve Yol Tarifi
            </button>
          )}
        </div>
      </div>

      <div className="two-column">
        {/* Map */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Canlı Konum</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              <Clock size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              {lastUpdate}
            </span>
          </div>
          
          <div className="map-container" style={{ height: '400px' }}>
            <div className="map-placeholder">
              <MapPin size={64} />
              <p style={{ marginTop: '16px', fontSize: '1.1rem' }}>Harita Görünümü</p>
              <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>
                Koordinatlar: {location?.latitude.toFixed(6)}, {location?.longitude.toFixed(6)}
              </p>
              <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={openMaps}>
                Google Maps'te Aç
              </button>
            </div>
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <div className="location-row" style={{ marginBottom: '16px' }}>
              <MapPin size={20} />
              <div>
                <div className="label">Mevcut Konum</div>
                <div className="value">{location?.address || 'Bilinmiyor'}</div>
              </div>
            </div>
            
            <div className="location-row">
              <Home size={20} />
              <div>
                <div className="label">Kayıtlı Ev Adresi</div>
                <div className="value">{homeLocation?.address || 'Henüz ayarlanmamış'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Location History */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Konum Geçmişi</h3>
          </div>
          
          {locationAlerts.length > 0 ? (
            <div className="activity-feed">
              {locationAlerts.map((alert) => (
                <div key={alert.id} className="activity-item">
                  <div className="activity-icon location">
                    <AlertTriangle size={16} />
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">{alert.title}</div>
                    {alert.description && (
                      <div className="activity-desc">{alert.description}</div>
                    )}
                  </div>
                  <div className="activity-time">
                    {format(new Date(alert.timestamp), 'HH:mm', { locale: tr })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <MapPin size={48} />
              <h3>Konum Uyarısı Yok</h3>
              <p>Henüz konum uyarısı kaydedilmedi</p>
            </div>
          )}
          
          <div style={{ 
            marginTop: '24px', 
            padding: '16px', 
            background: 'var(--color-surface-alt)',
            borderRadius: 'var(--radius-md)'
          }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '8px' }}>Bildirim Ayarları</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Hasta evden ayrıldığında otomatik bildirim gönderilir. 
              Bildirim sıklığı mobil uygulamadan ayarlanabilir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
