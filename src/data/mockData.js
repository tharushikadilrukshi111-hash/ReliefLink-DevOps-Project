export const incidents = [
  { id: 'INC-2048', district: 'Galle', type: 'Flood', severity: 'Critical', status: 'Responding', people: 1240, updated: '4 min ago' },
  { id: 'INC-2047', district: 'Ratnapura', type: 'Landslide', severity: 'High', status: 'Evacuating', people: 612, updated: '11 min ago' },
  { id: 'INC-2046', district: 'Kalutara', type: 'Flood', severity: 'High', status: 'Monitoring', people: 884, updated: '19 min ago' },
  { id: 'INC-2045', district: 'Matara', type: 'Strong Winds', severity: 'Medium', status: 'Assessing', people: 307, updated: '28 min ago' },
  { id: 'INC-2044', district: 'Kegalle', type: 'Landslide Risk', severity: 'Medium', status: 'Monitoring', people: 221, updated: '42 min ago' },
  { id: 'INC-2043', district: 'Colombo', type: 'Urban Flood', severity: 'Low', status: 'Resolved', people: 98, updated: '1 hr ago' },
];

export const resources = [
  { label: 'Rescue Teams', value: 68, total: 82, unit: 'teams' },
  { label: 'Ambulances', value: 41, total: 57, unit: 'units' },
  { label: 'Relief Packs', value: 7420, total: 10000, unit: 'packs' },
  { label: 'Water Tanks', value: 133, total: 180, unit: 'units' },
];

export const shelters = [
  { name: 'Galle Central College', district: 'Galle', capacity: 900, occupied: 668 },
  { name: 'Baddegama Community Hall', district: 'Galle', capacity: 420, occupied: 351 },
  { name: 'Ratnapura Municipal Centre', district: 'Ratnapura', capacity: 600, occupied: 428 },
  { name: 'Kalutara Public Hall', district: 'Kalutara', capacity: 500, occupied: 289 },
];

export const activity = [
  { title: 'Rescue boat R-17 dispatched', meta: 'Galle · 3 minutes ago', tone: 'blue' },
  { title: 'New evacuation shelter activated', meta: 'Ratnapura · 12 minutes ago', tone: 'green' },
  { title: 'Landslide warning escalated', meta: 'Kegalle · 21 minutes ago', tone: 'orange' },
  { title: 'Medical supplies delivered', meta: 'Kalutara · 35 minutes ago', tone: 'violet' },
];

export const navItems = [
  ['dashboard', 'Dashboard'],
  ['incidents', 'Active Incidents'],
  ['map', 'Live Map'],
  ['shelters', 'Shelters'],
  ['resources', 'Resources'],
  ['teams', 'Response Teams'],
  ['alerts', 'Alerts'],
  ['reports', 'Reports'],
];
