import { MapPin, Home, Navigation } from 'lucide-react';
import type { Patient } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface LocationCardProps {
  patient: Patient;
}

export function LocationCard({ patient }: LocationCardProps) {
  const { location, homeLocation } = patient;
  
  const lastUpdate = location?.timestamp 
    ? formatDistanceToNow(new Date(location.timestamp), { addSuffix: true, locale: tr })
    : 'Bilinmiyor';

  const openMaps = () => {
    if (location) {
      const url = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="card location-card">
      <div className="card-header">
        <h3 className="card-title">Konum</h3>
        <button className="btn btn-sm btn-secondary" onClick={openMaps}>
          <Navigation size={14} />
          Haritada Aç
        </button>
      </div>
      
      <div className="map-container">
        <div className="map-placeholder">
          <MapPin size={48} />
          <p>Harita görünümü</p>
          <p style={{ fontSize: '0.8rem' }}>
            {location?.latitude.toFixed(4)}, {location?.longitude.toFixed(4)}
          </p>
        </div>
      </div>
      
      <div className="location-info">
        <div className="location-row">
          <MapPin size={20} />
          <div>
            <div className="label">Mevcut Konum</div>
            <div className="value">{location?.address || 'Bilinmiyor'}</div>
          </div>
        </div>
        
        <div className="location-row">
          <Home size={20} />
          <div>
            <div className="label">Ev Adresi</div>
            <div className="value">{homeLocation?.address || 'Ayarlanmamış'}</div>
          </div>
        </div>
        
        <div style={{ 
          fontSize: '0.8rem', 
          color: 'var(--color-text-muted)',
          marginTop: '8px'
        }}>
          Son güncelleme: {lastUpdate}
        </div>
      </div>
    </div>
  );
}
