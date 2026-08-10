import { Navbar } from '../../components/layout/navbar';
import { Footer } from '../../components/layout/footer';
import { MobileActionBar } from '../../components/layout/mobile-action-bar';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      {/* 預留固定導覽列高度：流動版 4rem，桌面版 2.25rem 資訊條 + 4.5rem 導覽 */}
      <main className="flex-1 pt-16 lg:pt-[6.75rem]">{children}</main>
      <Footer />
      <MobileActionBar />
      {/* 流動版底部操作列佔位 */}
      <div className="h-[4.5rem] lg:hidden" aria-hidden />
    </div>
  );
}
