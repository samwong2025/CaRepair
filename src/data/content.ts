import type { RepairCase, Review, SiteStat } from '../types';

const UNSPLASH = (id: string, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

/* ─── 核心數據看板 ───────────────────────────────── */
export const siteStats: SiteStat[] = [
  {
    id: 'customers',
    label: '累計服務客戶',
    labelEn: 'Customers Served',
    value: 128640,
    suffix: '+',
    icon: 'Users',
    description: '自 2016 年起服務全港客戶',
  },
  {
    id: 'satisfaction',
    label: '客戶好評率',
    labelEn: 'Satisfaction Rate',
    value: 98.6,
    suffix: '%',
    decimals: 1,
    icon: 'Star',
    description: '基於 42,180 份維修後真實評分',
  },
  {
    id: 'duration',
    label: '平均修復時長',
    labelEn: 'Average Repair Time',
    value: 42,
    suffix: ' 分鐘',
    icon: 'Timer',
    description: '常見故障即場完成，無需留機',
  },
  {
    id: 'sameday',
    label: '即日取機率',
    labelEn: 'Same-day Completion',
    value: 94.3,
    suffix: '%',
    decimals: 1,
    icon: 'PackageCheck',
    description: '常備 2,300+ 款原廠級配件現貨',
  },
];

/* ─── 服務承諾（對標「優質的服務」三卡片） ───────── */
export const servicePillars = [
  {
    id: 'team',
    title: '專業師傅・原廠級工藝',
    titleEn: 'Certified Technicians',
    description:
      '駐店師傅平均 8 年蘋果產品維修經驗，全部通過 IPC-7711 焊接認證，配備顯微焊台與 BGA 植球設備，主機板級故障亦可即場處理。',
    icon: 'BadgeCheck',
    points: ['IPC 國際焊接認證', '顯微鏡下晶片級維修', '27 項出機檢測'],
  },
  {
    id: 'quality',
    title: '嚴苛品檢・180 日保養',
    titleEn: 'Strict Quality Control',
    description:
      '每部維修完成的產品須通過 27 項功能檢測（觸控、鏡頭、訊號、防水、電池健康度等），檢測報告隨機附上，保養期內同一故障免費復修。',
    icon: 'ShieldCheck',
    points: ['27 項出機檢測', '電池配件保養 365 日', '同一故障免費復修'],
  },
  {
    id: 'speed',
    title: '30 分鐘快修・逾時折扣',
    titleEn: 'Lightning Fast Service',
    description:
      '換芒、換電、換尾插等常見故障 30 分鐘即場完成；如超出承諾時間仍未完成，該次人工費即減 50%，門市現場即時扣減。',
    icon: 'Zap',
    points: ['常見故障 30 分鐘', '逾時人工費半價', '全港順豐免費收送'],
  },
] as const;

/* ─── 下單流程 1-2-3-4 ───────────────────────────── */
export const orderSteps = [
  {
    step: 1,
    title: '選機型',
    titleEn: 'Select Device',
    description: '揀選 iPhone、iPad、Apple Watch 或 MacBook 的實際型號，系統自動載入對應配件庫存。',
    icon: 'Smartphone',
    duration: '約 20 秒',
  },
  {
    step: 2,
    title: '揀故障',
    titleEn: 'Pick Symptoms',
    description: '勾選爆芒、電池老化、入水、鏡頭、尾插等症狀，可同時多選，系統會自動組合維修方案。',
    icon: 'ListChecks',
    duration: '約 30 秒',
  },
  {
    step: 3,
    title: '睇報價',
    titleEn: 'Instant Quote',
    description: '即時顯示配件費與人工費逐項明細、預計工時與保養期，多項同修自動套用折扣，全程冇隱藏收費。',
    icon: 'ReceiptText',
    duration: '即時計算',
  },
  {
    step: 4,
    title: '約時間',
    titleEn: 'Book & Submit',
    description: '選擇到店快修或順豐寄修，填妥聯絡資料即自動開立會員檔案，並可即時追蹤進度。',
    icon: 'CalendarCheck',
    duration: '約 40 秒',
  },
] as const;

/* ─── 真實維修案例（前後對比） ───────────────────── */
export const repairCases: RepairCase[] = [
  {
    id: 'case-01',
    title: 'iPhone 16 Pro Max 跌落地鐵路軌・全屏爆裂',
    deviceModelName: 'iPhone 16 Pro Max',
    symptomSummary: '螢幕爆裂 + 後蓋玻璃碎裂',
    beforeImage: UNSPLASH('photo-1434493789847-2f02dc6ca35d'),
    afterImage: UNSPLASH('photo-1592750475338-74b7b21085ab'),
    durationMinutes: 75,
    price: 2340,
    technician: '陳師傅',
    summary:
      '客戶趕地鐵時手機跌落月台，正反兩面同時爆裂但主機板完好。使用鐳射分離工藝拆除後蓋，更換原廠級 OLED 總成，Face ID 與原深感鏡頭完整轉移，75 分鐘即場取機。',
    date: '2026-08-06',
  },
  {
    id: 'case-02',
    title: 'MacBook Pro 14" 咖啡倒瀉・主板嚴重腐蝕',
    deviceModelName: 'MacBook Pro 14 吋（M3）',
    symptomSummary: '入水受潮 + 無法開機',
    beforeImage: UNSPLASH('photo-1581993192008-63e896f4f744'),
    afterImage: UNSPLASH('photo-1517336714731-489689fd1ca8'),
    durationMinutes: 420,
    price: 3860,
    technician: '李師傅',
    summary:
      '整杯拿鐵倒入鍵盤，開機無反應。超聲波清洗主板後發現 PPBUS 供電線路腐蝕斷路，顯微鏡下重新飛線並更換電源管理 IC，SSD 內 6 年設計檔案 100% 保全。',
    date: '2026-08-02',
  },
  {
    id: 'case-03',
    title: 'Apple Watch Ultra 2 潛水後入水・錶面起霧',
    deviceModelName: 'Apple Watch Ultra 2',
    symptomSummary: '入水受潮 + 錶冠失靈',
    beforeImage: UNSPLASH('photo-1551816230-ef5deaed4a26'),
    afterImage: UNSPLASH('photo-1546868871-7041f2a55e12'),
    durationMinutes: 180,
    price: 1680,
    technician: '黃師傅',
    summary:
      '西貢深潛後錶面內側起霧、數碼錶冠卡住。拆解清洗鹽分結晶，更換錶冠總成與全套防水膠圈，完成後以 5ATM 氣壓測試機驗證防水，維持原有潛水規格。',
    date: '2026-07-28',
  },
  {
    id: 'case-04',
    title: 'iPad Pro 13" M4 電池發脹・頂起螢幕',
    deviceModelName: 'iPad Pro 13 吋（M4）',
    symptomSummary: '電池老化 + 機身變形',
    beforeImage: UNSPLASH('photo-1561154464-82e9adf32764'),
    afterImage: UNSPLASH('photo-1544244015-0df4b3ffc6b0'),
    durationMinutes: 120,
    price: 1420,
    technician: '周師傅',
    summary:
      '長期插電使用導致電池鼓脹，螢幕被頂起 3mm。低溫加熱分離螢幕避免爆裂，更換大容量原裝規格電池並校正健康度，機身壓平後密封膠重貼。',
    date: '2026-07-21',
  },
  {
    id: 'case-05',
    title: 'iPhone 13 泡海水 3 分鐘・相片全數救回',
    deviceModelName: 'iPhone 13',
    symptomSummary: '入水受潮 + 資料救援',
    beforeImage: UNSPLASH('photo-1588508065123-287b28e013da'),
    afterImage: UNSPLASH('photo-1580910051074-3eb694886505'),
    durationMinutes: 300,
    price: 1980,
    technician: '陳師傅',
    summary:
      '長洲遊船時跌入海中，撈起後已無法開機。即時斷電避免電化學腐蝕，超聲波清洗後基頻晶片仍損毀，改以 NAND 讀取方式導出 8 年間 12,400 張相片與全部通訊錄。',
    date: '2026-07-15',
  },
  {
    id: 'case-06',
    title: 'MacBook Air M2 鍵盤入水黏鍵・整組更換',
    deviceModelName: 'MacBook Air 13 吋（M2）',
    symptomSummary: '鍵盤故障 + 過熱死機',
    beforeImage: UNSPLASH('photo-1496181133206-80ce9b88a853'),
    afterImage: UNSPLASH('photo-1541807084-5c52b6b3adef'),
    durationMinutes: 240,
    price: 2180,
    technician: '李師傅',
    summary:
      '汽水濺入鍵盤導致多鍵連按，同時風扇長期高轉。更換整組背光鍵盤，清理散熱風道並重塗信越 7921 導熱矽脂，滿載溫度由 98°C 降至 76°C。',
    date: '2026-07-09',
  },
];

/* ─── 客戶好評 ───────────────────────────────────── */
export const reviews: Review[] = [
  {
    id: 'rv-01',
    customerName: '陳**',
    date: '2026-08-09',
    rating: 5,
    content:
      '返工前擺低部機，食完 lunch 返嚟就整好咗，換完個芒色水同原裝一模一樣，觸控好靈敏。師傅仲幫我免費貼咗塊鋼化膜，抵讚！',
    tags: ['#即日取機', '#原廠級屏幕', '#免費貼膜'],
    deviceModelName: 'iPhone 16 Pro',
    symptomSummary: '螢幕爆裂',
    shopName: '荔枝角門市',
  },
  {
    id: 'rv-02',
    customerName: '黃**',
    date: '2026-08-07',
    rating: 5,
    content:
      '部 MacBook 潑咗水，本身諗住報銷。師傅開咗嚟睇同我講清楚邊條線路燒咗、要幾多錢，冇亂咁報價。三日後真係救返晒啲檔案，感激。',
    tags: ['#報價透明', '#資料保全', '#技術好'],
    deviceModelName: 'MacBook Pro 14 吋（M3）',
    symptomSummary: '入水受潮',
    repeatCustomer: true,
    shopName: '荔枝角門市',
  },
  {
    id: 'rv-03',
    customerName: 'Ka**',
    date: '2026-08-05',
    rating: 5,
    content:
      '換電池仲畀我睇返舊電池個健康度同拆機過程，真係好放心。做完健康度返到 100%，用足一日都仲有 40%。',
    tags: ['#換電池', '#放心'],
    deviceModelName: 'iPhone 14 Pro Max',
    symptomSummary: '電池老化',
    shopName: '荔枝角門市',
  },
  {
    id: 'rv-04',
    customerName: '李**',
    date: '2026-08-03',
    rating: 5,
    content:
      '網上落單揀咗順豐寄修，朝早寄出，晏晝就收到入機通知，翌日就整好寄返。全程 WhatsApp 有進度通知，唔使自己追。',
    tags: ['#順豐寄修', '#進度通知', '#夠快'],
    deviceModelName: 'iPad Air 11 吋（M3）',
    symptomSummary: '充電口損壞',
    shopName: '荔枝角門市',
  },
  {
    id: 'rv-05',
    customerName: '許**',
    date: '2026-07-30',
    rating: 5,
    content:
      '個錶冠轉唔郁咗成個月，第一間舖話要成 $2,800 換全機。呢度只係換錶冠總成 $760 搞掂，仲重新做咗防水。價錢公道好多。',
    tags: ['#價錢公道', '#專業判斷', '#防水處理'],
    deviceModelName: 'Apple Watch Series 10（46mm）',
    symptomSummary: '錶冠失靈',
    shopName: '荔枝角門市',
  },
  {
    id: 'rv-06',
    customerName: '梁**',
    date: '2026-07-27',
    rating: 5,
    content:
      '超過咗承諾嘅 30 分鐘，師傅主動同我講人工費減半，唔使我開口。呢種做生意態度真係少見，以後有嘢整都嚟呢間。',
    tags: ['#逾時折扣', '#誠信', '#態度好'],
    deviceModelName: 'iPhone 15',
    symptomSummary: '螢幕爆裂',
    repeatCustomer: true,
    shopName: '荔枝角門市',
  },
  {
    id: 'rv-07',
    customerName: '周**',
    date: '2026-07-24',
    rating: 5,
    content:
      '部 iPad 電池發脹到個芒都翹起，師傅細心低溫拆解冇整爆塊芒。修完機身平返晒，睇唔出整過。',
    tags: ['#手工細緻', '#電池更換', '#無痕維修'],
    deviceModelName: 'iPad Pro 12.9 吋（M2）',
    symptomSummary: '電池老化',
    shopName: '荔枝角門市',
  },
  {
    id: 'rv-08',
    customerName: '林**',
    date: '2026-07-20',
    rating: 5,
    content:
      '公司 18 部 MacBook 一次過做保養同換電，開埋正式發票，仲派咗個專責跟進。企業客戶服務做得好足。',
    tags: ['#企業服務', '#有發票', '#專人跟進'],
    deviceModelName: 'MacBook Air 13 吋（M2）',
    symptomSummary: '電池老化',
    repeatCustomer: true,
    shopName: '荔枝角門市',
  },
  {
    id: 'rv-09',
    customerName: 'Wo**',
    date: '2026-07-16',
    rating: 5,
    content:
      '保養期內個芒again 出現綠線，攞返去二話不說即刻換過塊新，冇收一蚊。180 日保養係真嘅，唔係講嚟好聽。',
    tags: ['#保養兌現', '#免費復修', '#爽快'],
    deviceModelName: 'iPhone 13 Pro',
    symptomSummary: '螢幕故障',
    repeatCustomer: true,
    shopName: '荔枝角門市',
  },
  {
    id: 'rv-10',
    customerName: '鄭**',
    date: '2026-07-12',
    rating: 5,
    content:
      '個 App 落單好方便，揀完機型同故障即刻見到配件同人工幾多錢，去到舖頭真係收足呢個價，冇加過任何雜費。',
    tags: ['#報價準確', '#落單方便', '#冇隱藏收費'],
    deviceModelName: 'iPhone 16',
    symptomSummary: '充電口損壞',
    shopName: '荔枝角門市',
  },
  {
    id: 'rv-11',
    customerName: '何**',
    date: '2026-07-08',
    rating: 5,
    content:
      '喺呢度買咗部二手 iPhone 14 Pro，電池健康度 94%，外觀真係 S 級冇花。有 90 日保養，仲可以到店自取即場驗機，好安心。',
    tags: ['#二手機', '#驗機安心', '#有保養'],
    deviceModelName: 'iPhone 14 Pro',
    symptomSummary: '二手機購買',
    shopName: '荔枝角門市',
  },
  {
    id: 'rv-12',
    customerName: '吳**',
    date: '2026-07-04',
    rating: 5,
    content:
      '仔仔部機掉咗落廁所，本身完全開唔到。師傅講明有機會救唔返，唔會亂收錢，最後救返晒啲相。收費仲比報價低咗。',
    tags: ['#坦白', '#資料救援', '#收費實在'],
    deviceModelName: 'iPhone 12',
    symptomSummary: '入水受潮',
    shopName: '荔枝角門市',
  },
];

/* ─── 常見問題 ───────────────────────────────────── */
export const faqs = [
  {
    q: '維修需要幾耐？可唔可以即場等？',
    a: '換螢幕、換電池、換尾插等常見故障約 30 至 60 分鐘即場完成，可以喺店內等。入水、主機板級維修或資料救援需送內部實驗室處理，一般 1 至 3 個工作天，落單後可於「訂單查詢」即時睇到進度。',
  },
  {
    q: '網上報價同實際收費會唔會有出入？',
    a: '網上報價已包含配件費與人工費，係最終收費。如檢測後發現有報價未涵蓋的額外故障（例如換芒時發現主機板亦有損傷），我哋會先致電同你確認，經你同意先會施工，絕不會先斬後奏。',
  },
  {
    q: '維修會唔會睇到我部機入面嘅資料？',
    a: '不會。師傅不會解鎖、瀏覽或備份任何個人資料。除非你申請「資料救援」服務並簽署授權書，我哋才會接觸儲存內容，完成後亦會即時清除工作副本。',
  },
  {
    q: '保養期點計？包唔包人為損壞？',
    a: '一般維修項目保養 180 日，電池更換保養 365 日，主機板級維修保養 90 日。保養範圍為同一故障復發，不包括新的人為損壞（如再次跌撞、入水）或自行拆機。保養記錄可於「訂單查詢 → 售後保養」隨時查閱。',
  },
  {
    q: '有冇寄修服務？',
    a: '有。全港（包括離島）均可安排順豐到付寄修，來回運費由本店承擔，落單時揀選「自行寄件」即可自行寄修至荔枝角門市；企業客戶可預約專車批量收機。',
  },
  {
    q: '用嘅配件係咪原廠？',
    a: '我哋採用「原廠拆機件」與「原廠級副廠件」兩種選項，落單時會列明。螢幕總成使用原廠同級 OLED 面板（色準 ΔE<2），電池為 A 級電芯並可正常顯示健康度，所有配件均提供保養。',
  },
] as const;
