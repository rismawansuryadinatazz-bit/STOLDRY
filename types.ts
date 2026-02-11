
export enum UserRole {
  LEADER = 'LEADER',
  ADMIN = 'ADMIN',
  STAFF = 'STAFF'
}

export enum Building {
  UTAMA = 'Gedung Utama',
  SINGLES = 'Gedung Singles',
  NUGGET = 'Gedung Nugget'
}

export enum ItemType {
  DISPOSABLE = 'Sekali Pakai',
  REUSABLE = 'Bisa Dipakai Kembali'
}

export enum TransactionType {
  MASUK = 'Masuk',
  KELUAR_SINGLES = 'Keluar ke Singles',
  KELUAR_NUGGET = 'Keluar ke Nugget',
  REPAIR = 'Perlu Repair',
  PEMUSNAHAN = 'Pemusnahan',
  KEMBALI_UTAMA = 'Kembali ke Utama',
  TERPAKAI = 'Terpakai',
  LAIN_LAIN = 'Lain-lain'
}

export interface MasterItem {
  id: string;
  name: string;
  size: string;
  unit: string;
  type: ItemType;
  addedAt: string;
}

export interface Transaction {
  id: string;
  date: string;
  building: Building;
  type: TransactionType;
  customType?: string;
  itemId: string;
  quantity: number;
  staffName: string;
  staffId: string;
  shift: string;
  reason?: string;
  note?: string;
  status?: 'PENDING' | 'COMPLETED'; // Tambahan untuk Repair/Disposal
}

export interface UserAccount {
  id: string;
  fullName: string;
  password: string;
  role: UserRole;
  assignedBuilding?: Building;
  lastLogin?: string;
}

export interface PasswordRequest {
  id: string;
  userId: string;
  fullName: string;
  newPassword: string;
  requestedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface UserSession {
  id: string;
  fullName: string;
  role: UserRole;
  assignedBuilding?: Building;
  lastLogin: string;
}
