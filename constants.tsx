
import React from 'react';

export const APP_NAME = "STOLDRY";
export const APP_VERSION = "V.1 BY SURYA";
export const COPYRIGHT = "COPYRIGHT SURYADINATA 2026";

export const BUILDINGS = [
  "Gedung Utama",
  "Gedung Singles",
  "Gedung Nugget"
] as const;

export const SHIFTS = ["Shift 1", "Shift 2", "Shift 3"];

export const COLORS = {
  primary: '#4f46e5',
  secondary: '#0ea5e9',
  safe: '#22c55e',
  warning: '#eab308',
  danger: '#ef4444',
};

export const ROLE_BADGES = {
  LEADER: { icon: '👑', label: 'Leader', color: 'bg-indigo-100 text-indigo-700' },
  ADMIN: { icon: '⚙️', label: 'Admin', color: 'bg-blue-100 text-blue-700' },
  STAFF: { icon: '👷', label: 'Staf', color: 'bg-slate-100 text-slate-700' },
};
