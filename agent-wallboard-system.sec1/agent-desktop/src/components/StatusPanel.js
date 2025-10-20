import React, { useEffect, useRef, useState } from 'react';

function StatusPanel({ currentStatus, onStatusChange, disabled = false }) {
  // ✅ ไม่ใช้ TypeScript types ตรงนี้
  const statuses = [
    { key: 'Available', label: 'Available', color: '#4CAF50', icon: '✓' },
    { key: 'Busy',      label: 'Busy',      color: '#FF9800', icon: '⏱' },
    { key: 'Break',     label: 'Break',     color: '#2196F3', icon: '☕' },
    { key: 'Offline',   label: 'Offline',   color: '#9E9E9E', icon: '⏸' }
  ];

  // เผื่อ currentStatus ไม่แมตช์ ให้ fallback เป็น index 0
  const activeIndex = Math.max(
    0,
    statuses.findIndex(s => s.key === currentStatus)
  );

  const barRef = useRef(null);
  const btnRefs = useRef([]); // จะเก็บปุ่มแต่ละอัน
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const activeColor = statuses[activeIndex]?.color || '#3b82f6';

  const recalc = () => {
    const bar = barRef.current;
    const btn = btnRefs.current[activeIndex];
    if (!bar || !btn) return;
    const barRect = bar.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    setIndicator({
      left: btnRect.left - barRect.left,
      width: btnRect.width
    });
  };

  useEffect(() => {
    recalc();
    const onResize = () => recalc();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // activeIndex เปลี่ยนเมื่อ currentStatus เปลี่ยน
  }, [activeIndex]);

  return (
    <div className="status-panel">
      <div className="status-header">
        <h3>Status Control</h3>
        <div className="current-status">
          Current:{' '}
          <span
            className="status-badge"
            style={{ backgroundColor: activeColor }}
          >
            {statuses[activeIndex]?.key}
          </span>
        </div>
      </div>

      <div className="status-buttons" ref={barRef}>
        {statuses.map((status, i) => (
          <button
            key={status.key}
            ref={el => (btnRefs.current[i] = el)}
            className={`status-btn ${i === activeIndex ? 'active' : ''}`}
            onClick={() => onStatusChange(status.key)}
            disabled={disabled}
            style={{
              backgroundColor: status.color,
              opacity: disabled ? 0.5 : i === activeIndex ? 1 : 0.85
            }}
          >
            <span className="status-icon">{status.icon}</span>
            <span className="status-label">{status.label}</span>
          </button>
        ))}

        {/* เส้นขีดเคลื่อนที่อันเดียว */}
        <span
          className="status-indicator"
          style={{
            left: indicator.left,
            width: indicator.width,
            backgroundColor: activeColor,
            opacity: disabled ? 0.5 : 1
          }}
        />
      </div>

      {disabled && (
        <div className="status-warning">
          ⚠️ Not connected to server - Status updates unavailable
        </div>
      )}
    </div>
  );
}

export default StatusPanel;
