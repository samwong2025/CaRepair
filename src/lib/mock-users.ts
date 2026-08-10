/**
 * Mock 模式下的後台帳號種子。
 * 僅在未連接 Supabase（本地示範）時生效；連上 Supabase 後改由 Auth 真實帳號。
 *
 * 技術說明：
 *  - cookie 只存使用者 id（如 'local-admin'），auth / middleware 再以 id 還原角色與師傅名
 *  - 師傅的 technicianName 必須與 RepairOrder.technician 欄位一致，才能正確過濾「只看自己的工單」
 */

export type MockAppRole = 'admin' | 'technician';

export interface MockUser {
  id: string;
  email: string;
  password: string;
  /** 顯示用名稱（管理員 / 師傅本名） */
  name: string;
  role: MockAppRole;
  /** 師傅姓名（對應 RepairOrder.technician）；管理員留空 */
  technicianName?: string;
}

const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin123';

export const MOCK_USERS: MockUser[] = [
  {
    id: 'local-admin',
    email: 'admin@cathyrepair.com',
    password: adminPassword,
    name: '本機管理員',
    role: 'admin',
  },
  {
    id: 'tech-qiang',
    email: 'qiang@cathyrepair.com',
    password: 'qiang123',
    name: '陳強',
    role: 'technician',
    technicianName: '阿強',
  },
  {
    id: 'tech-jiaming',
    email: 'jiaming@cathyrepair.com',
    password: 'jiaming123',
    name: '林家明',
    role: 'technician',
    technicianName: '家明',
  },
];

/** 以帳號 + 密碼比對（mock 登入用） */
export function findMockUser(email: string, password: string): MockUser | null {
  return MOCK_USERS.find((u) => u.email === email && u.password === password) ?? null;
}

/** 以 cookie 中的使用者 id 還原帳號（auth / middleware 用） */
export function getMockUserById(id: string): MockUser | null {
  return MOCK_USERS.find((u) => u.id === id) ?? null;
}
