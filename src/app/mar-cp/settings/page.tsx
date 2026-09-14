// src/app/mar-cp/settings/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import AdminBreadcrumb from '../../../components/admin/layout/AdminBreadcrumb';
import { uploadFile, deleteFile } from '../../../lib/supabase/storage';
import { compressImageToWebP } from '../../../lib/image';
import { getSiteSettings, saveSiteSettings } from '../../actions/settings';
import { toast } from 'sonner';
import {
  Image as ImageIcon,
  Type,
  BarChart2,
  Users,
  Quote,
  Phone,
  Globe,
  Save,
  Loader2,
  CheckCircle2,
  Upload,
  Share2,
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
  Mail,
  MapPin,
  ExternalLink,
} from 'lucide-react';

// Platform Brand SVG Icons
const XIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const WhatsAppIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 012.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 01-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1s.9 2.43 1.03 2.6c.13.17 1.77 2.7 4.28 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.07-.12-.23-.19-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.454 5.709 1.455h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const TikTokIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.95-4.49V8.58a8.3 8.3 0 0 0 4.82 1.54v-3.43h-.59z" />
  </svg>
);

const SnapchatIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.003 2c-3.74 0-6.02 2.72-6.02 5.56 0 1.25.43 2.5 1.09 3.42.13.18.17.41.1.62-.12.35-.61 1.05-1.57 1.34-.35.11-.53.47-.41.81.18.52.79.88 1.47.88.22 0 .44-.04.64-.11.29-.11.62.01.76.28.27.52.8 1.09 1.58 1.38-.61.35-1.53.72-2.58.91-.42.08-.7.46-.64.88.06.45.45.79.91.79.16 0 .32-.04.47-.11 1.21-.58 2.58-.87 3.69-.87 1.11 0 2.48.29 3.69.87.15.07.31.11.47.11.46 0 .85-.34.91-.79.06-.42-.22-.8-.64-.88-1.05-.19-1.97-.56-2.58-.91.78-.29 1.31-.86 1.58-1.38.14-.27.47-.39.76-.28.2.07.42.11.64.11.68 0 1.29-.36 1.47-.88.12-.34-.06-.7-.41-.81-.96-.29-1.45-.99-1.57-1.34-.07-.21-.03-.44.1-.62.66-.92 1.09-2.17 1.09-3.42 0-2.84-2.28-5.56-6.02-5.56z" />
  </svg>
);

type SettingsTab = 'hero' | 'stats' | 'testimonials' | 'partners' | 'contact' | 'seo';

