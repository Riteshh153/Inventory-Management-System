import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Edit2,
  Trash2,
  RefreshCw,
  PackageX
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import StatusBadge from '../components/common/StatusBadge';
import ProductModal from '../components/modals/ProductModal';
import StockAdjustModal from '../components/modals/StockAdjustModal';

export default function ProductsPage() {
  const { products, categories, deleteProduct, globalSearch } = useInventory();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [productToAdjust, setProductToAdjust] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  // Combine local search and global search
  const effectiveSearch = (searchTerm || globalSearch).toLowerCase().trim();

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(effectiveSearch) ||
        p.sku.toLowerCase().includes(effectiveSearch) ||
        (p.location && p.location.toLowerCase().includes(effectiveSearch));
      const matchesCategory =
        selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, effectiveSearch, selectedCategory]);

  return (
    <div>
      {/* Page Filter Bar */}
      <div className="page-filter-bar">
        <div className="filter-left-group">
          <div className="filter-search-box">
            <Search
              size={16}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#7C857F' }}
            />
            <input
              type="text"
              placeholder="Search by name, SKU or bin location..."
              className="topbar-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Table / Grid View Switcher */}
          <div className="view-toggle-group">
            <button
              className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <List size={18} />
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Card Grid View"
            >
              <LayoutGrid size={18} />
            </button>
          </div>

          {/* Add Product Button */}
          <button
            className="topbar-primary-btn"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Main Products Content */}
      {filteredProducts.length === 0 ? (
        <div className="dashboard-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <PackageX size={48} color="#A1ABA4" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-main)' }}>No products match your criteria</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', maxWidth: '400px', margin: '8px auto 20px' }}>
            Try clearing your search query or selecting a different category filter.
          </p>
          <button
            className="modal-btn-cancel"
            onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        <div className="dashboard-card" style={{ padding: 0 }}>
          <div className="table-responsive-container">
            <table className="stockwise-table">
              <thead>
                <tr>
                  <th>Product Details</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Selling Price</th>
                  <th>Cost</th>
                  <th>Stock Level</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{p.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Supplier: {p.supplier}</div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#3E5C4E' }}>{p.sku}</td>
                    <td>{p.category}</td>
                    <td style={{ fontWeight: 600 }}>${Number(p.price || 0).toFixed(2)}</td>
                    <td style={{ color: 'var(--color-text-muted)' }}>${Number(p.cost || 0).toFixed(2)}</td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{p.quantity} units</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>Min: {p.reorderLevel}</div>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{p.location || 'Depot'}</td>
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="table-action-btn"
                          onClick={() => setProductToAdjust(p)}
                          title="Adjust Inventory Units"
                        >
                          <RefreshCw size={13} />
                          <span>Stock</span>
                        </button>
                        <button
                          className="table-action-btn"
                          onClick={() => setProductToEdit(p)}
                          title="Edit Details"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="table-action-btn danger"
                          onClick={() => setProductToDelete(p)}
                          title="Delete Product"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card Grid View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {filteredProducts.map((p) => (
            <div key={p.id} className="dashboard-card" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg)', padding: '2px 8px', borderRadius: '4px' }}>
                  {p.sku}
                </span>
                <StatusBadge status={p.status} />
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px', lineHeight: 1.3 }}>{p.name}</h3>
              <p style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>{p.category}</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '12px', backgroundColor: 'var(--color-bg)', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>PRICE</div>
                  <div style={{ fontWeight: 700, fontSize: '15px' }}>${Number(p.price || 0).toFixed(2)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>STOCK</div>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: p.quantity === 0 ? '#B71C1C' : 'inherit' }}>{p.quantity} units</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                <button
                  className="table-action-btn"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setProductToAdjust(p)}
                >
                  <RefreshCw size={13} />
                  <span>Adjust Stock</span>
                </button>
                <button
                  className="table-action-btn"
                  onClick={() => setProductToEdit(p)}
                  title="Edit"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  className="table-action-btn danger"
                  onClick={() => setProductToDelete(p)}
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Add / Edit Modal */}
      <ProductModal
        isOpen={isAddModalOpen || !!productToEdit}
        productToEdit={productToEdit}
        onClose={() => { setIsAddModalOpen(false); setProductToEdit(null); }}
      />

      {/* Stock Adjustment Modal */}
      {productToAdjust && (
        <StockAdjustModal
          isOpen={!!productToAdjust}
          product={productToAdjust}
          onClose={() => setProductToAdjust(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="modal-overlay" onClick={() => setProductToDelete(null)} role="dialog" aria-modal="true">
          <div className="modal-container" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Confirm Deletion</h3>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '14px', color: 'var(--color-text-main)', lineHeight: 1.5 }}>
                Are you sure you want to permanently delete <strong>{productToDelete.name}</strong> ({productToDelete.sku})?
                This action will remove it from inventory calculations and catalog records.
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="modal-btn-cancel"
                onClick={() => setProductToDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="table-action-btn danger"
                style={{ height: '40px', padding: '0 16px', fontSize: '13.5px' }}
                onClick={() => {
                  deleteProduct(productToDelete.id);
                  setProductToDelete(null);
                }}
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
