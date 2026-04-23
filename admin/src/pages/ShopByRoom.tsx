import { useState, useEffect } from 'react';
import apiClient, { extractData } from '../utils/api';
import Modal from '../components/Modal';
import './Categories.css'; // Re-use styling

const ROOM_OPTIONS = [
  { id: 'living', label: 'Living Room' },
  { id: 'bedroom', label: 'Bedroom' },
  { id: 'dining', label: 'Dining Room' },
  { id: 'office', label: 'Home Office' }
];

export default function ShopByRoom() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]); // simplified for this UI
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [addMode, setAddMode] = useState<'individual' | 'category' | 'subcategory'>('individual');
  
  // Selection State (Multi-Select Arrays)
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Load essential lists
  const loadData = async () => {
    try {
      setLoading(true);
      const [roomsResp, catsResp, subCatsResp, prodsResp] = await Promise.all([
        apiClient.get('/shop-by-rooms/'),
        apiClient.get('/categories/'),
        apiClient.get('/subcategories/'),
        apiClient.get('/products/?page_size=1000') // fetch large list for dropdown
      ]);
      setRooms(extractData(roomsResp.data));
      setCategories(extractData(catsResp.data));
      setSubcategories(extractData(subCatsResp.data));
      setProducts(extractData(prodsResp.data));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const createRoom = async (room_type: string) => {
    try {
      await apiClient.post('/shop-by-rooms/', { room_type, is_active: true, products: [] });
      loadData();
    } catch (err) {
      alert("Failed to enable room. It may already exist.");
    }
  };

  const openAddModal = (id: number) => {
    setSelectedRoomId(id);
    setIsModalOpen(true);
    // Reset selections
    setSelectedProductIds([]);
    setSelectedCategoryIds([]);
    setSelectedSubcategoryIds([]);
  };

  const handleToggleSelection = (id: number, list: number[], setList: (newArr: number[]) => void) => {
    if (list.includes(id)) {
      setList(list.filter(item => item !== id));
    } else {
      setList([...list, id]);
    }
  };

  const handleAddProducts = async () => {
    if (!selectedRoomId) return;
    setSubmitting(true);
    
    try {
      const room = rooms.find(r => r.id === selectedRoomId);
      const currentProductIds = room?.products?.map((p: any) => p.id) || [];
      
      let idsToAdd: number[] = [];

      if (addMode === 'individual' && selectedProductIds.length > 0) {
        idsToAdd = [...selectedProductIds];
      } 
      else if (addMode === 'category' && selectedCategoryIds.length > 0) {
        const promises = selectedCategoryIds.map(catId => 
          apiClient.get('/products/?category=' + catId + '&page_size=1000')
        );
        const responses = await Promise.all(promises);
        responses.forEach(resp => {
           const catProds = extractData<any>(resp.data);
           idsToAdd.push(...catProds.map(p => p.id));
        });
      }
      else if (addMode === 'subcategory' && selectedSubcategoryIds.length > 0) {
        const promises = selectedSubcategoryIds.map(subId => 
          apiClient.get('/products/?subcategory=' + subId + '&page_size=1000')
        );
        const responses = await Promise.all(promises);
        responses.forEach(resp => {
           const subCatProds = extractData<any>(resp.data);
           idsToAdd.push(...subCatProds.map(p => p.id));
        });
      }

      if (idsToAdd.length === 0) {
        alert("No selections made or sections are empty.");
        setSubmitting(false);
        return;
      }

      // Merge and deduplicate
      const newIds = Array.from(new Set([...currentProductIds, ...idsToAdd]));

      // PATCH request
      await apiClient.patch(`/shop-by-rooms/${selectedRoomId}/`, {
        product_ids: newIds
      });

      alert(`Successfully added ${idsToAdd.length} product(s)!`);
      setIsModalOpen(false);
      loadData();

    } catch (err) {
      console.error(err);
      alert("Failed to add products.");
    } finally {
      setSubmitting(false);
    }
  };

  const removeProduct = async (roomId: number, productIdToRemove: number) => {
    if (!window.confirm("Remove this product from the room?")) return;
    try {
      const room = rooms.find(r => r.id === roomId);
      const currentIds = room.products.map((p: any) => p.id);
      const updatedIds = currentIds.filter((id: number) => id !== productIdToRemove);
      
      await apiClient.patch(`/shop-by-rooms/${roomId}/`, {
        product_ids: updatedIds
      });
      loadData();
    } catch (err) {
      alert("Failed to remove product.");
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="categories-management-container">
      <div className="page-header">
        <h1>Shop By Room - Slide Curation</h1>
        <p>Curate products for the Shop By Room slider on the homepage. You can select multiple items to bulk-assign them at once.</p>
      </div>

      <div className="grid" style={{ display: 'grid', gap: '30px' }}>
        {ROOM_OPTIONS.map(roomOpt => {
          const existingRoom = rooms.find(r => r.room_type === roomOpt.id);
          
          return (
            <div key={roomOpt.id} style={{ border: '1px solid #ddd', padding: '24px', borderRadius: '12px', background: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#333' }}>{roomOpt.label}</h2>
                {existingRoom ? (
                  <button className="btn-primary" onClick={() => openAddModal(existingRoom.id)}>
                    + Add Products
                  </button>
                ) : (
                  <button className="btn-secondary" onClick={() => createRoom(roomOpt.id)}>
                    Enable Room Section
                  </button>
                )}
              </div>
              
              {existingRoom && (
                <div>
                  <p style={{ color: '#666', marginBottom: '15px' }}>
                    <b>{existingRoom.products?.length || 0}</b> Products assigned
                  </p>
                  
                  {existingRoom.products?.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                      {existingRoom.products.map((p: any) => (
                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', padding: '8px', border: '1px solid #eee', borderRadius: '6px', fontSize: '13px' }}>
                          <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                          <button 
                            onClick={() => removeProduct(existingRoom.id, p.id)}
                            style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', marginLeft: '10px' }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Products Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Products to Room"
      >
        <div className="collection-form" style={{ minWidth: '400px', maxWidth: '600px' }}>
          
          <div className="form-group">
            <label>Add Method</label>
            <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                <input type="radio" value="individual" checked={addMode === 'individual'} onChange={() => setAddMode('individual')} />
                Individual Products
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                <input type="radio" value="category" checked={addMode === 'category'} onChange={() => setAddMode('category')} />
                By Categories
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                <input type="radio" value="subcategory" checked={addMode === 'subcategory'} onChange={() => setAddMode('subcategory')} />
                By Subcategories
              </label>
            </div>
          </div>

          <div style={{ maxHeight: '350px', overflowY: 'auto', border: '1px solid #eee', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
            {addMode === 'individual' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#666' }}>Select one or multiple products to assign:</p>
                {products.map(p => (
                  <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedProductIds.includes(p.id)}
                      onChange={() => handleToggleSelection(p.id, selectedProductIds, setSelectedProductIds)}
                    />
                    {p.name} <span style={{ color: '#999', fontSize: '12px' }}>({p.sku || p.id})</span>
                  </label>
                ))}
              </div>
            )}

            {addMode === 'category' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#666' }}>Select one or multiple categories to bulk-assign:</p>
                {categories.map(c => (
                  <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedCategoryIds.includes(c.id)}
                      onChange={() => handleToggleSelection(c.id, selectedCategoryIds, setSelectedCategoryIds)}
                    />
                    {c.name}
                  </label>
                ))}
              </div>
            )}

            {addMode === 'subcategory' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#666' }}>Select one or multiple subcategories to bulk-assign:</p>
                {subcategories.map(s => (
                  <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedSubcategoryIds.includes(s.id)}
                      onChange={() => handleToggleSelection(s.id, selectedSubcategoryIds, setSelectedSubcategoryIds)}
                    />
                    {s.name} <span style={{ color: '#999', fontSize: '12px' }}>({s.category_name})</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions" style={{ marginTop: '30px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn-primary" 
              onClick={handleAddProducts} 
              disabled={submitting}
            >
              {submitting ? 'Applying Multiple...' : 'Confirm Assignments'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
