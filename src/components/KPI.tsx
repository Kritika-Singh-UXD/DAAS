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
      style={{ 
        border: "1px solid #ddd", 
        padding: 16, 
        borderRadius: 8, 
        backgroundColor: "white",
        cursor: onClick ? "pointer" : "default",
        transition: "box-shadow 0.2s"
      }}
      onClick={handleClick}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.boxShadow = "none";
        }
      }}
    >
      <h4 style={{ margin: "0 0 8px 0", fontSize: 14, color: "#666" }}>{title}</h4>
      <div style={{ fontSize: 24, fontWeight: "bold", margin: "0 0 4px 0" }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      {subtitle && (
        <div style={{ fontSize: 12, color: "#888" }}>{subtitle}</div>
      )}
    </div>
  );
}