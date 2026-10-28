import React, { useState, useEffect } from 'react';
import {
  Package,
  Boxes,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  AlertOctagon,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useInventory } from '../context/InventoryContext';
import StatCard from '../components/common/StatCard';
import StatusBadge from '../components/common/StatusBadge';
import StockAdjustModal from '../components/modals/StockAdjustModal';
import { chartDataRanges, categoryBreakdownData as defaultCategoryData } from '../data/mockData';
import { dashboardApi } from '../api/dashboard';

export default function DashboardOverview({ setActivePage }) {
  const { kpis, products, sales, settings } = useInventory();
  const [dateRange, setDateRange] = useState('7days');
  const [selectedProductForRestock, setSelectedProductForRestock] = useState(null);
  const [currentChartData, setCurrentChartData] = useState(chartDataRanges['7days']);
  const [categoryBreakdownData, setCategoryBreakdownData] = useState(defaultCategoryData);

  useEffect(() => {
    dashboardApi.getSalesTrend(dateRange)
      .then((res) => {
        if (res.data && Array.isArray(res.data)) {
          setCurrentChartData(res.data);
        }
      })
      .catch(() => {
        setCurrentChartData(chartDataRanges[dateRange] || chartDataRanges['7days']);
      });
  }, [dateRange]);

  useEffect(() => {
    dashboardApi.getCategoriesBreakdown()
      .then((res) => {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setCategoryBreakdownData(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const lowStockItems = (products || [])
    .filter((p) => Number(p.quantity) <= Number(p.reorderLevel))
    .slice(0, 5);

  const recentTransactions = (sales || []).slice(0, 5);

  return (
    <div>
      {/* ====================================================================
          1. 6 KPI CARDS DISPLAY
          ==================================================================== */}
      <div className="kpi-cards-grid">
        <StatCard
          title="Total Products"
          value={kpis.totalProducts}
          description="Catalog items"
          icon={Package}
          trend="+12%"
          trendType="positive"
        />

        <StatCard
          title="Inventory Units"
          value={kpis.totalUnits.toLocaleString()}
          description="In warehouse"
          icon={Boxes}
          trend="+8.4%"
          trendType="positive"
        />

        <StatCard
          title="Inventory Value"
          value={`${settings.currencySymbol}${kpis.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          description="At current prices"
          icon={DollarSign}
          trend="+14.2%"
          trendType="positive"
        />

        <StatCard
          title="Today's Sales"
          value={`${settings.currencySymbol}${kpis.todaySalesAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          description="Recorded today"
          icon={TrendingUp}
          trend="+18.5%"
          trendType="positive"
        />

        <StatCard
          title="Low Stock Items"
          value={kpis.lowStockCount}
          description="Below reorder point"
          icon={AlertTriangle}
          variant={kpis.lowStockCount > 0 ? 'warning' : 'default'}
          trend={kpis.lowStockCount > 0 ? `${kpis.lowStockCount} items` : 'Normal'}
          trendType={kpis.lowStockCount > 0 ? 'negative' : 'positive'}
        />

        <StatCard
          title="Out of Stock"
          value={kpis.outOfStockCount}
          description="Immediate attention"
          icon={AlertOctagon}
          variant={kpis.outOfStockCount > 0 ? 'danger' : 'default'}
          trend={kpis.outOfStockCount > 0 ? 'Action needed' : 'Optimal'}
          trendType={kpis.outOfStockCount > 0 ? 'negative' : 'positive'}
        />
      </div>

      {/* ====================================================================
          2. ANALYTICS CHARTS SECTION
          ==================================================================== */}
      <div className="charts-grid">
        {/* Sales & Revenue Trend Chart */}
        <div className="dashboard-card">
          <div className="card-header-row">
            <div>
              <h2 className="card-heading">Sales & Revenue Performance</h2>
              <p className="card-subheading">Track gross revenue and order volumes over time</p>
            </div>

            {/* Date-Range Selector */}
            <div className="date-range-pills" role="tablist" aria-label="Select Date Range">
              <button
                className={`date-pill-btn ${dateRange === '7days' ? 'active' : ''}`}
                onClick={() => setDateRange('7days')}
              >
                Last 7 Days
              </button>
              <button
                className={`date-pill-btn ${dateRange === '30days' ? 'active' : ''}`}
                onClick={() => setDateRange('30days')}
              >
                Last 30 Days
              </button>
              <button
                className={`date-pill-btn ${dateRange === 'year' ? 'active' : ''}`}
                onClick={() => setDateRange('year')}
              >
                This Year
              </button>
            </div>
          </div>

          <div style={{ width: '100%', height: 230 }}>
            <ResponsiveContainer>
              <AreaChart data={currentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#173D32" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#173D32" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5B8C70" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#5B8C70" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8EFEA" />
                <XAxis dataKey="name" stroke="#8CAFA0" fontSize={12} tickLine={false} />
                <YAxis stroke="#8CAFA0" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #E2E8E2',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#173D32" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" name="Revenue ($)" />
                <Area type="monotone" dataKey="sales" stroke="#5B8C70" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Gross Sales ($)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory Value by Category Donut Chart */}
        <div className="dashboard-card">
          <div className="card-header-row">
            <div>
              <h2 className="card-heading">Stock Value by Category</h2>
              <p className="card-subheading">Valuation breakdown across departments</p>
            </div>
          </div>

          <div style={{ width: '100%', height: 230 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={categoryBreakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Valuation']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #E2E8E2'
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ====================================================================
          3. LOW STOCK ALERTS & RECENT TRANSACTIONS
          ==================================================================== */}
      <div className="dashboard-bottom-grid">
        {/* Low Stock Alerts Table */}
        <div className="dashboard-card">
          <div className="card-header-row">
            <div>
              <h2 className="card-heading" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} color="#9E6200" />
                <span>Low Stock & Reorder Alerts</span>
              </h2>
              <p className="card-subheading">Items requiring urgent replenishment</p>
            </div>
            <button
              className="table-action-btn"
              onClick={() => setActivePage('inventory')}
              style={{ fontSize: '12px' }}
            >
              <span>View All Inventory</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="table-responsive-container">
            <table className="stockwise-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Available</th>
                  <th>Reorder Point</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>
                      All product stock levels are currently healthy!
                    </td>
                  </tr>
                ) : (
                  lowStockItems.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600 }}>{item.name}</td>
                      <td style={{ color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>{item.sku}</td>
                      <td style={{ fontWeight: 700, color: item.quantity === 0 ? '#B71C1C' : '#9E6200' }}>
                        {item.quantity} units
                      </td>
                      <td>{item.reorderLevel} units</td>
                      <td>
                        <StatusBadge status={item.status} />
                      </td>
                      <td>
                        <button
                          className="table-action-btn"
                          onClick={() => setSelectedProductForRestock(item)}
                          title="Quick Restock"
                        >
                          <RefreshCw size={12} />
                          <span>Restock</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="dashboard-card">
          <div className="card-header-row">
            <div>
              <h2 className="card-heading">Recent Transactions</h2>
              <p className="card-subheading">Latest processed customer orders</p>
            </div>
            <button
              className="table-action-btn"
              onClick={() => setActivePage('sales')}
              style={{ fontSize: '12px' }}
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="table-responsive-container">
            <table className="stockwise-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{tx.id}</td>
                    <td>{tx.customer}</td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '12.5px' }}>{tx.date}</td>
                    <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                      ${Number(tx.totalAmount || 0).toFixed(2)}
                    </td>
                    <td>
                      <StatusBadge status={tx.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Restock Modal */}
      {selectedProductForRestock && (
        <StockAdjustModal
          isOpen={!!selectedProductForRestock}
          product={selectedProductForRestock}
          onClose={() => setSelectedProductForRestock(null)}
        />
      )}
    </div>
  );
}
