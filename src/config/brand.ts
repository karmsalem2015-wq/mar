export const BRAND = {
  nameAr: 'مار العقارية',
  nameEn: 'MAR Real Estate',
  shortNameEn: 'MAR',
  descriptorAr: 'تطوير وبناء عقاري',
  promiseAr: 'العنوان الأول للاستثمار',
  storyAr:
    'خبرة ممتدة في البناء والتشييد، تجمع المعرفة الهندسية بالتنفيذ المتقن لصناعة عقارات جديرة بالثقة.',
  logo: '/heder-logo.png',
  headerLogo: '/heder-logo.png',
  footerLogo: '/mar-logo-gold-tight.png',
  logoDark: '/heder-logo.png',
  logoWhite: '/heder-logo.png',
  logoBlue: '/heder-logo.png',
  logoGold: '/heder-logo.png',
  icon: '/icon.png',
  contact: {
    cityAr: 'جدة، المملكة العربية السعودية',
    email: 'info@mar-ksa.com',
    primaryPhone: {
      display: '0560533337',
      tel: '+966560533337',
    },
    secondaryPhone: {
      display: '0568526666',
      tel: '+966568526666',
    },
  },
  social: {
    instagram: 'https://instagram.com/mar.realestate/',
    x: 'https://twitter.com/Mar_Real_Estate',
    facebook: 'https://facebook.com/Mar1RealEstate',
    youtube:
      'https://youtube.com/c/%D9%85%D8%A7%D8%B1%D8%A7%D9%84%D8%B9%D9%82%D8%A7%D8%B1%D9%8A%D8%A9',
  },
  website: 'https://mar-ksa.com',
} as const;

export const WHATSAPP_MESSAGE =
  'السلام عليكم، أرغب في معرفة الفرص العقارية المتاحة لدى مار العقارية.';

export const WHATSAPP_URL = `https://wa.me/${BRAND.contact.primaryPhone.tel.replace('+', '')}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