const TABS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: 'hero', label: 'الصفحة الرئيسية', icon: ImageIcon },
  { id: 'stats', label: 'الإحصائيات', icon: BarChart2 },
  { id: 'testimonials', label: 'شهادات العملاء', icon: Quote },
  { id: 'partners', label: 'الشركاء', icon: Users },
  { id: 'contact', label: 'التواصل والسوشيال ميديا', icon: Share2 },
  { id: 'seo', label: 'SEO', icon: Globe },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('hero');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Social Links States
  const [socialX, setSocialX] = useState('');
  const [socialInstagram, setSocialInstagram] = useState('');
  const [socialFacebook, setSocialFacebook] = useState('');
  const [socialYoutube, setSocialYoutube] = useState('');
  const [socialTiktok, setSocialTiktok] = useState('');
  const [socialSnapchat, setSocialSnapchat] = useState('');
  const [socialLinkedin, setSocialLinkedin] = useState('');
  const [socialWhatsapp, setSocialWhatsapp] = useState('');

  // Contact States
  const [unifiedNumber, setUnifiedNumber] = useState('0568526666');
  const [mobileNumber, setMobileNumber] = useState('0568526666');
  const [companyEmail, setCompanyEmail] = useState('info@mar-ksa.com');
  const [address, setAddress] = useState('جدة، حي الصفا، شارع الأمير سلطان');

  // Hero States
  const [heroTitle, setHeroTitle] = useState('نعتمد أحدث التقنيات');
  const [heroSubtitle, setHeroSubtitle] = useState('لنربطكم بأفضل الفرص السكنية والاستثمارية');
  const [sliderImages, setSliderImages] = useState<string[]>([
    '/hero-bg-3.webp',
    '/hero-bg-luxury.webp',
    '/hero-bg-2.webp',
  ]);

  // Stats States
  const [statProjects, setStatProjects] = useState('75');
  const [statUnits, setStatUnits] = useState('850');
  const [statClients, setStatClients] = useState('1200');
  const [statYears, setStatYears] = useState('14');

  // SEO States
  const [seoTitle, setSeoTitle] = useState('شركة مار العقارية | عقارات فاخرة بالسعودية');
  const [seoDescription, setSeoDescription] = useState('حرفية تشييد وتميّز عقاري — نعتمد أحدث التقنيات لربط عملائنا بأفضل الفرص السكنية والاستثمارية');

  // Slider Image Upload States
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Load Settings on Mount
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const data = await getSiteSettings();
        if (!isMounted || !data) return;

        // Social
        if (data.social) {
          setSocialX(data.social.x || '');
          setSocialInstagram(data.social.instagram || '');
          setSocialFacebook(data.social.facebook || '');
          setSocialYoutube(data.social.youtube || '');
          setSocialTiktok(data.social.tiktok || '');
          setSocialSnapchat(data.social.snapchat || '');
          setSocialLinkedin(data.social.linkedin || '');
          setSocialWhatsapp(data.social.whatsapp || '');
        }

        // Contact
        if (data.contact) {
          setUnifiedNumber(data.contact.unifiedNumber || '');
          setMobileNumber(data.contact.mobileNumber || '');
          setCompanyEmail(data.contact.companyEmail || '');
          setAddress(data.contact.address || '');
        }

        // Hero
        if (data.hero) {
          setHeroTitle(data.hero.title || '');
          setHeroSubtitle(data.hero.subtitle || '');
          if (data.hero.sliderImages && data.hero.sliderImages.length > 0) {
            setSliderImages(data.hero.sliderImages);
          }
        }

        // Stats
        if (data.stats) {
          setStatProjects(data.stats.projects || '');
          setStatUnits(data.stats.units || '');
          setStatClients(data.stats.clients || '');
          setStatYears(data.stats.years || '');
        }

        // SEO
        if (data.seo) {
          setSeoTitle(data.seo.title || '');
          setSeoDescription(data.seo.description || '');
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        if (isMounted) setLoadingInitial(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const triggerImageChange = (index: number) => {
    setActiveImageIndex(index);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || activeImageIndex === null) return;

    const index = activeImageIndex;
    setUploadingIndex(index);

    try {
      const oldUrl = sliderImages[index];
      if (oldUrl && oldUrl.includes('/storage/')) {
        const getStoragePathFromUrl = (url: string) => {
          const match = url.match(/\/storage\/v1\/object\/public\/media\/(.+)$/);
          return match && match[1] ? decodeURIComponent(match[1]) : null;
        };
        const oldPath = getStoragePathFromUrl(oldUrl);
        if (oldPath) {
          await deleteFile('media', oldPath);
        }
      }

      const webpFile = await compressImageToWebP(file);
      const uniqueName = `hero-slider-${index}-${Date.now()}.webp`;
      const filePath = `settings/${uniqueName}`;

      const res = await uploadFile('media', filePath, webpFile, { contentType: 'image/webp' });
      if (res) {
        setSliderImages((prev) => {
          const next = [...prev];
          next[index] = res.url;
          return next;
        });
        toast.success(`تم تغيير الصورة ${index + 1} بنجاح`);
      }
    } catch (err: any) {
      console.error('Failed to change slider image:', err);
      toast.error('فشل تغيير الصورة: ' + (err.message || 'خطأ غير معروف'));
    } finally {
      setUploadingIndex(null);
      setActiveImageIndex(null);
      if (e.target) e.target.value = '';
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await saveSiteSettings({
        social: {
          x: socialX,
          instagram: socialInstagram,
          facebook: socialFacebook,
          youtube: socialYoutube,
          tiktok: socialTiktok,
          snapchat: socialSnapchat,
          linkedin: socialLinkedin,
          whatsapp: socialWhatsapp,
        },
        contact: {
          unifiedNumber,
          mobileNumber,
          companyEmail,
          address,
        },
        hero: {
          title: heroTitle,
          subtitle: heroSubtitle,
          sliderImages,
        },
        stats: {
          projects: statProjects,
          units: statUnits,
          clients: statClients,
          years: statYears,
        },
        seo: {
          title: seoTitle,
          description: seoDescription,
        },
      });

      if (res.success) {
        setSaved(true);
        toast.success('تم حفظ إعدادات الموقع وروابط السوشيال ميديا بنجاح');
        setTimeout(() => setSaved(false), 3000);
      } else {
        toast.error(res.error || 'حدث خطأ أثناء حفظ الإعدادات');
      }
    } catch (err: any) {
      toast.error('فشل حفظ الإعدادات: ' + (err.message || 'خطأ غير متوقع'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <AdminBreadcrumb items={[{ label: 'إعدادات الموقع' }]} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--neu-text-heading)]">إعدادات الموقع</h2>
          <p className="text-sm text-[var(--neu-text-muted)] mt-1">تحكم بكل محتويات الموقع من مكان واحد</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="neu-btn neu-btn-primary"
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> حفظ...</>
          ) : saved ? (
            <><CheckCircle2 className="w-4 h-4" /> تم الحفظ</>
          ) : (
            <><Save className="w-4 h-4" /> حفظ التغييرات</>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-stretch">
        {/* Tabs Sidebar */}
        <div className="lg:col-span-1 flex flex-col">
          <div className="neu-card p-3 space-y-1 h-full flex flex-col justify-start">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`sidebar-nav-item w-full ${activeTab === tab.id ? 'active' : ''}`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="lg:col-span-3 flex flex-col">
          {/* Hero Section */}
          {activeTab === 'hero' && (
            <div className="neu-card space-y-6 h-full">
              <h3 className="text-lg font-bold text-[var(--neu-text-heading)] border-b border-white/5 pb-4">
                إعدادات الصفحة الرئيسية (Hero)
              </h3>

              <div>
                <label className="neu-label" htmlFor="heroTitleInput">العنوان الرئيسي</label>
                <input id="heroTitleInput" type="text" placeholder="العنوان الرئيسي" title="العنوان الرئيسي" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} className="neu-input" />
              </div>

              <div>
                <label className="neu-label" htmlFor="heroSubtitleInput">العنوان الفرعي</label>
                <input id="heroSubtitleInput" type="text" placeholder="العنوان الفرعي" title="العنوان الفرعي" value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} className="neu-input" />
              </div>

              <div>
                <label className="neu-label">صور الخلفية (Hero Slider)</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                  {sliderImages.map((src, i) => (
                    <div key={i} className="relative h-32 rounded-xl overflow-hidden bg-[var(--neu-depressed)] group border border-white/5">
                      <Image
                        src={src}
                        alt={`صورة الخلفية ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => triggerImageChange(i)}
                          disabled={uploadingIndex !== null}
                          className="neu-btn neu-btn-primary neu-btn-sm"
                        >
                          {uploadingIndex === i ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Upload className="w-3.5 h-3.5" />
                          )}
                          <span>{uploadingIndex === i ? 'جاري الرفع...' : 'تغيير'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  title="تغيير صورة الخلفية"
                />
              </div>
            </div>
          )}

          {/* Stats Section */}
          {activeTab === 'stats' && (
            <div className="neu-card space-y-6 h-full">
              <h3 className="text-lg font-bold text-[var(--neu-text-heading)] border-b border-white/5 pb-4">
                أرقام الإحصائيات
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="neu-label" htmlFor="statProjectsInput">عدد المشاريع</label>
                  <input id="statProjectsInput" type="number" placeholder="عدد المشاريع" title="عدد المشاريع" value={statProjects} onChange={(e) => setStatProjects(e.target.value)} className="neu-input" dir="ltr" />
                </div>
                <div>
                  <label className="neu-label" htmlFor="statUnitsInput">عدد الوحدات</label>
                  <input id="statUnitsInput" type="number" placeholder="عدد الوحدات" title="عدد الوحدات" value={statUnits} onChange={(e) => setStatUnits(e.target.value)} className="neu-input" dir="ltr" />
                </div>
                <div>
                  <label className="neu-label" htmlFor="statClientsInput">عدد العملاء</label>
                  <input id="statClientsInput" type="number" placeholder="عدد العملاء" title="عدد العملاء" value={statClients} onChange={(e) => setStatClients(e.target.value)} className="neu-input" dir="ltr" />
                </div>
                <div>
                  <label className="neu-label" htmlFor="statYearsInput">سنوات الخبرة</label>
                  <input id="statYearsInput" type="number" placeholder="سنوات الخبرة" title="سنوات الخبرة" value={statYears} onChange={(e) => setStatYears(e.target.value)} className="neu-input" dir="ltr" />
                </div>
              </div>
            </div>
          )}

          {/* Testimonials */}
          {activeTab === 'testimonials' && (
            <div className="neu-card h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[var(--neu-text-heading)]">شهادات العملاء</h3>
                <button className="neu-btn neu-btn-secondary neu-btn-sm">
                  + إضافة شهادة
                </button>
              </div>
              <p className="text-sm text-[var(--neu-text-muted)]">
                سيتم ربط هذا القسم بقاعدة البيانات لإدارة الشهادات ديناميكياً.
              </p>
            </div>
          )}

          {/* Partners */}
          {activeTab === 'partners' && (
            <div className="neu-card h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[var(--neu-text-heading)]">الشركاء</h3>
                <button className="neu-btn neu-btn-secondary neu-btn-sm">
                  + إضافة شريك
                </button>
              </div>
              <p className="text-sm text-[var(--neu-text-muted)]">
                سيتم ربط هذا القسم بقاعدة البيانات لإدارة الشركاء ديناميكياً.
              </p>
            </div>
          )}

          {/* Contact & Social Media */}
          {activeTab === 'contact' && (
            <div className="neu-card space-y-8 h-full">
              {/* Section 1: Social Media Accounts */}
              <div className="space-y-4">
                <div className="border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-[var(--neu-gold)]" />
                    <h3 className="text-lg font-bold text-[var(--neu-text-heading)]">
                      شبكات التواصل الاجتماعي
                    </h3>
                  </div>
                  <p className="text-xs text-[var(--neu-text-muted)] mt-1">
                    أدخل الروابط الرسمية لحسابات مار العقارية، وسيتم تحديثها فوراً في الفوتر وكافة صفحات الموقع
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Instagram */}
                  <div className="space-y-1.5">
                    <label className="neu-label flex items-center justify-between" htmlFor="socialInstagramInput">
                      <span className="flex items-center gap-2 text-xs font-semibold">
                        <span className="flex items-center justify-center size-6 rounded-md bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white">
                          <Instagram className="size-3.5" />
                        </span>
                        إنستغرام (Instagram)
                      </span>
                      {socialInstagram && (
                        <a
                          href={socialInstagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-[var(--neu-gold)] hover:underline flex items-center gap-1"
                        >
                          معاينة <ExternalLink className="size-2.5" />
                        </a>
                      )}
                    </label>
                    <input
                      id="socialInstagramInput"
                      type="url"
                      placeholder="https://instagram.com/mar.realestate/"
                      value={socialInstagram}
                      onChange={(e) => setSocialInstagram(e.target.value)}
                      className="neu-input font-mono text-xs"
                      dir="ltr"
                    />
                  </div>

                  {/* X / Twitter */}
                  <div className="space-y-1.5">
                    <label className="neu-label flex items-center justify-between" htmlFor="socialXInput">
                      <span className="flex items-center gap-2 text-xs font-semibold">
                        <span className="flex items-center justify-center size-6 rounded-md bg-black text-white border border-white/20">
                          <XIcon className="size-3.5" />
                        </span>
                        منصة إكس (Twitter)
                      </span>
                      {socialX && (
                        <a
                          href={socialX}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-[var(--neu-gold)] hover:underline flex items-center gap-1"
                        >
                          معاينة <ExternalLink className="size-2.5" />
                        </a>
                      )}
                    </label>
                    <input
                      id="socialXInput"
                      type="url"
                      placeholder="https://twitter.com/Mar_Real_Estate"
                      value={socialX}
                      onChange={(e) => setSocialX(e.target.value)}
                      className="neu-input font-mono text-xs"
                      dir="ltr"
                    />
                  </div>

                  {/* WhatsApp */}
                  <div className="space-y-1.5">
                    <label className="neu-label flex items-center justify-between" htmlFor="socialWhatsappInput">
                      <span className="flex items-center gap-2 text-xs font-semibold">
                        <span className="flex items-center justify-center size-6 rounded-md bg-[#25D366] text-white">
                          <WhatsAppIcon className="size-3.5" />
                        </span>
                        واتساب (رقم الهاتف أو الرابط)
                      </span>
                      {socialWhatsapp && (
                        <a
                          href={socialWhatsapp.startsWith('http') ? socialWhatsapp : `https://wa.me/${socialWhatsapp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-[var(--neu-gold)] hover:underline flex items-center gap-1"
                        >
                          معاينة <ExternalLink className="size-2.5" />
                        </a>
                      )}
                    </label>
                    <input
                      id="socialWhatsappInput"
                      type="text"
                      placeholder="+966568526666 أو رابط مباشر"
                      value={socialWhatsapp}
                      onChange={(e) => setSocialWhatsapp(e.target.value)}
                      className="neu-input font-mono text-xs"
                      dir="ltr"
                    />
                  </div>

                  {/* YouTube */}
                  <div className="space-y-1.5">
                    <label className="neu-label flex items-center justify-between" htmlFor="socialYoutubeInput">
                      <span className="flex items-center gap-2 text-xs font-semibold">
                        <span className="flex items-center justify-center size-6 rounded-md bg-[#FF0000] text-white">
                          <Youtube className="size-3.5" />
                        </span>
                        يوتيوب (YouTube)
                      </span>
                      {socialYoutube && (
                        <a
                          href={socialYoutube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-[var(--neu-gold)] hover:underline flex items-center gap-1"
                        >
                          معاينة <ExternalLink className="size-2.5" />
                        </a>
                      )}
                    </label>
                    <input
                      id="socialYoutubeInput"
                      type="url"
                      placeholder="https://youtube.com/@mar.realestate"
                      value={socialYoutube}
                      onChange={(e) => setSocialYoutube(e.target.value)}
                      className="neu-input font-mono text-xs"
                      dir="ltr"
                    />
                  </div>

                  {/* Facebook */}
                  <div className="space-y-1.5">
                    <label className="neu-label flex items-center justify-between" htmlFor="socialFacebookInput">
                      <span className="flex items-center gap-2 text-xs font-semibold">
                        <span className="flex items-center justify-center size-6 rounded-md bg-[#1877F2] text-white">
                          <Facebook className="size-3.5" />
                        </span>
                        فيسبوك (Facebook)
                      </span>
                      {socialFacebook && (
                        <a
                          href={socialFacebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-[var(--neu-gold)] hover:underline flex items-center gap-1"
                        >
                          معاينة <ExternalLink className="size-2.5" />
                        </a>
                      )}
                    </label>
                    <input
                      id="socialFacebookInput"
                      type="url"
                      placeholder="https://facebook.com/Mar1RealEstate"
                      value={socialFacebook}
                      onChange={(e) => setSocialFacebook(e.target.value)}
                      className="neu-input font-mono text-xs"
                      dir="ltr"
                    />
                  </div>

                  {/* TikTok */}
                  <div className="space-y-1.5">
                    <label className="neu-label flex items-center justify-between" htmlFor="socialTiktokInput">
                      <span className="flex items-center gap-2 text-xs font-semibold">
                        <span className="flex items-center justify-center size-6 rounded-md bg-black text-white border border-white/20">
                          <TikTokIcon className="size-3.5" />
                        </span>
                        تيك توك (TikTok)
                      </span>
                      {socialTiktok && (
                        <a
                          href={socialTiktok}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-[var(--neu-gold)] hover:underline flex items-center gap-1"
                        >
                          معاينة <ExternalLink className="size-2.5" />
                        </a>
                      )}
                    </label>
                    <input
                      id="socialTiktokInput"
                      type="url"
                      placeholder="https://www.tiktok.com/@mar.realestate"
                      value={socialTiktok}
                      onChange={(e) => setSocialTiktok(e.target.value)}
                      className="neu-input font-mono text-xs"
                      dir="ltr"
                    />
                  </div>

                  {/* Snapchat */}
                  <div className="space-y-1.5">
                    <label className="neu-label flex items-center justify-between" htmlFor="socialSnapchatInput">
                      <span className="flex items-center gap-2 text-xs font-semibold">
                        <span className="flex items-center justify-center size-6 rounded-md bg-[#FFFC00] text-black">
                          <SnapchatIcon className="size-3.5 fill-black text-black" />
                        </span>
                        سناب شات (Snapchat)
                      </span>
                      {socialSnapchat && (
                        <a
                          href={socialSnapchat}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-[var(--neu-gold)] hover:underline flex items-center gap-1"
                        >
                          معاينة <ExternalLink className="size-2.5" />
                        </a>
                      )}
                    </label>
                    <input
                      id="socialSnapchatInput"
                      type="url"
                      placeholder="https://www.snapchat.com/add/mar.realestate"
                      value={socialSnapchat}
                      onChange={(e) => setSocialSnapchat(e.target.value)}
                      className="neu-input font-mono text-xs"
                      dir="ltr"
                    />
                  </div>

                  {/* LinkedIn */}
                  <div className="space-y-1.5">
                    <label className="neu-label flex items-center justify-between" htmlFor="socialLinkedinInput">
                      <span className="flex items-center gap-2 text-xs font-semibold">
                        <span className="flex items-center justify-center size-6 rounded-md bg-[#0A66C2] text-white">
                          <Linkedin className="size-3.5" />
                        </span>
                        لينكد إن (LinkedIn)
                      </span>
                      {socialLinkedin && (
                        <a
                          href={socialLinkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-[var(--neu-gold)] hover:underline flex items-center gap-1"
                        >
                          معاينة <ExternalLink className="size-2.5" />
                        </a>
                      )}
                    </label>
                    <input
                      id="socialLinkedinInput"
                      type="url"
                      placeholder="https://www.linkedin.com/company/mar-realestate/"
                      value={socialLinkedin}
                      onChange={(e) => setSocialLinkedin(e.target.value)}
                      className="neu-input font-mono text-xs"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Direct Contact Information */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-[var(--neu-gold)]" />
                    <h3 className="text-lg font-bold text-[var(--neu-text-heading)]">
                      بيانات الاتصال والمقر
                    </h3>
                  </div>
                  <p className="text-xs text-[var(--neu-text-muted)] mt-1">
                    أرقام الهواتف الرسمية والبريد الإلكتروني وعنوان المقر الرئيسي للشركة
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="neu-label flex items-center gap-1.5" htmlFor="unifiedNumberInput">
                      <Phone className="size-3 text-[var(--neu-gold)]" />
                      الرقم الموحد / الهاتف الرئيسي
                    </label>
                    <input
                      id="unifiedNumberInput"
                      type="text"
                      placeholder="0568526666"
                      value={unifiedNumber}
                      onChange={(e) => setUnifiedNumber(e.target.value)}
                      className="neu-input font-mono"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="neu-label flex items-center gap-1.5" htmlFor="mobileNumberInput">
                      <Phone className="size-3 text-[var(--neu-gold)]" />
                      رقم الجوال / خدمة العملاء
                    </label>
                    <input
                      id="mobileNumberInput"
                      type="text"
                      placeholder="0568526666"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className="neu-input font-mono"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="neu-label flex items-center gap-1.5" htmlFor="companyEmailInput">
                      <Mail className="size-3 text-[var(--neu-gold)]" />
                      البريد الإلكتروني الرسمي
                    </label>
                    <input
                      id="companyEmailInput"
                      type="email"
                      placeholder="info@mar-ksa.com"
                      value={companyEmail}
                      onChange={(e) => setCompanyEmail(e.target.value)}
                      className="neu-input font-mono"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="neu-label flex items-center gap-1.5" htmlFor="addressInput">
                      <MapPin className="size-3 text-[var(--neu-gold)]" />
                      مقر الشركة والعنوان
                    </label>
                    <input
                      id="addressInput"
                      type="text"
                      placeholder="جدة، حي الصفا، شارع الأمير سلطان"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="neu-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SEO */}
          {activeTab === 'seo' && (
            <div className="neu-card space-y-6 h-full">
              <h3 className="text-lg font-bold text-[var(--neu-text-heading)] border-b border-white/5 pb-4">
                إعدادات محركات البحث (SEO)
              </h3>
              <div>
                <label className="neu-label" htmlFor="seoTitleInput">عنوان الصفحة الرئيسية (Title Tag)</label>
                <input id="seoTitleInput" type="text" placeholder="عنوان الصفحة الرئيسية" title="عنوان الصفحة الرئيسية" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className="neu-input" />
                <p className="text-xs text-[var(--neu-text-muted)] mt-1">{seoTitle.length}/60 حرف</p>
              </div>
              <div>
                <label className="neu-label" htmlFor="seoDescriptionInput">وصف الصفحة (Meta Description)</label>
                <textarea id="seoDescriptionInput" placeholder="وصف الصفحة" title="وصف الصفحة" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} className="neu-input neu-textarea" rows={3} />
                <p className="text-xs text-[var(--neu-text-muted)] mt-1">{seoDescription.length}/160 حرف</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
