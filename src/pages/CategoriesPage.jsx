import React, { useState } from 'react';
import { Plus, Tags, Edit2, Trash2, X, Check } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export default function CategoriesPage() {
  const { categories, addCategory, updateCategory, deleteCategory } = useInventory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setCode('');
    setDescription('');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setCode(cat.code || '');
    setDescription(cat.description || '');
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }

    if (editingCategory) {
      updateCategory({ ...editingCategory, name, code, description });
    } else {
      addCategory({ name, code: code || name.slice(0, 3).toUpperCase(), description });
    }
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="page-filter-bar">
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Department Categories</h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Organize products, manage taxonomy, and review department inventories
          </p>
        </div>

        <button className="topbar-primary-btn" onClick={openAddModal}>
          <Plus size={16} strokeWidth={2.5} />
          <span>Add Category</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {categories.map((cat) => (
          <div key={cat.id} className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="kpi-icon-wrap">
                    <Tags size={16} />
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'monospace', color: 'var(--color-primary-light)' }}>
                    [{cat.code || 'CAT'}]
                  </span>
                </div>
                <span className="status-badge active">
                  {cat.productCount} product{cat.productCount === 1 ? '' : 's'}
                </span>
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>{cat.name}</h3>
              <p style={{ fontSize: '13.5px', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: '18px' }}>
                {cat.description || 'No description provided for this department category.'}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '14px' }}>
              <button
                className="table-action-btn"
                onClick={() => openEditModal(cat)}
              >
                <Edit2 size={13} />
                <span>Edit</span>
              </button>
              <button
                className="table-action-btn danger"
                onClick={() => deleteCategory(cat.id)}
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)} role="dialog" aria-modal="true">
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="modal-form-group">
                  <label className="modal-form-label">Category Name *</label>
                  <input
                    type="text"
                    className="modal-form-input"
                    placeholder="e.g. Smart Electronics"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  {error && <span style={{ color: '#D32F2F', fontSize: '12px' }}>{error}</span>}
                </div>

                <div className="modal-form-group">
                  <label className="modal-form-label">Department Code</label>
                  <input
                    type="text"
                    className="modal-form-input"
                    placeholder="e.g. ELEC"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                  />
                </div>

                <div className="modal-form-group">
                  <label className="modal-form-label">Description</label>
                  <textarea
                    className="modal-form-textarea"
                    placeholder="Brief description of products within this category..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="modal-btn-cancel" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="modal-btn-submit">
                  <Check size={16} />
                  <span>{editingCategory ? 'Save Changes' : 'Create Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
