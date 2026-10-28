import React, { useState, useMemo } from 'react';
import { Search, ArrowDownRight } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import StatusBadge from '../components/common/StatusBadge';
import StockAdjustModal from '../components/modals/StockAdjustModal';

export default function InventoryPage() {
  const { products, globalSearch } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const effectiveSearch = (searchTerm || globalSearch).toLowerCase().trim();

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(effectiveSearch) ||
        p.sku.toLowerCase().includes(effectiveSearch) ||
        (p.location && p.location.toLowerCase().includes(effectiveSearch));
      const matchesStatus =
        statusFilter === 'All' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [products, effectiveSearch, statusFilter]);

  const countAll = products.length;
  const countLow = products.filter((p) => p.status === 'Low Stock').length;
  const countOut = products.filter((p) => p.status === 'Out of Stock').length;

  return (
    <div>
      {/* Quick Filter Status Tabs */}
      <div className="page-filter-bar">
        <div className="filter-left-group">
          <div className="filter-search-box">
            <Search
              size={16}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#7C857F' }}
            />
            <input
              type="text"
              placeholder="Search by product, SKU, location..."
              className="topbar-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="date-range-pills">
            <button
              className={`date-pill-btn ${statusFilter === 'All' ? 'active' : ''}`}
              onClick={() => setStatusFilter('All')}
            >
              All Items ({countAll})
            </button>
            <button
              className={`date-pill-btn ${statusFilter === 'Low Stock' ? 'active' : ''}`}
              onClick={() => setStatusFilter('Low Stock')}
            >
              Low Stock ({countLow})
            </button>
            <button
              className={`date-pill-btn ${statusFilter === 'Out of Stock' ? 'active' : ''}`}
              onClick={() => setStatusFilter('Out of Stock')}
            >
              Out of Stock ({countOut})
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Stock Level Table */}
      <div className="dashboard-card" style={{ padding: 0 }}>
        <div className="table-responsive-container">
          <table className="stockwise-table">
            <thead>
              <tr>
                <th>Product & SKU</th>
                <th>Category</th>
                <th>Storage Location</th>
                <th>Current Units</th>
                <th>Safety Stock (Min)</th>
                <th>Inventory Health</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Quick Stock Adjust</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const ratio = p.reorderLevel > 0 ? (p.quantity / (p.reorderLevel * 2)) * 100 : 100;
                const progressWidth = Math.min(100, Math.max(0, ratio));

                let barColor = '#145A32';
                if (p.quantity === 0) barColor = '#B71C1C';
                else if (p.quantity <= p.reorderLevel) barColor = '#9E6200';

                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: '11.5px', fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>
                        {p.sku}
                      </div>
                    </td>
                    <td>{p.category}</td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{p.location || 'Depot'}</td>
                    <td style={{ fontWeight: 700, fontSize: '14.5px' }}>
                      {p.quantity} <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--color-text-muted)' }}>units</span>
                    </td>
                    <td>{p.reorderLevel} units</td>
                    <td style={{ minWidth: '130px' }}>
                      <div style={{ height: '6px', width: '100%', backgroundColor: '#E2E8E2', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${progressWidth}%`, backgroundColor: barColor, borderRadius: '3px' }}></div>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        {p.quantity === 0 ? 'Empty bin' : `${p.quantity > p.reorderLevel ? 'Sufficient buffer' : 'Replenish soon'}`}
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="table-action-btn"
                        onClick={() => setSelectedProduct(p)}
                      >
                        <ArrowDownRight size={13} />
                        <span>Adjust Stock</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {selectedProduct && (
        <StockAdjustModal
          isOpen={!!selectedProduct}
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
