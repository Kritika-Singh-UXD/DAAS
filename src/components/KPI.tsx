"use client";

interface KPIProps {
  title: string;
  value: string | number;
  subtitle?: string;
  onClick?: () => void;
}

export default function KPI({ title, value, subtitle, onClick }: KPIProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div 
      className={`
        bg-white border border-gray-100 rounded-xl p-4 shadow-sm transition-all duration-200
        ${onClick ? 'cursor-pointer hover:shadow-md hover:border-gray-200' : 'cursor-default'}
      `}
      onClick={handleClick}
    >
      <h4 className="text-sm font-medium text-gray-600 mb-2">{title}</h4>
      <div className="text-2xl font-semibold text-gray-900 mb-1">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      {subtitle && (
        <div className="text-xs text-gray-500">{subtitle}</div>
      )}
    </div>
  );
}