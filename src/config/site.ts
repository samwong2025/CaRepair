/** 全站品牌、導覽與頁尾文案設定（繁體中文・香港用語） */

export const siteConfig = {
  name: 'CathyRepair',
  tagline: '香港蘋果產品專業維修中心',
  slogan: '30 分鐘極速維修・原廠級品質・180 日保養',
  description:
    'CathyRepair 專注 iPhone、iPad、Apple Watch、MacBook 維修，提供即時報價、門市快修與順豐寄修服務，專業師傅施工、180 日保養承諾。',
  hotline: '9612 0461',
  whatsapp: '9612 0461',
  serviceHours: '每日 10:00 – 21:00（公眾假期照常）',
  email: 'service@cathyrepair.hk',
  shops: [
    {
      name: '荔枝角門市',
      address: '九龍荔枝角青山道 588 號永盛工業大廈 1 樓 18 室',
      district: '荔枝角',
      hours: '10:00 – 21:00',
      mtr: '港鐵荔枝角站 B1 出口步行 3 分鐘',
      // Google 地圖搜尋字串（直接複製門牌地址，省去再手動更新經緯度）
      mapsQuery: '九龍荔枝角青山道 588 號永盛工業大廈 1 樓 18 室',
      // 嵌入 Google 地圖的 <iframe src> 用 place query
      embedQuery: 'CathyRepair+荔枝角+青山道+588',
    },
  ],
  company: {
    legalName: 'CathyRepair Technology (Hong Kong) Limited',
    brNo: '商業登記證號碼 7118 9264-000-08-26-A',
    since: 2016,
  },
} as const;

export type NavItem = {
  label: string;
  href: string;
  description?: string;
  children?: { label: string; href: string; description?: string }[];
};

export const mainNav: NavItem[] = [
  { label: '首頁', href: '/' },
  {
    label: '維修落單',
    href: '/repair',
    description: '四步即時報價，選機型、揀故障、睇價錢、約時間',
  },
  {
    label: '二手商店',
    href: '/shop',
    description: '官翻級二手機，送貨上門或到店自取',
  },
  {
    label: '訂單查詢',
    href: '/track',
    description: '即時追蹤維修進度與售後保養記錄',
  },
  { label: '關於我們', href: '/about' },
];

export const footerNav = [
  {
    title: 'CathyRepair',
    links: [
      { label: '關於我們', href: '/about' },
      { label: '門市地址', href: '/about#shops' },
      { label: '加入我們', href: '/about#join' },
      { label: '聯絡我們', href: '/about#contact' },
    ],
  },
  {
    title: '維修服務',
    links: [
      { label: 'iPhone 維修', href: '/repair?brand=iphone' },
      { label: 'iPad 維修', href: '/repair?brand=ipad' },
      { label: 'Apple Watch 維修', href: '/repair?brand=watch' },
      { label: 'MacBook 維修', href: '/repair?brand=macbook' },
    ],
  },
  {
    title: '服務指南',
    links: [
      { label: '維修流程', href: '/#process' },
      { label: '保養條款', href: '/about#warranty' },
      { label: '常見問題', href: '/about#faq' },
      { label: '收費標準', href: '/repair' },
    ],
  },
  {
    title: '客戶支援',
    links: [
      { label: '訂單查詢', href: '/track' },
      { label: '售後保養申請', href: '/track?tab=aftersales' },
      { label: '二手商店', href: '/shop' },
      { label: '後台管理', href: '/admin' },
    ],
  },
] as const;

/** 信任徽章：對標「持證上崗・嚴苛質檢・超長質保」 */
export const trustBadges = [
  { icon: 'ShieldCheck', label: '180 日保養', detail: '維修後保養期內免費復修' },
  { icon: 'BadgeCheck', label: '專業師傅', detail: '平均 8 年蘋果維修經驗' },
  { icon: 'Timer', label: '30 分鐘快修', detail: '常見故障即日取機' },
  { icon: 'Banknote', label: '透明報價', detail: '配件費、人工費逐項列明' },
  { icon: 'Lock', label: '私隱保密', detail: '不查看、不備份任何個人資料' },
] as const;
