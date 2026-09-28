import React from 'react';

const pins = [
  { x: 44, y: 70, label: 'Galle', level: 'critical' },
  { x: 54, y: 55, label: 'Ratnapura', level: 'high' },
  { x: 35, y: 48, label: 'Kalutara', level: 'high' },
  { x: 64, y: 71, label: 'Matara', level: 'medium' },
  { x: 55, y: 38, label: 'Kegalle', level: 'medium' },
  { x: 29, y: 32, label: 'Colombo', level: 'low' },
];

export default function IslandMap() {
  return (
    <div
      className="map-visual"
      aria-label="Stylised live incident map of Sri Lanka"
    >
      <div className="map-grid" />

      <svg
        className="island"
        viewBox="0 0 220 430"
        role="img"
        aria-label="Stylised outline of Sri Lanka"
      >
        <path d="M116 9c-18 11-34 27-41 48-9 27-3 50-18 73-14 21-32 32-39 57-7 25 2 52 15 73 11 18 18 38 25 59 8 23 20 45 38 65 13 14 27 32 43 31 18-1 31-21 40-39 10-20 16-41 20-63 5-24 5-49 0-73-5-25-16-47-18-73-2-25 5-52-4-76-8-21-23-42-41-52Z" />
      </svg>

      {pins.map((pin, index) => (
        <button
          key={pin.label}
          className={`map-pin ${pin.level}`}
          style={{
            left: `${pin.x}%`,
            top: `${pin.y}%`,
          }}
          title={`${pin.label} incident`}
        >
          <span>{index + 1}</span>
          <b>{pin.label}</b>
        </button>
      ))}

      <div className="map-legend">
        <span>
          <i className="critical" />
          Critical
        </span>

        <span>
          <i className="high" />
          High
        </span>

        <span>
          <i className="medium" />
          Medium
        </span>
      </div>
    </div>
  );
}