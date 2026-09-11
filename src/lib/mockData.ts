// src/lib/mockData.ts

export interface Property {
  id: string;
  slug: string;
  title: string;
  type: 'apartment' | 'villa' | 'annex' | 'penthouse' | 'duplex';
  status: 'available' | 'reserved' | 'sold' | 'coming_soon';
  project: { id: string; name: string; slug: string };
  location: {
    city: string;
    district: string;
    coordinates: { lat: number; lng: number };
    address: string;
  };
  specs: {
    area: number;
    bedrooms: number;
    bathrooms: number;
    livingRooms?: number;
    kitchen: boolean;
    parking?: number;
    floor?: number;
    totalFloors?: number;
    view?: string;
    direction?: 'north' | 'south' | 'east' | 'west' | 'corner';
    features?: string[];
  };
  pricing: {
    price: number;
    pricePerMeter: number;
    currency: 'SAR';
    isNegotiable: boolean;
    downPaymentPct?: number;
    monthlyInstallment?: number;
  };
  media: {
    images: string[];
    thumbnail: string;
    videos?: string[];
    floorPlan?: string;
    virtualTour?: string;
  };
  description: string;
  publishedAt: string;
  featured: boolean;
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  status: 'under_construction' | 'completed' | 'upcoming';
  location: {
    city: string;
    district: string;
    address: string;
  };
  description: string;
  media: {
    hero: string;
    gallery: string[];
    videos?: string[];
  };
  priceRange: { min: number; max: number; currency: 'SAR' };
  specs: {
    totalUnits: number;
    availableUnits: number;
    completionDate: string;
  };
  featured: boolean;
  brochureUrl?: string;
}

export const PROJECTS: Project[] = [
  {
    id: "proj-1",
    slug: "amal-stars",
    name: "مشروع أمل ستارز",
    tagline: "رفاهية سكنية متكاملة الخدمات في أرقى أحياء جدة",
    status: "completed",
    location: {
      city: "جدة",
      district: "السلامة",
      address: "حي السلامة، جدة"
    },
    description: "مجمع سكني معاصر يوفر مساحات خضراء شاسعة، ومسابح خاصة، ومواقف سيارات آمنة، بالإضافة إلى نظام أمني ذكي على مدار الساعة. صُمم المشروع ليمنح العائلات خصوصية مطلقة وجودة حياة لا تضاهى.",
    media: {
      hero: "/projects/amal-stars-showcase.webp",
      gallery: [],
      videos: ["https://assets.mixkit.co/videos/preview/mixkit-luxury-home-interior-41582-large.mp4"]
    },
    priceRange: { min: 730000, max: 980000, currency: "SAR" },
    specs: {
      totalUnits: 45,
      availableUnits: 12,
      completionDate: "ديسمبر 2025"
    },
    featured: true
  },
  {
    id: "proj-2",
    slug: "abu-hail-avenue",
    name: "مجمع أبو هايل أفينيو",
    tagline: "شقق فخمة وتصاميم عصرية تناسب أسلوب حياتك",
    status: "under_construction",
    location: {
      city: "جدة",
      district: "الروضة",
      address: "حي الروضة، جدة"
    },
    description: "بموقعه الاستراتيجي وتصميمه الهندسي الفاخر، يُعد مشروع أبو هايل أفينيو الخيار الأول للمستثمرين والعائلات الباحثة عن توازن مثالي بين الفخامة والعملية.",
    media: {
      hero: "/properties/penthouse.webp",
      gallery: [],
      videos: ["https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-interior-41584-large.mp4"]
    },
    priceRange: { min: 489000, max: 17000000, currency: "SAR" },
    specs: {
      totalUnits: 60,
      availableUnits: 18,
      completionDate: "يونيو 2027"
    },
    featured: true
  },
  {
    id: "proj-3",
    slug: "salama-114",
    name: "مشروع 114 السلامة",
    tagline: "تصميم عصري وجودة بناء تتخطى التوقعات",
    status: "completed",
    location: {
      city: "جدة",
      district: "السلامة",
      address: "حي السلامة، جدة"
    },
    description: "يتميز المشروع بجودة البناء والتشطيبات الفاخرة باستخدام أحدث تقنيات العزل الحراري والمائي، وبجوار كافة الخدمات والمرافق الأساسية لضمان راحة العائلة.",
    media: {
      hero: "/properties/apartment.webp",
      gallery: []
    },
    priceRange: { min: 620000, max: 900000, currency: "SAR" },
    specs: {
      totalUnits: 30,
      availableUnits: 5,
      completionDate: "أكتوبر 2025"
    },
    featured: false
  },
  {
    id: "proj-4",
    slug: "hattan-tayseer",
    name: "مشروع هتان التيسير",
    tagline: "شقق سكنية عصرية بتشطيبات راقية في حي التيسير",
    status: "completed",
    location: {
      city: "جدة",
      district: "التيسير",
      address: "حي التيسير، جدة"
    },
    description: "مشروع هتان التيسير يتميز بتصميمه الحديث وجودة البناء العالية، ويقدم مجموعة من الشقق السكنية الفاخرة التي توفر سبل الراحة والخصوصية التامة للعائلات.",
    media: {
      hero: "/projects/panorama-penthouse.webp",
      gallery: []
    },
    priceRange: { min: 590000, max: 590000, currency: "SAR" },
    specs: {
      totalUnits: 40,
      availableUnits: 6,
      completionDate: "أغسطس 2025"
    },
    featured: false
  },
  {
    id: "proj-5",
    slug: "renad-gallery",
    name: "مشروع ريناد غاليري",
    tagline: "فن العمارة الفاخرة في قلب أرقى أحياء جدة",
    status: "completed",
    location: {
      city: "جدة",
      district: "النعيم",
      address: "حي النعيم، جدة"
    },
    description: "يقدم مشروع ريناد غاليري تجربة سكنية استثنائية تجمع بين العمارة الكلاسيكية والتقنيات الحديثة، مع توافر مداخل مستقلة وأنظمة ذكية متكاملة لتوفير الفخامة والراحة.",
    media: {
      hero: "/projects/villa_3d_render.webp",
      gallery: []
    },
    priceRange: { min: 489000, max: 1199000, currency: "SAR" },
    specs: {
      totalUnits: 50,
      availableUnits: 15,
      completionDate: "يناير 2026"
    },
    featured: false
  }
];

