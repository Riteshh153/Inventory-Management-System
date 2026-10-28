import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  variant = 'default',
  trend,
  trendType = 'positive'
}) {
  let iconClass = 'kpi-icon-wrap';
  if (variant === 'warning') iconClass += ' alert-warning';
  if (variant === 'danger') iconClass += ' alert-danger';

  return (
    <div className="kpi-card">
      <div className="kpi-card-header">
        <span className="kpi-card-title">{title}</span>
        {Icon && (
          <div className={iconClass}>
            <Icon size={18} strokeWidth={2.2} />
          </div>
        )}
      </div>
      <div className="kpi-card-value">{value}</div>
      <div className="kpi-card-footer">
        {trend && (
          <span className={`trend-badge ${trendType}`}>
            {trendType === 'positive' ? (
              <TrendingUp size={12} strokeWidth={2.5} />
            ) : (
              <TrendingDown size={12} strokeWidth={2.5} />
            )}
            {trend}
          </span>
        )}
        <span>{description}</span>
      </div>
    </div>
  );
}
