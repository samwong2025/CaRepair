import { AdminPageHeader } from '../../../components/admin/page-header';
import LazyAdmin from '../../../components/admin/lazy-admin';

export const dynamic = 'force-dynamic';

export default function AdminPricingPage() {
  return (
    <div>
      <AdminPageHeader
        titleEn="Repair Pricing"
        title="維修價格管理"
        description="線上調整各機型故障的配件費、人工費、工時與保養期；修改即時同步至線上報價與後台建單。"
      />
      <LazyAdmin name="pricing" />
    </div>
  );
}
