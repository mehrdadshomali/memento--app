import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Gamepad2, CheckCircle, MapPin, Smartphone, Circle } from 'lucide-react';
import type { ActivityLog } from '../types';

interface ActivityFeedProps {
  activities: ActivityLog[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const getActivityIcon = (type: ActivityLog['type']) => {
    switch (type) {
      case 'game_played': return { icon: <Gamepad2 size={16} />, className: 'game' };
      case 'routine_completed': return { icon: <CheckCircle size={16} />, className: 'routine' };
      case 'location_alert': return { icon: <MapPin size={16} />, className: 'location' };
      case 'app_opened': return { icon: <Smartphone size={16} />, className: 'app' };
      default: return { icon: <Circle size={16} />, className: '' };
    }
  };

  if (activities.length === 0) {
    return (
      <div className="empty-state">
        <p>Henüz aktivite yok</p>
      </div>
    );
  }

  return (
    <div className="activity-feed">
      {activities.map((activity) => {
        const { icon, className } = getActivityIcon(activity.type);
        const timeAgo = formatDistanceToNow(new Date(activity.timestamp), { 
          addSuffix: true, 
          locale: tr 
        });

        return (
          <div key={activity.id} className="activity-item">
            <div className={`activity-icon ${className}`}>
              {icon}
            </div>
            <div className="activity-content">
              <div className="activity-title">{activity.title}</div>
              {activity.description && (
                <div className="activity-desc">{activity.description}</div>
              )}
            </div>
            <div className="activity-time">{timeAgo}</div>
          </div>
        );
      })}
    </div>
  );
}
