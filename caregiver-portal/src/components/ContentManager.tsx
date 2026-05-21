import { useState } from 'react';
import { Plus, Edit2, Trash2, Image, Volume2, Upload } from 'lucide-react';
import type { MemoryCard } from '../types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface ContentManagerProps {
  cards: MemoryCard[];
}

export function ContentManager({ cards }: ContentManagerProps) {
  const [filter, setFilter] = useState<'all' | 'visual' | 'audio'>('all');
  
  const filteredCards = filter === 'all' 
    ? cards 
    : cards.filter(c => c.type === filter);

  return (
    <div>
      <div className="page-header">
        <h2>İçerik Yönetimi</h2>
        <p>Hafıza oyunları için fotoğraf ve ses dosyalarını yönetin</p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Tümü ({cards.length})
        </button>
        <button 
          className={`tab ${filter === 'visual' ? 'active' : ''}`}
          onClick={() => setFilter('visual')}
        >
          <Image size={16} style={{ marginRight: '6px' }} />
          Fotoğraflar ({cards.filter(c => c.type === 'visual').length})
        </button>
        <button 
          className={`tab ${filter === 'audio' ? 'active' : ''}`}
          onClick={() => setFilter('audio')}
        >
          <Volume2 size={16} style={{ marginRight: '6px' }} />
          Sesler ({cards.filter(c => c.type === 'audio').length})
        </button>
      </div>

      {/* Add Buttons */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button className="btn btn-primary">
          <Image size={18} />
          Fotoğraf Ekle
        </button>
        <button className="btn btn-secondary">
          <Volume2 size={18} />
          Ses Ekle
        </button>
      </div>

      {/* Content Grid */}
      {filteredCards.length > 0 ? (
        <div className="content-grid">
          {filteredCards.map((card) => (
            <div key={card.id} className="content-item">
              {card.type === 'visual' ? (
                <img src={card.imageUri} alt={card.correctLabel} />
              ) : (
                <div style={{
                  height: '140px',
                  background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <Volume2 size={48} />
                </div>
              )}
              
              <div className="content-item-info">
                <h4>{card.correctLabel}</h4>
                <p style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {card.type === 'visual' ? <><Image size={12} /> Fotoğraf</> : <><Volume2 size={12} /> Ses</>}
                  {card.category && ` • ${card.category}`}
                </p>
                {card.hint && (
                  <p style={{ fontStyle: 'italic', marginTop: '4px' }}>
                    İpucu: {card.hint}
                  </p>
                )}
                <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                  {format(new Date(card.createdAt), 'd MMM yyyy', { locale: tr })}
                </p>
              </div>
              
              <div className="content-item-actions">
                <button className="btn btn-sm btn-secondary">
                  <Edit2 size={14} />
                  Düzenle
                </button>
                <button className="btn btn-sm btn-secondary">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <Upload size={48} />
            <h3>İçerik Bulunamadı</h3>
            <p>Henüz {filter === 'visual' ? 'fotoğraf' : filter === 'audio' ? 'ses' : 'içerik'} eklenmemiş</p>
            <button className="btn btn-primary" style={{ marginTop: '16px' }}>
              <Plus size={18} />
              İlk İçeriği Ekle
            </button>
          </div>
        </div>
      )}

      {/* Upload Instructions */}
      <div className="card" style={{ marginTop: '24px' }}>
        <h3 className="card-title" style={{ marginBottom: '16px' }}>İçerik Ekleme Rehberi</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Image size={20} /> Fotoğraf Ekleme
            </h4>
            <ul style={{ 
              listStyle: 'none', 
              fontSize: '0.9rem', 
              color: 'var(--color-text-light)',
              lineHeight: '1.8'
            }}>
              <li>• Aile üyelerinin net fotoğraflarını kullanın</li>
              <li>• Yüzler açıkça görünür olmalı</li>
              <li>• Tanımlayıcı bir isim ve ipucu ekleyin</li>
              <li>• JPG veya PNG formatı önerilir</li>
            </ul>
          </div>
          <div>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Volume2 size={20} /> Ses Ekleme
            </h4>
            <ul style={{ 
              listStyle: 'none', 
              fontSize: '0.9rem', 
              color: 'var(--color-text-light)',
              lineHeight: '1.8'
            }}>
              <li>• Tanıdık sesleri kaydedin (aile sesleri, ev sesleri)</li>
              <li>• Ses kalitesinin iyi olduğundan emin olun</li>
              <li>• 5-10 saniye uzunluğunda sesler ideal</li>
              <li>• MP3 veya WAV formatı desteklenir</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
