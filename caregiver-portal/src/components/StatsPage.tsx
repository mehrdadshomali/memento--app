import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import type { DailyStats, ActivityLog } from '../types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface StatsPageProps {
  stats: DailyStats[];
  activities: ActivityLog[];
}

const COLORS = ['#8B7355', '#81C784', '#FFB74D', '#64B5F6'];

export function StatsPage({ stats, activities }: StatsPageProps) {
  // Format data for charts
  const chartData = stats.map(s => ({
    ...s,
    date: format(new Date(s.date), 'd MMM', { locale: tr }),
    completionRate: Math.round((s.routinesCompleted / s.totalRoutines) * 100),
  }));

  // Activity type distribution
  const activityTypes = activities.reduce((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = [
    { name: 'Oyun', value: activityTypes['game_played'] || 0 },
    { name: 'Rutin', value: activityTypes['routine_completed'] || 0 },
    { name: 'Konum', value: activityTypes['location_alert'] || 0 },
    { name: 'Uygulama', value: activityTypes['app_opened'] || 0 },
  ];

  // Calculate averages
  const avgGames = Math.round(stats.reduce((sum, s) => sum + s.gamesPlayed, 0) / stats.length);
  const avgRoutines = Math.round(stats.reduce((sum, s) => sum + s.routinesCompleted, 0) / stats.length);
  const avgTime = Math.round(stats.reduce((sum, s) => sum + s.timeSpentMinutes, 0) / stats.length);
  const avgCompletion = Math.round(
    stats.reduce((sum, s) => sum + (s.routinesCompleted / s.totalRoutines) * 100, 0) / stats.length
  );

  return (
    <div>
      <div className="page-header">
        <h2>İstatistikler</h2>
        <p>Son 7 günlük aktivite ve performans verileri</p>
      </div>

      {/* Summary Stats */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon primary">🎮</div>
          <div className="stat-value">{avgGames}</div>
          <div className="stat-label">Ort. Günlük Oyun</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success">✓</div>
          <div className="stat-value">{avgRoutines}</div>
          <div className="stat-label">Ort. Günlük Rutin</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon warning">⏱</div>
          <div className="stat-value">{avgTime} dk</div>
          <div className="stat-label">Ort. Kullanım Süresi</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon info">📊</div>
          <div className="stat-value">%{avgCompletion}</div>
          <div className="stat-label">Ort. Tamamlanma</div>
        </div>
      </div>

      {/* Charts */}
      <div className="two-column">
        {/* Games & Routines Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Günlük Aktivite</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E4E0" />
                <XAxis dataKey="date" stroke="#9B9B9B" fontSize={12} />
                <YAxis stroke="#9B9B9B" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    background: '#fff', 
                    border: '1px solid #E8E4E0',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="gamesPlayed" name="Oyun" fill="#8B7355" radius={[4, 4, 0, 0]} />
                <Bar dataKey="routinesCompleted" name="Rutin" fill="#81C784" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Distribution */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Aktivite Dağılımı</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Completion Rate Trend */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">Rutin Tamamlanma Oranı Trendi</h3>
        </div>
        <div className="chart-container" style={{ height: '200px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E4E0" />
              <XAxis dataKey="date" stroke="#9B9B9B" fontSize={12} />
              <YAxis stroke="#9B9B9B" fontSize={12} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ 
                  background: '#fff', 
                  border: '1px solid #E8E4E0',
                  borderRadius: '8px'
                }}
                formatter={(value) => [`%${value}`, 'Tamamlanma']}
              />
              <Line 
                type="monotone" 
                dataKey="completionRate" 
                stroke="#8B7355" 
                strokeWidth={2}
                dot={{ fill: '#8B7355', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Time Spent */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">Uygulama Kullanım Süresi (dakika)</h3>
        </div>
        <div className="chart-container" style={{ height: '200px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E4E0" />
              <XAxis dataKey="date" stroke="#9B9B9B" fontSize={12} />
              <YAxis stroke="#9B9B9B" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  background: '#fff', 
                  border: '1px solid #E8E4E0',
                  borderRadius: '8px'
                }}
                formatter={(value) => [`${value} dk`, 'Süre']}
              />
              <Bar dataKey="timeSpentMinutes" fill="#64B5F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
