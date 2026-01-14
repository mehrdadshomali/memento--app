import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import type { ActivityLog } from '../types';

interface ActivityFeedProps {
  activities: ActivityLog[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const getActivityIcon = (type: ActivityLog['type']) => {
    switch (type) {
      case 'game_played': return { icon: '🎮', className: 'game' };
      case 'routine_completed': return { icon: '✓', className: 'routine' };
      case 'location_alert': return { icon: '📍', className: 'location' };
      case 'app_opened': return { icon: '📱', className: 'app' };
      default: return { icon: '•', className: '' };
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
