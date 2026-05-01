import { useState, useEffect, useCallback } from 'react';
import apiClient, { extractData } from '../utils/api';
import './Promotions.css';

interface Offer {
  id: number;
  name: string;
  description: string;
  discount_percentage: string;
  is_active: boolean;
  image_url?: string;
  start_date: string;
  end_date: string;
}

interface PromotionSettings {
  id: number;
  is_marquee_enabled: boolean;
  marquee_speed: number;
  marquee_offers: number[];
  marquee_offers_detail: Offer[];
  is_popup_enabled: boolean;
  popup_strategy: 'single' | 'cycle_daily' | 'cycle_hourly';
  popup_offers: number[];
  popup_offers_detail: Offer[];
  updated_at: string;
}

// ── Toggle ──────────────────────────────────────────────────────────────────
const Toggle = ({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc?: string }) => (
  <div className="promo-toggle-row">
    <div className="promo-toggle-info">
      <span className="promo-toggle-label">{label}</span>
      {desc && <span className="promo-toggle-desc">{desc}</span>}
    </div>
    <label className="promo-toggle">
      <input type="checkbox" className="promo-toggle-input" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="promo-toggle-slider" />
    </label>
  </div>
);

// ── Offer Chip ───────────────────────────────────────────────────────────────
const OfferChip = ({ offer, onRemove }: { offer: Offer; onRemove: () => void }) => (
  <div className="promo-chip">
    <span className="promo-chip-badge">{parseFloat(offer.discount_percentage)}% OFF</span>
    <span className="promo-chip-name">{offer.name}</span>
    <button type="button" className="promo-chip-remove" onClick={onRemove}>&times;</button>
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────
const Promotions = () => {
  const [settings, setSettings] = useState<PromotionSettings | null>(null);
  const [allOffers, setAllOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [offerSearch, setOfferSearch] = useState('');
  const [showOfferDropdown, setShowOfferDropdown] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const r = await apiClient.get('/settings/promotions/');
      setSettings(r.data);
    } catch {
      // If no settings exist yet, bootstrap defaults
      setSettings({
        id: 1, is_marquee_enabled: false, marquee_speed: 40,
        marquee_offers: [], marquee_offers_detail: [], 
        is_popup_enabled: false, popup_strategy: 'single',
        popup_offers: [], popup_offers_detail: [],
        updated_at: ''
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOffers = useCallback(async () => {
    try {
      const r = await apiClient.get('/offers/');
      const data = extractData<Offer>(r.data);
      setAllOffers(data.filter(o => o.is_active));
    } catch {
      console.error('Failed to fetch offers');
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    fetchOffers();
  }, [fetchSettings, fetchOffers]);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await apiClient.patch('/settings/promotions/', {
        is_marquee_enabled: settings.is_marquee_enabled,
        marquee_speed: settings.marquee_speed,
        marquee_offers: settings.marquee_offers,
        is_popup_enabled: settings.is_popup_enabled,
        popup_strategy: settings.popup_strategy,
        popup_offers: settings.popup_offers,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Failed to save promotion settings', err);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addOffer = (offer: Offer) => {
    if (!settings) return;
    if (settings.marquee_offers.includes(offer.id)) return;
    setSettings(prev => prev ? ({
      ...prev,
      marquee_offers: [...prev.marquee_offers, offer.id],
      marquee_offers_detail: [...prev.marquee_offers_detail, offer],
    }) : prev);
    setOfferSearch('');
    setShowOfferDropdown(false);
  };

  const removeOffer = (offerId: number) => {
    if (!settings) return;
    setSettings(prev => prev ? ({
      ...prev,
      marquee_offers: prev.marquee_offers.filter(id => id !== offerId),
      marquee_offers_detail: prev.marquee_offers_detail.filter(o => o.id !== offerId),
    }) : prev);
  };

  const addPopupOffer = (offer: Offer) => {
    if (!settings) return;
    if (settings.popup_offers.includes(offer.id)) return;
    setSettings(prev => prev ? ({
      ...prev,
      popup_offers: [...prev.popup_offers, offer.id],
      popup_offers_detail: [...prev.popup_offers_detail, offer],
    }) : prev);
    setOfferSearch('');
    setShowOfferDropdown(false);
  };

  const removePopupOffer = (offerId: number) => {
    if (!settings) return;
    setSettings(prev => prev ? ({
      ...prev,
      popup_offers: prev.popup_offers.filter(id => id !== offerId),
      popup_offers_detail: prev.popup_offers_detail.filter(o => o.id !== offerId),
    }) : prev);
  };

  const filteredOffers = allOffers.filter(o =>
    !settings?.marquee_offers.includes(o.id) &&
    o.name.toLowerCase().includes(offerSearch.toLowerCase())
  );
  
  const filteredPopupOffers = allOffers.filter(o =>
    !settings?.popup_offers.includes(o.id) &&
    o.name.toLowerCase().includes(offerSearch.toLowerCase())
  );

  if (loading) {
    return <div className="cat-loading"><div className="cat-spinner" /><span>Loading…</span></div>;
  }

  if (!settings) return null;

  return (
    <div className="cat-page animate-fadeIn">
      {/* Header */}
      <div className="cat-header">
        <div className="cat-header-left">
          <h1 className="cat-title">Promotions & Extras</h1>
        </div>
        <div className="cat-header-actions">
          <button
            className="btn-add-cat"
            onClick={handleSave}
            disabled={saving}
            style={{ minWidth: 120 }}
          >
            {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="promo-cards">
        {/* Marquee Card */}
        <div className="promo-card">
          <div className="promo-card-header">
            <div className="promo-card-icon promo-icon-gamma">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <div>
              <div className="promo-card-title">Top Offer Marquee / Ticker</div>
              <div className="promo-card-subtitle">A scrolling banner displayed globally above the navigation bar</div>
            </div>
          </div>
          <div className="promo-card-body">
            <Toggle checked={settings.is_marquee_enabled} onChange={v => setSettings(prev => prev ? { ...prev, is_marquee_enabled: v } : prev)} label="Enable Top Marquee" desc="Show the scrolling offer ticker to all visitors" />
            <div className="cat-form-group">
              <label className="cat-form-label">Scroll Speed</label>
              <div className="promo-range-row">
                <input type="range" min={15} max={80} step={5} value={settings.marquee_speed}
                  onChange={e => setSettings(prev => prev ? { ...prev, marquee_speed: parseInt(e.target.value) } : prev)}
                  className="promo-range" />
                <span className="promo-range-val">{settings.marquee_speed}s cycle</span>
              </div>
              <span className="cat-form-hint">Lower value = faster scroll. Recommended: 30–50s</span>
            </div>
            <div className="cat-form-group">
              <label className="cat-form-label">Offers to Display</label>
              {settings.marquee_offers_detail.length > 0 && (
                <div className="promo-chips">
                  {settings.marquee_offers_detail.map(offer => (
                    <OfferChip key={offer.id} offer={offer} onRemove={() => removeOffer(offer.id)} />
                  ))}
                </div>
              )}
              <div className="promo-search-wrap">
                <svg className="promo-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input className="cat-form-input promo-search-input" type="text" placeholder="Search and add active offers…"
                  value={offerSearch}
                  onChange={e => { setOfferSearch(e.target.value); setShowOfferDropdown(true); }}
                  onFocus={() => setShowOfferDropdown(true)}
                  onBlur={() => setTimeout(() => setShowOfferDropdown(false), 200)} />
                {showOfferDropdown && filteredOffers.length > 0 && (
                  <div className="promo-dropdown">
                    {filteredOffers.map(offer => (
                      <button key={offer.id} type="button" className="promo-dropdown-item" onMouseDown={() => addOffer(offer)}>
                        <span className="promo-dropdown-badge">{parseFloat(offer.discount_percentage)}% OFF</span>
                        <div>
                          <div className="promo-dropdown-name">{offer.name}</div>
                          <div className="promo-dropdown-desc">{offer.description?.slice(0, 60)}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {showOfferDropdown && offerSearch && filteredOffers.length === 0 && (
                  <div className="promo-dropdown promo-dropdown-empty">No matching active offers found</div>
                )}
              </div>
              <span className="cat-form-hint">Only active offers are shown. Changes take effect after saving.</span>
            </div>
            {settings.is_marquee_enabled && settings.marquee_offers_detail.length > 0 && (
              <div className="promo-preview">
                <div className="promo-preview-label">Preview</div>
                <div className="promo-preview-bar">
                  {settings.marquee_offers_detail.map(o => (
                    <span key={o.id} className="promo-preview-item">
                      <span className="promo-preview-badge">{parseFloat(o.discount_percentage)}% OFF</span>
                      {o.name}
                      <span className="promo-preview-sep">✦</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Popup Card */}
        <div className="promo-card">
          <div className="promo-card-header">
            <div className="promo-card-icon promo-icon-beta">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
            </div>
            <div>
              <div className="promo-card-title">Welcome Offer Pop-up</div>
              <div className="promo-card-subtitle">A modal displayed to first-time visitors</div>
            </div>
          </div>
          <div className="promo-card-body">
            <Toggle checked={settings.is_popup_enabled} onChange={v => setSettings(prev => prev ? { ...prev, is_popup_enabled: v } : prev)} label="Enable Welcome Pop-up" desc="Show the welcome modal to new visitors" />
            <div className="cat-form-group">
              <label className="cat-form-label">Cycling Strategy</label>
              <select className="cat-form-input" value={settings.popup_strategy}
                onChange={e => setSettings(prev => prev ? { ...prev, popup_strategy: e.target.value as any } : prev)}>
                <option value="single">Single Offer</option>
                <option value="cycle_daily">Cycle Daily</option>
                <option value="cycle_hourly">Cycle Hourly</option>
              </select>
              <span className="cat-form-hint">How to cycle through multiple popup offers.</span>
            </div>
            <div className="cat-form-group">
              <label className="cat-form-label">Offers to Display</label>
              {settings.popup_offers_detail.length > 0 && (
                <div className="promo-chips">
                  {settings.popup_offers_detail.map(offer => (
                    <OfferChip key={offer.id} offer={offer} onRemove={() => removePopupOffer(offer.id)} />
                  ))}
                </div>
              )}
              <div className="promo-search-wrap">
                <svg className="promo-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input className="cat-form-input promo-search-input" type="text" placeholder="Search and add active offers…"
                  value={offerSearch}
                  onChange={e => { setOfferSearch(e.target.value); setShowOfferDropdown(true); }}
                  onFocus={() => setShowOfferDropdown(true)}
                  onBlur={() => setTimeout(() => setShowOfferDropdown(false), 200)} />
                {showOfferDropdown && filteredPopupOffers.length > 0 && (
                  <div className="promo-dropdown">
                    {filteredPopupOffers.map(offer => (
                      <button key={offer.id} type="button" className="promo-dropdown-item" onMouseDown={() => addPopupOffer(offer)}>
                        <span className="promo-dropdown-badge">{parseFloat(offer.discount_percentage)}% OFF</span>
                        <div>
                          <div className="promo-dropdown-name">{offer.name}</div>
                          <div className="promo-dropdown-desc">{offer.description?.slice(0, 60)}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {showOfferDropdown && offerSearch && filteredPopupOffers.length === 0 && (
                  <div className="promo-dropdown promo-dropdown-empty">No matching active offers found</div>
                )}
              </div>
              <span className="cat-form-hint">Only active offers are shown. Changes take effect after saving.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Promotions;
