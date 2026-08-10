/** 收集現有師傅名單，供工單分派下拉使用 */
import { getRepository } from './repositories';
import { MOCK_USERS } from './mock-users';

const DEFAULT_OPTIONS = ['待分派', '陳師傅', '李師傅', '周師傅', '黃師傅'];

export async function getTechnicianOptions(): Promise<string[]> {
  const names = new Set<string>(DEFAULT_OPTIONS);
  for (const u of MOCK_USERS) {
    if (u.role === 'technician' && u.technicianName) names.add(u.technicianName);
  }
  try {
    const repo = getRepository();
    const orders = await repo.listRepairOrders();
    for (const o of orders) {
      if (o.technician) names.add(o.technician);
    }
  } catch (error) {
    /* mock store 尚未初始化時忽略 */
    console.error('getTechnicianOptions failed', error);
  }
  return [...names];
}