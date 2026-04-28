import { useState, useEffect } from 'react';
import apiClient, { extractData } from '../utils/api';
import './ShopByRoom.css';

const ROOM_OPTIONS = [
  { id: 'living',   label: 'Living Room',  icon: '🛋️',  color: 'var(--color-beta)' },
  { id: 'bedroom',  label: 'Bedroom',      icon: '🛏️',  color: 'var(--color-alpha)' },
  { id: 'dining',   label: 'Dining Room',  icon: '🍽️',  color: 'var(--color-gamma)' },
  { id: 'office',   label: 'Home Office',  icon: '💼',  color: 'var(--color-delta)' },
];

type AddMode = 'individual' | 'category' | 'subcategory';

export default function ShopByRoom() {
  const [rooms, setRooms]               = useState<any[]>([]);
  const [categories, setCategories]     = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [products, setProducts]         = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [searchProducts, setSearchProducts] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [addMode, setAddMode]           = useState<AddMode>('individual');
  const [selectedProductIds, setSelectedProductIds]       = useState<number[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds]     = useState<number[]>([]);
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<number[]>([]);
  const [submitting, setSubmitting]     = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [roomsR, catsR, subR, prodsR] = await Promise.all([
        apiClient.get('/shop-by-rooms/'),
        apiClient.get('/categories/'),
        apiClient.get('/subcategories/'),
        apiClient.get('/products/?page_size=1000'),
      ]);
      setRooms(extractData(roomsR.data));
      setCategories(extractData(catsR.data));
      setSubcategories(extractData(subR.data));
      setProducts(extractData(prodsR.data));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const createRoom = async (room_type: string) => {
    try { await apiClient.post('/shop-by-rooms/', { room_type, is_active: true, products: [] }); loadData(); }
    catch { alert('Failed to enable room. It may already exist.'); }
  };

  const openModal = (id: number) => {
    setSelectedRoomId(id); setIsModalOpen(true);
    setSelectedProductIds([]); setSelectedCategoryIds([]); setSelectedSubcategoryIds([]);
    setSearchProducts(''); setAddMode('individual');
  };

  const toggle = (id: number, list: number[], setList: (a: number[]) => void) =>
    setList(list.includes(id) ? list.filter(x => x !== id) : [...list, id]);

  const handleAdd = async () => {
    if (!selectedRoomId) return;
    setSubmitting(true);
    try {
      const room = rooms.find(r => r.id === selectedRoomId);
      const current = room?.products?.map((p: any) => p.id) || [];
      let toAdd: number[] = [];

      if (addMode === 'individual') toAdd = [...selectedProductIds];
      else if (addMode === 'category' && selectedCategoryIds.length > 0) {
        const rs = await Promise.all(selectedCategoryIds.map(id => apiClient.get(`/products/?category=${id}&page_size=1000`)));
        rs.forEach(r => toAdd.push(...extractData<any>(r.data).map((p: any) => p.id)));
      } else if (addMode === 'subcategory' && selectedSubcategoryIds.length > 0) {
        const rs = await Promise.all(selectedSubcategoryIds.map(id => apiClient.get(`/products/?subcategory=${id}&page_size=1000`)));
        rs.forEach(r => toAdd.push(...extractData<any>(r.data).map((p: any) => p.id)));
      }

      if (!toAdd.length) { alert('No selections made.'); setSubmitting(false); return; }
      await apiClient.patch(`/shop-by-rooms/${selectedRoomId}/`, { product_ids: Array.from(new Set([...current, ...toAdd])) });
      setIsModalOpen(false); loadData();
    } catch { alert('Failed to add products.'); }
    finally { setSubmitting(false); }
  };

  const removeProduct = async (roomId: number, pid: number) => {
    if (!window.confirm('Remove this product from the room?')) return;
    try {
      const room = rooms.find(r => r.id === roomId);
      const ids = room.products.map((p: any) => p.id).filter((id: number) => id !== pid);
      await apiClient.patch(`/shop-by-rooms/${roomId}/`, { product_ids: ids });
      loadData();
    } catch { alert('Failed to remove product.'); }
  };

  const filteredProducts = products.filter(p =>
    !searchProducts || p.name.toLowerCase().includes(searchProducts.toLowerCase())
  );

  const selectedRoom = rooms.find(r => r.id === selectedRoomId);
  const selectionCount = addMode === 'individual' ? selectedProductIds.length
    : addMode === 'category' ? selectedCategoryIds.length
    : selectedSubcategoryIds.length;

  if (loading) return (
    <div className="sbr-page"><div className="sbr-loading"><div className="sbr-spinner" /><span>Loading rooms…</span></div></div>
  );

  return (
    <div className="sbr-page animate-fadeIn">
      <div className="sbr-header">
        <div>
          <h1 className="sbr-title">Shop By Room</h1>
          <p className="sbr-subtitle">Curate products for the homepage room slider</p>
        </div>
      </div>

      <div className="sbr-grid">
        {ROOM_OPTIONS.map(opt => {
          const room = rooms.find(r => r.room_type === opt.id);
          const count = room?.products?.length || 0;
          return (
            <div key={opt.id} className="sbr-card" style={{ '--room-color': opt.color } as any}>
              <div className="sbr-card-header">
                <div className="sbr-card-icon">{opt.icon}</div>
                <div className="sbr-card-info">
                  <h2 className="sbr-card-title">{opt.label}</h2>
                  {room && <span className="sbr-card-count">{count} products</span>}
                </div>
                {room ? (
                  <button className="sbr-btn-add" onClick={() => openModal(room.id)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Add Products
                  </button>
                ) : (
                  <button className="sbr-btn-enable" onClick={() => createRoom(opt.id)}>
                    Enable Room
                  </button>
                )}
              </div>

              {room && count > 0 && (
                <div className="sbr-products">
                  {room.products.map((p: any) => (
                    <div key={p.id} className="sbr-product-chip">
                      <span className="sbr-product-name">{p.name}</span>
                      <button className="sbr-product-remove" onClick={() => removeProduct(room.id, p.id)} title="Remove">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {room && count === 0 && (
                <div className="sbr-empty-room">
                  <span>No products assigned yet</span>
                </div>
              )}

              {!room && (
                <div className="sbr-disabled-room">
                  <span>Room section not enabled</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="sbr-overlay" onClick={e => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
          <div className="sbr-modal">
            <div className="sbr-modal-header">
              <div>
                <h2 className="sbr-modal-title">Add Products</h2>
                <p className="sbr-modal-sub">to {ROOM_OPTIONS.find(o => o.id === selectedRoom?.room_type)?.label}</p>
              </div>
              <button className="sbr-modal-close" onClick={() => setIsModalOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="sbr-modal-body">
              {/* Mode Tabs */}
              <div className="sbr-mode-tabs">
                {(['individual', 'category', 'subcategory'] as AddMode[]).map(m => (
                  <button key={m} className={`sbr-mode-tab ${addMode === m ? 'active' : ''}`} onClick={() => setAddMode(m)}>
                    {m === 'individual' ? 'Products' : m === 'category' ? 'By Category' : 'By Subcategory'}
                  </button>
                ))}
              </div>

              {/* Search (individual only) */}
              {addMode === 'individual' && (
                <div className="sbr-search-wrap">
                  <svg className="sbr-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input className="sbr-search" type="text" placeholder="Search products…"
                    value={searchProducts} onChange={e => setSearchProducts(e.target.value)} />
                </div>
              )}

              {/* Selection count */}
              {selectionCount > 0 && (
                <div className="sbr-selection-info">
                  {selectionCount} {addMode === 'individual' ? 'product' : addMode === 'category' ? 'categor' + (selectionCount > 1 ? 'ies' : 'y') : 'subcategor' + (selectionCount > 1 ? 'ies' : 'y')} selected
                </div>
              )}

              {/* List */}
              <div className="sbr-list">
                {addMode === 'individual' && filteredProducts.map(p => (
                  <label key={p.id} className={`sbr-item ${selectedProductIds.includes(p.id) ? 'selected' : ''}`}>
                    <input type="checkbox" checked={selectedProductIds.includes(p.id)}
                      onChange={() => toggle(p.id, selectedProductIds, setSelectedProductIds)} />
                    <span className="sbr-item-name">{p.name}</span>
                    {p.sku && <span className="sbr-item-meta">{p.sku}</span>}
                  </label>
                ))}
                {addMode === 'category' && categories.map(c => (
                  <label key={c.id} className={`sbr-item ${selectedCategoryIds.includes(c.id) ? 'selected' : ''}`}>
                    <input type="checkbox" checked={selectedCategoryIds.includes(c.id)}
                      onChange={() => toggle(c.id, selectedCategoryIds, setSelectedCategoryIds)} />
                    <span className="sbr-item-name">{c.name}</span>
                    {c.product_count !== undefined && <span className="sbr-item-meta">{c.product_count} products</span>}
                  </label>
                ))}
                {addMode === 'subcategory' && subcategories.map(s => (
                  <label key={s.id} className={`sbr-item ${selectedSubcategoryIds.includes(s.id) ? 'selected' : ''}`}>
                    <input type="checkbox" checked={selectedSubcategoryIds.includes(s.id)}
                      onChange={() => toggle(s.id, selectedSubcategoryIds, setSelectedSubcategoryIds)} />
                    <span className="sbr-item-name">{s.name}</span>
                    <span className="sbr-item-meta">{s.category_name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="sbr-modal-footer">
              <button className="sbr-btn-cancel" onClick={() => setIsModalOpen(false)} disabled={submitting}>Cancel</button>
              <button className="sbr-btn-confirm" onClick={handleAdd} disabled={submitting || selectionCount === 0}>
                {submitting ? 'Adding…' : `Add ${selectionCount > 0 ? selectionCount : ''} to Room`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
