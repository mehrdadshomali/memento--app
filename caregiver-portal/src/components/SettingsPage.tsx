import { Bell, Shield, Globe, Moon, HelpCircle, BookOpen, MessageCircleQuestion, Mail } from 'lucide-react';

export function SettingsPage() {
  return (
    <div>
      <div className="page-header">
        <h2>Ayarlar</h2>
        <p>Uygulama ve bildirim ayarlarını yönetin</p>
      </div>

      {/* Notification Settings */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">
            <Bell size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Bildirim Ayarları
          </h3>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ fontWeight: 500, marginBottom: '4px' }}>Konum Uyarıları</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Hasta evden ayrıldığında bildirim al
              </p>
            </div>
            <label className="toggle">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider"></span>
            </label>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ fontWeight: 500, marginBottom: '4px' }}>Rutin Hatırlatmaları</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Kaçırılan rutinler için bildirim al
              </p>
            </div>
            <label className="toggle">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider"></span>
            </label>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ fontWeight: 500, marginBottom: '4px' }}>Günlük Özet</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Her gün aktivite özeti al
              </p>
            </div>
            <label className="toggle">
              <input type="checkbox" />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">
            <Shield size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Güvenlik
          </h3>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ fontWeight: 500, marginBottom: '4px' }}>İki Faktörlü Doğrulama</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Hesap güvenliğini artırın
              </p>
            </div>
            <button className="btn btn-secondary btn-sm">Etkinleştir</button>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ fontWeight: 500, marginBottom: '4px' }}>Şifre Değiştir</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Hesap şifrenizi güncelleyin
              </p>
            </div>
            <button className="btn btn-secondary btn-sm">Değiştir</button>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">
            <Moon size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Görünüm
          </h3>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ fontWeight: 500, marginBottom: '4px' }}>Karanlık Mod</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Koyu tema kullan
            </p>
          </div>
          <label className="toggle">
            <input type="checkbox" />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      {/* Language */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">
            <Globe size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Dil
          </h3>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary">Türkçe</button>
          <button className="btn btn-secondary">English</button>
        </div>
      </div>

      {/* Help */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <HelpCircle size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Yardım & Destek
          </h3>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <a href="#" style={{ 
            color: 'var(--color-primary)', 
            textDecoration: 'none',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <BookOpen size={16} /> Kullanım Kılavuzu
          </a>
          <a href="#" style={{ 
            color: 'var(--color-primary)', 
            textDecoration: 'none',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <MessageCircleQuestion size={16} /> Sık Sorulan Sorular
          </a>
          <a href="#" style={{ 
            color: 'var(--color-primary)', 
            textDecoration: 'none',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Mail size={16} /> Destek ile İletişim
          </a>
        </div>
        
        <div style={{ 
          marginTop: '24px', 
          padding: '16px', 
          background: 'var(--color-surface-alt)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.85rem',
          color: 'var(--color-text-muted)'
        }}>
          <p>Memento Bakıcı Paneli v1.0.0</p>
          <p style={{ marginTop: '4px' }}>© 2024 Memento. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </div>
  );
}