export const PROPERTIES: Property[] = [
  {
    id: "prop-1",
    slug: "penthouse-4-rooms-amal-stars",
    title: "ملحق فاخر 4 غرف - مشروع أمل ستارز",
    type: "annex",
    status: "available",
    project: { id: "proj-1", name: "مشروع أمل ستارز", slug: "amal-stars" },
    location: {
      city: "جدة",
      district: "السلامة",
      coordinates: { lat: 21.5833, lng: 39.1667 },
      address: "حي السلامة، جدة، المملكة العربية السعودية"
    },
    specs: {
      area: 215,
      bedrooms: 4,
      bathrooms: 4,
      parking: 1,
      floor: 5,
      kitchen: true,
      view: "مفتوح على واجهة الحي الرئيسي",
      features: ["غرفة خادمة", "غرفة سائق", "موقف خاص", "مصعد مستقل", "عزل حراري مائي"]
    },
    pricing: {
      price: 730000,
      pricePerMeter: 3395,
      currency: "SAR",
      isNegotiable: false,
      downPaymentPct: 10,
      monthlyInstallment: 4770
    },
    media: {
      images: ["/properties/penthouse.webp"],
      thumbnail: "/properties/penthouse.webp",
      videos: ["https://assets.mixkit.co/videos/preview/mixkit-luxury-home-interior-41582-large.mp4"]
    },
    description: "ملحق رائع يحتوي على 4 غرف نوم واسعة و4 دورات مياه مجهزة بالكامل. يتضمن موقف سيارات خاص ومصعد مستقل، بالإضافة إلى غرفة مخصصة للسائق وأخرى للخادمة. تشطيبات الترا سوبر لوكس تناسب معايير الفخامة العائلية.",
    publishedAt: "2026-05-10",
    featured: true
  },
  {
    id: "prop-2",
    slug: "abu-hail-north-luxury-villa",
    title: "فيلا أبو هايل نورث الفاخرة مع مسبح خاص",
    type: "villa",
    status: "available",
    project: { id: "proj-2", name: "مجمع أبو هايل أفينيو", slug: "abu-hail-avenue" },
    location: {
      city: "جدة",
      district: "الروضة",
      coordinates: { lat: 21.5667, lng: 39.15 },
      address: "حي الروضة، جدة، المملكة العربية السعودية"
    },
    specs: {
      area: 320,
      bedrooms: 5,
      bathrooms: 6,
      parking: 2,
      kitchen: true,
      direction: "north",
      view: "إطلالة بحرية جزئية ومسبح داخلي",
      features: ["مسبح خاص", "جراج يتسع لسيارتين", "مصعد داخلي", "نظام تكييف مركزي VRF", "أمن وحراسة"]
    },
    pricing: {
      price: 17000000,
      pricePerMeter: 53125,
      currency: "SAR",
      isNegotiable: true,
      downPaymentPct: 20,
      monthlyInstallment: 111150
    },
    media: {
      images: ["/properties/villa.webp"],
      thumbnail: "/properties/villa.webp",
      videos: ["https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-interior-41584-large.mp4"]
    },
    description: "فيلا قمة في الفخامة والرقي بحي الروضة بجدة. تمتد على مساحة 320 متر مربع وتضم 5 أجنحة نوم رئيسية بمصعد داخلي ومسبح خاص دافئ وجناح متكامل للخدم والحراسة وموقف آمن مغطى لسيارتين.",
    publishedAt: "2026-05-15",
    featured: true
  },
  {
    id: "prop-3",
    slug: "saeed-plan-premium-villa",
    title: "فيلا راقية - مخطط السعيد",
    type: "villa",
    status: "available",
    project: { id: "none", name: "فلل مخطط السعيد المستقلة", slug: "independent" },
    location: {
      city: "جدة",
      district: "مخطط السعيد",
      coordinates: { lat: 21.65, lng: 39.22 },
      address: "مخطط السعيد، جدة، المملكة العربية السعودية"
    },
    specs: {
      area: 320,
      bedrooms: 5,
      bathrooms: 6,
      parking: 2,
      kitchen: true,
      features: ["مسبح", "فناء خلفي واسع", "مجلس رجال مستقل", "موقف سيارات خاص"]
    },
    pricing: {
      price: 17000000,
      pricePerMeter: 53125,
      currency: "SAR",
      isNegotiable: true,
      downPaymentPct: 20,
      monthlyInstallment: 111150
    },
    media: {
      images: ["/properties/villa.webp"],
      thumbnail: "/properties/villa.webp"
    },
    description: "فيلا مستقلة بمساحة 320 متر مربع في منطقة هادئة بمخطط السعيد بجدة. تمتاز بمسبح خاص وفناء خلفي واسع وجناح متكامل للخدم والحراسة وتصميم فاخر جداً.",
    publishedAt: "2026-05-20",
    featured: true
  },
  {
    id: "prop-4",
    slug: "apartment-5-rooms-salama-114",
    title: "شقة 5 غرف نموذجية - مشروع 114 السلامة",
    type: "apartment",
    status: "available",
    project: { id: "proj-3", name: "مشروع 114 السلامة", slug: "salama-114" },
    location: {
      city: "جدة",
      district: "السلامة",
      coordinates: { lat: 21.5833, lng: 39.1667 },
      address: "حي السلامة، جدة، المملكة العربية السعودية"
    },
    specs: {
      area: 215,
      bedrooms: 5,
      bathrooms: 4,
      parking: 1,
      floor: 2,
      kitchen: true,
      features: ["غرفة خادمة", "موقف خاص مغطى", "مصعد متطور", "خزان مياه مستقل"]
    },
    pricing: {
      price: 750000,
      pricePerMeter: 3488,
      currency: "SAR",
      isNegotiable: false,
      downPaymentPct: 10,
      monthlyInstallment: 4900
    },
    media: {
      images: ["/properties/apartment.webp"],
      thumbnail: "/properties/apartment.webp"
    },
    description: "شقة عائلية فاخرة تضم 5 غرف نوم وتوزيع هندسي مريح جداً. الشقة مجهزة بغرفة للخادمة وموقف خاص مستقل وخزانات مياه أرضية وعلوية مستقلة مع عداد كهرباء خاص.",
    publishedAt: "2026-05-22",
    featured: false
  },
  {
    id: "prop-5",
    slug: "apartment-4-rooms-front-salama-114",
    title: "شقة 4 غرف أمامية - مشروع 114 السلامة",
    type: "apartment",
    status: "available",
    project: { id: "proj-3", name: "مشروع 114 السلامة", slug: "salama-114" },
    location: {
      city: "جدة",
      district: "السلامة",
      coordinates: { lat: 21.5833, lng: 39.1667 },
      address: "حي السلامة، جدة، المملكة العربية السعودية"
    },
    specs: {
      area: 125.05,
      bedrooms: 4,
      bathrooms: 3,
      parking: 1,
      floor: 3,
      kitchen: true,
      features: ["موقف خاص", "مصعد مستقل", "إضاءة ليد ذكية"]
    },
    pricing: {
      price: 620000,
      pricePerMeter: 4958,
      currency: "SAR",
      isNegotiable: false,
      downPaymentPct: 10,
      monthlyInstallment: 4055
    },
    media: {
      images: ["/properties/apartment.webp"],
      thumbnail: "/properties/apartment.webp"
    },
    description: "شقة أمامية تطل مباشرة على الشارع الرئيسي وتتمتع بإضاءة شمس ممتازة وتوزيع داخلي ذكي يربط المطبخ وغرفة المعيشة وغرف النوم.",
    publishedAt: "2026-05-25",
    featured: false
  },
  {
    id: "prop-6",
    slug: "apartment-4-rooms-back-safaa",
    title: "شقة 4 غرف خلفية مميزة - جدة الصفا",
    type: "apartment",
    status: "available",
    project: { id: "none", name: "عمارات الصفا السكنية", slug: "independent" },
    location: {
      city: "جدة",
      district: "الصفا",
      coordinates: { lat: 21.59, lng: 39.20 },
      address: "حي الصفا، جدة، المملكة العربية السعودية"
    },
    specs: {
      area: 134.23,
      bedrooms: 4,
      bathrooms: 3,
      parking: 1,
      floor: 1,
      kitchen: true,
      features: ["موقف خاص", "مصعد عمارة", "خزانات مياه مستقلة"]
    },
    pricing: {
      price: 550000,
      pricePerMeter: 4097,
      currency: "SAR",
      isNegotiable: false,
      downPaymentPct: 10,
      monthlyInstallment: 3597
    },
    media: {
      images: ["/properties/apartment.webp"],
      thumbnail: "/properties/apartment.webp"
    },
    description: "شقة 4 غرف خلفية هادئة بحي الصفا بجدة بأسعار ممتازة جداً ومناسبة للتمويل العقاري. تشطيب متكامل وضمانات إنشائية شاملة.",
    publishedAt: "2026-05-26",
    featured: false
  },
  {
    id: "prop-7",
    slug: "apartment-4-rooms-rowdah-luxury",
    title: "شقة 4 غرف فاخرة - حي الروضة",
    type: "apartment",
    status: "available",
    project: { id: "proj-2", name: "مجمع أبو هايل أفينيو", slug: "abu-hail-avenue" },
    location: {
      city: "جدة",
      district: "الروضة",
      coordinates: { lat: 21.5667, lng: 39.15 },
      address: "حي الروضة، جدة، المملكة العربية السعودية"
    },
    specs: {
      area: 149.96,
      bedrooms: 4,
      bathrooms: 3,
      parking: 1,
      floor: 4,
      kitchen: true,
      features: ["موقف خاص", "مصعد ذكي", "تشطيبات فاخرة"]
    },
    pricing: {
      price: 1500000,
      pricePerMeter: 10002,
      currency: "SAR",
      isNegotiable: false,
      downPaymentPct: 10,
      monthlyInstallment: 9812
    },
    media: {
      images: ["/properties/apartment.webp"],
      thumbnail: "/properties/apartment.webp"
    },
    description: "شقة فخمة جداً في مجمع أبو هايل أفينيو بحي الروضة بجدة. تشطيبات فاخرة بالرخام والخشب الطبيعي وأنظمة إضاءة حديثة متوافقة بالكامل مع الكود السعودي.",
    publishedAt: "2026-05-28",
    featured: true
  },
  {
    id: "prop-8",
    slug: "penthouse-6-rooms-rowdah-large",
    title: "بنتهاوس 6 غرف كبير - حي الروضة",
    type: "penthouse",
    status: "available",
    project: { id: "proj-2", name: "مجمع أبو هايل أفينيو", slug: "abu-hail-avenue" },
    location: {
      city: "جدة",
      district: "الروضة",
      coordinates: { lat: 21.5667, lng: 39.15 },
      address: "حي الروضة، جدة، المملكة العربية السعودية"
    },
    specs: {
      area: 290,
      bedrooms: 6,
      bathrooms: 6,
      parking: 2,
      floor: 5,
      kitchen: true,
      features: ["غرفة خادمة", "مسبح خاص بالسطح", "جراج يتسع لسيارتين", "مصعد مستقل"]
    },
    pricing: {
      price: 2200000,
      pricePerMeter: 7586,
      currency: "SAR",
      isNegotiable: true,
      downPaymentPct: 15,
      monthlyInstallment: 14391
    },
    media: {
      images: ["/properties/penthouse.webp"],
      thumbnail: "/properties/penthouse.webp"
    },
    description: "بنتهاوس (روف سكني) استثنائي يمتد على مساحة 290 متر مربع ويحتوي على مسبح خاص بالسطح وفناء خارجي واسع مطل على الروضة بجدة. مجهز بـ 6 غرف نوم وجناح متكامل للخدم والطبخ.",
    publishedAt: "2026-05-30",
    featured: true
  },
  {
    id: "prop-9",
    slug: "penthouse-5-rooms-salama-114",
    title: "ملحق 5 غرف فاخر - مشروع 114 السلامة",
    type: "annex",
    status: "available",
    project: { id: "proj-3", name: "مشروع 114 السلامة", slug: "salama-114" },
    location: {
      city: "جدة",
      district: "السلامة",
      coordinates: { lat: 21.5833, lng: 39.1667 },
      address: "حي السلامة، جدة، المملكة العربية السعودية"
    },
    specs: {
      area: 243.3,
      bedrooms: 6,
      bathrooms: 5,
      parking: 1,
      floor: 4,
      kitchen: true,
      features: ["غرفة خادمة", "غرفة سائق", "موقف مستقل", "خزانات خاصة مجهّزة"]
    },
    pricing: {
      price: 900000,
      pricePerMeter: 3700,
      currency: "SAR",
      isNegotiable: false,
      downPaymentPct: 10,
      monthlyInstallment: 5887
    },
    media: {
      images: ["/properties/penthouse.webp"],
      thumbnail: "/properties/penthouse.webp"
    },
    description: "ملحق روف واسع ومميز يحتوي على 6 غرف نوم و5 حمامات ومساحات جلوس عائلية واسعة مع إطلالات رائعة على حي السلامة وضمانات كاملة للمبنى.",
    publishedAt: "2026-06-01",
    featured: false
  },
  {
    id: "prop-10",
    slug: "penthouse-4-rooms-abu-hail-950",
    title: "ملحق 4 غرف - مشروع أبو هايل أفينيو",
    type: "annex",
    status: "available",
    project: { id: "proj-2", name: "مجمع أبو هايل أفينيو", slug: "abu-hail-avenue" },
    location: {
      city: "جدة",
      district: "الروضة",
      coordinates: { lat: 21.5667, lng: 39.15 },
      address: "حي الروضة، جدة، المملكة العربية السعودية"
    },
    specs: {
      area: 195.44,
      bedrooms: 4,
      bathrooms: 3,
      parking: 1,
      kitchen: true,
      features: ["موقف خاص", "مصعد ذكي", "عزل حراري مائي"]
    },
    pricing: {
      price: 950000,
      pricePerMeter: 4860,
      currency: "SAR",
      isNegotiable: false,
      downPaymentPct: 10,
      monthlyInstallment: 6200
    },
    media: {
      images: ["/properties/penthouse.webp"],
      thumbnail: "/properties/penthouse.webp"
    },
    description: "ملحق فاخر ومميز يقع في مجمع أبو هايل أفينيو بحي الروضة بجدة. تشطيب سوبر لوكس بالكامل ومواصفات ممتازة وموقف مغطى خاص.",
    publishedAt: "2026-06-02",
    featured: false
  },
  {
    id: "prop-11",
    slug: "apartment-4-rooms-abu-hail-650",
    title: "شقة 4 غرف - مشروع أبو هايل أفينيو",
    type: "apartment",
    status: "available",
    project: { id: "proj-2", name: "مجمع أبو هايل أفينيو", slug: "abu-hail-avenue" },
    location: {
      city: "جدة",
      district: "الروضة",
      coordinates: { lat: 21.5667, lng: 39.15 },
      address: "حي الروضة، جدة، المملكة العربية السعودية"
    },
    specs: {
      area: 127.2,
      bedrooms: 4,
      bathrooms: 3,
      parking: 1,
      kitchen: true,
      features: ["موقف خاص", "مصعد مستقل", "إضاءة حديثة"]
    },
    pricing: {
      price: 650000,
      pricePerMeter: 5110,
      currency: "SAR",
      isNegotiable: false,
      downPaymentPct: 10,
      monthlyInstallment: 4250
    },
    media: {
      images: ["/properties/apartment.webp"],
      thumbnail: "/properties/apartment.webp"
    },
    description: "شقة سكنية ممتازة بـ 4 غرف نوم بمساحات رحبة وتصميم عائلي متوازن في حي الروضة الفاخر بجدة.",
    publishedAt: "2026-06-03",
    featured: false
  },
  {
    id: "prop-12",
    slug: "roof-5-rooms-abu-hail-580",
    title: "روف 5 غرف - مشروع أبو هايل أفينيو",
    type: "annex",
    status: "available",
    project: { id: "proj-2", name: "مجمع أبو هايل أفينيو", slug: "abu-hail-avenue" },
    location: {
      city: "جدة",
      district: "الروضة",
      coordinates: { lat: 21.5667, lng: 39.15 },
      address: "حي الروضة، جدة، المملكة العربية السعودية"
    },
    specs: {
      area: 251,
      bedrooms: 5,
      bathrooms: 4,
      parking: 1,
      kitchen: true,
      features: ["سطح واسع خاص", "غرفة خادمة", "موقف مغطى"]
    },
    pricing: {
      price: 580000,
      pricePerMeter: 2310,
      currency: "SAR",
      isNegotiable: false,
      downPaymentPct: 10,
      monthlyInstallment: 3800
    },
    media: {
      images: ["/properties/penthouse.webp"],
      thumbnail: "/properties/penthouse.webp"
    },
    description: "ملحق روف سكني واسع يتميز بوجود فناء خارجي ومساحات شاسعة تناسب المجالس العائلية والمناسبات.",
    publishedAt: "2026-06-04",
    featured: false
  },
  {
    id: "prop-13",
    slug: "apartment-5-rooms-abu-hail-750",
    title: "شقة 5 غرف - مشروع أبو هايل أفينيو",
    type: "apartment",
    status: "available",
    project: { id: "proj-2", name: "مجمع أبو هايل أفينيو", slug: "abu-hail-avenue" },
    location: {
      city: "جدة",
      district: "الروضة",
      coordinates: { lat: 21.5667, lng: 39.15 },
      address: "حي الروضة، جدة، المملكة العربية السعودية"
    },
    specs: {
      area: 215,
      bedrooms: 5,
      bathrooms: 4,
      parking: 1,
      kitchen: true,
      features: ["مجلس عائلي واسع", "خزان مستقل", "موقف مغطى"]
    },
    pricing: {
      price: 750000,
      pricePerMeter: 3488,
      currency: "SAR",
      isNegotiable: false,
      downPaymentPct: 10,
      monthlyInstallment: 4900
    },
    media: {
      images: ["/properties/apartment.webp"],
      thumbnail: "/properties/apartment.webp"
    },
    description: "شقة سكنية متكاملة الخدمات بمساحة 215م² وتصميم ذكي يحتوي على 5 غرف نوم واسعة بحي الروضة.",
    publishedAt: "2026-06-05",
    featured: false
  },
  {
    id: "prop-14",
    slug: "apartment-6-rooms-hattan-590",
    title: "شقة 6 غرف - مشروع هتان التيسير",
    type: "apartment",
    status: "available",
    project: { id: "proj-4", name: "مشروع هتان التيسير", slug: "hattan-tayseer" },
    location: {
      city: "جدة",
      district: "التيسير",
      coordinates: { lat: 21.59, lng: 39.23 },
      address: "حي التيسير، جدة، المملكة العربية السعودية"
    },
    specs: {
      area: 250,
      bedrooms: 6,
      bathrooms: 4,
      parking: 1,
      kitchen: true,
      features: ["مدخلان مستقلان", "مجلس رجال مستقل", "موقف خاص"]
    },
    pricing: {
      price: 590000,
      pricePerMeter: 2360,
      currency: "SAR",
      isNegotiable: false,
      downPaymentPct: 10,
      monthlyInstallment: 3860
    },
    media: {
      images: ["/properties/apartment.webp"],
      thumbnail: "/properties/apartment.webp"
    },
    description: "شقة واسعة جداً بـ 6 غرف ومجلس للرجال وصالون مستقل في حي التيسير، مناسبة تماماً للعوائل الباحثة عن الرحابة والسعر المناسب.",
    publishedAt: "2026-06-06",
    featured: false
  },
  {
    id: "prop-15",
    slug: "apartment-4-rooms-abu-hail-749",
    title: "شقة 4 غرف - مشروع أبو هايل أفينيو",
    type: "apartment",
    status: "available",
    project: { id: "proj-2", name: "مجمع أبو هايل أفينيو", slug: "abu-hail-avenue" },
    location: {
      city: "جدة",
      district: "الروضة",
      coordinates: { lat: 21.5667, lng: 39.15 },
      address: "حي الروضة، جدة، المملكة العربية السعودية"
    },
    specs: {
      area: 132,
      bedrooms: 4,
      bathrooms: 3,
      parking: 1,
      kitchen: true,
      features: ["موقف خاص مغطى", "إضاءة طبيعية ممتازة", "مصعد متطور"]
    },
    pricing: {
      price: 749000,
      pricePerMeter: 5674,
      currency: "SAR",
      isNegotiable: false,
      downPaymentPct: 10,
      monthlyInstallment: 4900
    },
    media: {
      images: ["/properties/apartment.webp"],
      thumbnail: "/properties/apartment.webp"
    },
    description: "شقة 4 غرف تتمتع بالخصوصية والتهوية الجيدة والإضاءة الطبيعية طوال اليوم في مجمع أبو هايل أفينيو.",
    publishedAt: "2026-06-07",
    featured: false
  },
  {
    id: "prop-16",
    slug: "roof-5-rooms-abu-hail-1199",
    title: "روف 5 غرف - مشروع أبو هايل أفينيو",
    type: "annex",
    status: "available",
    project: { id: "proj-2", name: "مجمع أبو هايل أفينيو", slug: "abu-hail-avenue" },
    location: {
      city: "جدة",
      district: "الروضة",
      coordinates: { lat: 21.5667, lng: 39.15 },
      address: "حي الروضة، جدة، المملكة العربية السعودية"
    },
    specs: {
      area: 222.5,
      bedrooms: 5,
      bathrooms: 4,
      parking: 1,
      kitchen: true,
      features: ["سطح خارجي مستقل", "موقف خاص مغطى", "مصعد مستقل"]
    },
    pricing: {
      price: 1199000,
      pricePerMeter: 5388,
      currency: "SAR",
      isNegotiable: true,
      downPaymentPct: 10,
      monthlyInstallment: 7850
    },
    media: {
      images: ["/properties/penthouse.webp"],
      thumbnail: "/properties/penthouse.webp"
    },
    description: "ملحق روف سكني يتمتع بإطلالة مفتوحة على الروضة ومساحات جلسات خارجية فخمة مصممة بأسلوب معاصر.",
    publishedAt: "2026-06-08",
    featured: false
  },
  {
    id: "prop-17",
    slug: "apartment-2-rooms-renad-489",
    title: "شقة 2 غرفه - مشروع ريناد غاليري",
    type: "apartment",
    status: "available",
    project: { id: "proj-5", name: "مشروع ريناد غاليري", slug: "renad-gallery" },
    location: {
      city: "جدة",
      district: "النعيم",
      coordinates: { lat: 21.61, lng: 39.17 },
      address: "حي النعيم، جدة، المملكة العربية السعودية"
    },
    specs: {
      area: 91.3,
      bedrooms: 2,
      bathrooms: 2,
      parking: 1,
      kitchen: true,
      features: ["موقف خاص مغطى", "خزان مستقل", "أنظمة ذكية"]
    },
    pricing: {
      price: 489000,
      pricePerMeter: 5355,
      currency: "SAR",
      isNegotiable: false,
      downPaymentPct: 10,
      monthlyInstallment: 3200
    },
    media: {
      images: ["/properties/apartment.webp"],
      thumbnail: "/properties/apartment.webp"
    },
    description: "شقة سكنية ممتازة بـ 2 غرفة نوم وتصميم هندسي عملي جداً واستغلال ذكي للمساحات في مشروع ريناد غاليري الراقي بجدة.",
    publishedAt: "2026-06-09",
    featured: false
  }
];
