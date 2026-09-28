import React from 'react';

const base = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

export function Icon({ name, size = 20 }) {
  const p = { ...base, width: size, height: size };
  const icons = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
    incidents: <><path d="M12 3 2.8 19h18.4L12 3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></>,
    map: <><path d="m3 6 5-2 8 3 5-2v13l-5 2-8-3-5 2V6Z"/><path d="M8 4v13M16 7v13"/></>,
    shelters: <><path d="m3 11 9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></>,
    resources: <><path d="M4 7h16v13H4z"/><path d="M8 7V4h8v3"/><path d="M4 12h16"/><path d="M10 12v2h4v-2"/></>,
    teams: <><circle cx="9" cy="8" r="3"/><path d="M3 20c.5-4 2.5-6 6-6s5.5 2 6 6"/><circle cx="17" cy="9" r="2"/><path d="M16 14c3 0 5 2 5 5"/></>,
    alerts: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    reports: <><path d="M6 3h9l3 3v15H6z"/><path d="M14 3v4h4"/><path d="M9 11h6M9 15h6"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    users: <><circle cx="9" cy="8" r="3"/><path d="M3 20c.5-4 2.5-6 6-6s5.5 2 6 6"/><path d="M17 11a3 3 0 1 0 0-6"/><path d="M17 14c2.8 0 4.4 1.6 4.9 4.8"/></>,
    home: <><path d="m3 11 9-7 9 7"/><path d="M5 10v10h14V10"/></>,
    truck: <><path d="M3 6h11v11H3z"/><path d="M14 10h4l3 3v4h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></>,
    pulse: <><path d="M3 12h4l2-5 4 10 2-5h6"/></>,
    filter: <><path d="M4 5h16M7 12h10M10 19h4"/></>,
    moon: <path d="M20 15.5A8 8 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z"/>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></>,
    shield: <><path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></>,
    phone: <><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.45 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.45c.9.35 1.8.6 2.8.7A2 2 0 0 1 22 16.9Z"/></>,
    download: <><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></>,
  };
  return <svg {...p}>{icons[name] || icons.dashboard}</svg>;
}
