// src/components/admin/ProjectForm.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Save,
  X,
  Upload,
  Plus,
  Trash2,
  FolderKanban,
  MapPin,
  CircleDollarSign,
  Layers,
  Sparkles,
  Eye,
  Loader2,
  Check,
  Star,
  FileSpreadsheet,
  Link2,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';
import { createProject, updateProject, getProjectById, fetchGoogleSheetCsvData } from '../../app/actions/properties';
import { getCloudinarySignature } from '../../app/actions/cloudinary';
import { uploadFile, deleteFile } from '../../lib/supabase/storage';
import { compressImageToWebP } from '../../lib/image';
import AdminSelect from './AdminSelect';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface ProjectFormProps {
  initialData?: any;
  projectId?: string;
}

type ProjectTab = 'basic' | 'location' | 'media' | 'stats' | 'import';

const PROJECT_STATUSES = [
  { value: 'under_construction', label: 'تحتر الإنشاء' },
  { value: 'completed', label: 'مكتمل' },
  { value: 'upcoming', label: 'قريباً / قادم' },
];

const SAUDI_CITIES = [
  { value: 'جدة', label: 'جدة' },
  { value: 'الرياض', label: 'الرياض' },
  { value: 'مكة المكرمة', label: 'مكة المكرمة' },
  { value: 'المدينة المنورة', label: 'المدينة المنورة' },
  { value: 'الدمام', label: 'الدمام' },
  { value: 'الخبر', label: 'الخبر' },
  { value: 'الطائف', label: 'الطائف' },
  { value: 'أبها', label: 'أبها' },
];

export default function ProjectForm({ initialData, projectId }: ProjectFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ProjectTab>('basic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [name, setName] = useState(initialData?.name || '');
  const [tagline, setTagline] = useState(initialData?.tagline || '');
  const [status, setStatus] = useState(initialData?.status || 'upcoming');
  const [description, setDescription] = useState(initialData?.description || '');
  const [featured, setFeatured] = useState(initialData?.featured || false);
  const [published, setPublished] = useState(initialData?.published || false);

  // Location State
  const [city, setCity] = useState(initialData?.city || 'جدة');
  const isInitialCityManual = initialData?.city ? !SAUDI_CITIES.some(c => c.value === initialData.city) : false;
  const [isManualCity, setIsManualCity] = useState(isInitialCityManual);
  const [district, setDistrict] = useState(initialData?.district || '');
  const [address, setAddress] = useState(initialData?.address || '');

  // Stats / Numbers State
  const [priceMin, setPriceMin] = useState(initialData?.price_min || '');
  const [priceMax, setPriceMax] = useState(initialData?.price_max || '');
  const [totalUnits, setTotalUnits] = useState(initialData?.total_units || '');
  const [availableUnits, setAvailableUnits] = useState(initialData?.available_units || '');
  const [completionDate, setCompletionDate] = useState(initialData?.completion_date || '');

  // Media State
  const [heroImage, setHeroImage] = useState(initialData?.hero_image || '');
  const [gallery, setGallery] = useState<string[]>(initialData?.gallery || []);
  const [videos, setVideos] = useState<string[]>(initialData?.videos || []);
  const [brochureUrl, setBrochureUrl] = useState(initialData?.brochure_url || '');

  // Upload States
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingBrochure, setUploadingBrochure] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [typedVideoUrl, setTypedVideoUrl] = useState('');

  // Import State
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState('');
  const [importingSheets, setImportingSheets] = useState(false);
  const [parsedProperties, setParsedProperties] = useState<any[]>([]);

  const heroInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const brochureInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

const getStoragePathFromUrl = (url: string) => {
  if (!url) return null;
  const match = url.match(/\/storage\/v1\/object\/public\/media\/(.+)$/);
  if (match && match[1]) {
    return decodeURIComponent(match[1]);
  }
  return null;
};

  // Auto populate address on city/district change
  useEffect(() => {
    if (district && city) {
      setAddress((prev: string) => prev || `حي ${district}، ${city}`);
    }
  }, [district, city]);

  // Handle Hero Image Upload
  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingHero(true);
    try {
      if (heroImage) {
        const oldPath = getStoragePathFromUrl(heroImage);
        if (oldPath) {
          await deleteFile('media', oldPath);
        }
      }
      // Compress to WebP
      const compressedFile = await compressImageToWebP(file);
      
      const uploadPath = `projects/hero-${Date.now()}.webp`;
      const result = await uploadFile('media', uploadPath, compressedFile);
      if (result) {
        setHeroImage(result.url);
        toast.success('تم رفع الصورة الرئيسية بنجاح');
      } else {
        toast.error('فشل رفع الصورة');
      }
    } catch (err: any) {
      console.error('Hero upload error:', err);
      toast.error('فشل رفع الصورة: ' + (err.message || 'خطأ غير معروف'));
    } finally {
      setUploadingHero(false);
    }
  };

  // Handle Project Brochure PDF Upload
  const handleBrochureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('الرجاء اختيار ملف PDF فقط');
      return;
    }

    setUploadingBrochure(true);
    try {
      if (brochureUrl) {
        const oldPath = getStoragePathFromUrl(brochureUrl);
        if (oldPath) {
          await deleteFile('media', oldPath);
        }
      }
      
      const uploadPath = `projects/brochure-${Date.now()}.pdf`;
      const result = await uploadFile('media', uploadPath, file, { contentType: 'application/pdf' });
      if (result) {
        setBrochureUrl(result.url);
        toast.success('تم رفع بروفايل المشروع بنجاح');
      } else {
        toast.error('فشل رفع ملف البروفايل');
      }
    } catch (err: any) {
      console.error('Brochure upload error:', err);
      toast.error('فشل رفع الملف: ' + (err.message || 'خطأ غير معروف'));
    } finally {
      setUploadingBrochure(false);
    }
  };

  // Handle Gallery Images Upload
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingGallery(true);
    let uploadedUrls: string[] = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const compressedFile = await compressImageToWebP(file);
        
        const uploadPath = `projects/gallery-${Date.now()}-${i}.webp`;
        const result = await uploadFile('media', uploadPath, compressedFile);
        if (result) {
          uploadedUrls.push(result.url);
        }
      }
      setGallery((prev) => [...prev, ...uploadedUrls]);
      toast.success(`تم رفع ${files.length} صور بنجاح`);
    } catch (err: any) {
      console.error('Gallery upload error:', err);
      toast.error('فشل رفع الصور: ' + (err.message || 'خطأ غير معروف'));
    } finally {
      setUploadingGallery(false);
    }
  };

  // Remove Gallery Image
  const removeGalleryImage = (indexToRemove: number) => {
    setGallery((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Add typed video URL
  const addVideoUrl = () => {
    if (!typedVideoUrl) return;
    setVideos((prev) => [...prev, typedVideoUrl]);
    setTypedVideoUrl('');
    toast.success('تم إضافة رابط الفيديو');
  };

  // Remove video URL
  const removeVideoUrl = (indexToRemove: number) => {
    setVideos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Upload Video to Cloudinary
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingVideo(true);
    setVideoProgress(10);
    setError('');

    try {
      const signData = await getCloudinarySignature();

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', signData.apiKey);
      formData.append('timestamp', signData.timestamp.toString());
      formData.append('signature', signData.signature);
      formData.append('folder', signData.folder);
      formData.append('transformation', signData.transformation);

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${signData.cloudName}/video/upload`, true);

        xhr.upload.addEventListener('progress', (progressEvent) => {
          if (progressEvent.lengthComputable) {
            const pct = Math.round((progressEvent.loaded * 90) / progressEvent.total) + 10;
            setVideoProgress(pct);
          }
        });

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const res = JSON.parse(xhr.responseText);
            setVideos((prev: string[]) => [...prev, res.secure_url]);
            toast.success('تم رفع الفيديو بنجاح');
            resolve();
          } else {
            reject(new Error(xhr.responseText || 'فشل الرفع إلى Cloudinary'));
          }
        };

        xhr.onerror = () => reject(new Error('خطأ في الاتصال بالشبكة'));
        xhr.send(formData);
      });
    } catch (err: any) {
      setError(err.message || 'فشل رفع الفيديو الترويجي');
      toast.error('حدث خطأ أثناء رفع الفيديو');
    } finally {
      setUploadingVideo(false);
      setVideoProgress(0);
    }
  };

  // Parse Excel File on client side
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });

        // Try to parse Project Info from Sheet 1 if workbook has multiple sheets,
        // and parse units from Sheet 2 or single sheet.
        processWorkbook(wb);
      } catch (err: any) {
        console.error('Excel parsing error:', err);
        toast.error('حدث خطأ أثناء قراءة ملف الإكسل: ' + err.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Parse Google Sheets Link via Server Action (avoids CORS and CSP browser errors)
  const handleGoogleSheetsImport = async () => {
    if (!googleSheetsUrl) {
      toast.error('الرجاء إدخال رابط جدول بيانات جوجل أولاً');
      return;
    }

    setImportingSheets(true);
    try {
      const result = await fetchGoogleSheetCsvData(googleSheetsUrl);
      if (!result.success || !result.csvData) {
        throw new Error(result.error || 'فشل استيراد البيانات من جوجل شيتس');
      }

      const wb = XLSX.read(result.csvData, { type: 'string' });
      processWorkbook(wb);
    } catch (err: any) {
      console.error('Google Sheets import error:', err);
      toast.error(err.message || 'فشل استيراد البيانات من جوجل شيتس');
    } finally {
      setImportingSheets(false);
    }
  };

  // Helper to process workbook structure
  const processWorkbook = (wb: XLSX.WorkBook) => {
    // 1. Check if we have Project Metadata Sheet
    let hasMetadata = false;
    let projectMeta: any = {};
    let unitsData: any[] = [];

    // Let's inspect the sheets
    const firstSheetName = wb.SheetNames[0];
    const firstSheet = wb.Sheets[firstSheetName];
    const rawData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[];

    // If first row has keys like Name, tagline, and first column contains values,
    // or if the workbook contains multiple sheets where the first has very few columns.
    if (wb.SheetNames.length > 1) {
      hasMetadata = true;
      // Sheet 1 is Project Metadata
      const metaJson = XLSX.utils.sheet_to_json(firstSheet) as any[];
      // We look for key-value rows
      metaJson.forEach((row: any) => {
        const keys = Object.keys(row);
        const key = row[keys[0]]?.toString().trim();
        const value = row[keys[1]]?.toString().trim();
        if (key && value) {
          projectMeta[key] = value;
        }
      });

      // Sheet 2 is Units
      const secondSheetName = wb.SheetNames[1];
      const secondSheet = wb.Sheets[secondSheetName];
      unitsData = XLSX.utils.sheet_to_json(secondSheet) as any[];
    } else {
      // Single sheet: Check if it's key-value pairs or a table of properties
      const headers = rawData[0] || [];
      const looksLikeTable = headers.some((h: any) => 
        ['السعر', 'المساحة', 'نوع العقار', 'السعر الإجمالي', 'price', 'area', 'type'].includes(h?.toString().trim())
      );

      if (looksLikeTable) {
        unitsData = XLSX.utils.sheet_to_json(firstSheet) as any[];
      } else {
        // Key-value pairs for project
        rawData.forEach((row: any) => {
          if (row[0] && row[1]) {
            projectMeta[row[0].toString().trim()] = row[1].toString().trim();
          }
        });
      }
    }

    // 2. Populate Project States
    if (Object.keys(projectMeta).length > 0) {
      const getVal = (arabicKey: string, englishKey: string) => {
        return projectMeta[arabicKey] || projectMeta[englishKey] || '';
      };

      if (getVal('اسم المشروع', 'Project Name')) setName(getVal('اسم المشروع', 'Project Name'));
      if (getVal('العبارة الترويجية', 'Tagline')) setTagline(getVal('العبارة الترويجية', 'Tagline'));
      if (getVal('المدينة', 'City')) setCity(getVal('المدينة', 'City'));
      if (getVal('الحي', 'District')) setDistrict(getVal('الحي', 'District'));
      if (getVal('العنوان', 'Address')) setAddress(getVal('العنوان', 'Address'));
      if (getVal('الوصف', 'Description')) setDescription(getVal('الوصف', 'Description'));
      if (getVal('الحد الأدنى للسعر', 'Price Min')) setPriceMin(getVal('الحد الأدنى للسعر', 'Price Min'));
      if (getVal('الحد الأقصى للسعر', 'Price Max')) setPriceMax(getVal('الحد الأقصى للسعر', 'Price Max'));
      if (getVal('إجمالي الوحدات', 'Total Units')) setTotalUnits(getVal('إجمالي الوحدات', 'Total Units'));
      if (getVal('الوحدات المتاحة', 'Available Units')) setAvailableUnits(getVal('الوحدات المتاحة', 'Available Units'));
      if (getVal('تاريخ التسليم', 'Completion Date')) setCompletionDate(getVal('تاريخ التسليم', 'Completion Date'));

      const statusVal = getVal('الحالة', 'Status');
      if (statusVal === 'completed' || statusVal === 'مكتمل') setStatus('completed');
      else if (statusVal === 'under_construction' || statusVal === 'تحت الإنشاء') setStatus('under_construction');
      else if (statusVal === 'upcoming' || statusVal === 'قادم') setStatus('upcoming');
    }

    // 3. Map Units (Properties)
    if (unitsData.length > 0) {
      const mappedProperties = unitsData.map((row: any) => {
        const getRowVal = (arabicKey: string, englishKey: string) => {
          return row[arabicKey] || row[englishKey] || '';
        };

        // Normalize property type
        let rawType = getRowVal('نوع العقار', 'Type')?.toString().trim().toLowerCase();
        let finalType = 'apartment';
        if (['شقة', 'apartment', 'apartments'].includes(rawType)) finalType = 'apartment';
        else if (['فيلا', 'villa', 'villas'].includes(rawType)) finalType = 'villa';
        else if (['ملحق', 'annex', 'annexes'].includes(rawType)) finalType = 'annex';
        else if (['بنتهاوس', 'penthouse'].includes(rawType)) finalType = 'penthouse';
        else if (['دوبلكس', 'duplex'].includes(rawType)) finalType = 'duplex';

        // Normalize status
        let rawStatus = getRowVal('الحالة', 'Status')?.toString().trim().toLowerCase();
        let finalStatus = 'available';
        if (['متاح', 'available'].includes(rawStatus)) finalStatus = 'available';
        else if (['محجوز', 'reserved'].includes(rawStatus)) finalStatus = 'reserved';
        else if (['مباع', 'sold'].includes(rawStatus)) finalStatus = 'sold';
        else if (['قريبا', 'coming_soon', 'coming soon'].includes(rawStatus)) finalStatus = 'coming_soon';

        // Normalize direction
        let rawDir = getRowVal('الواجهة', 'Direction')?.toString().trim().toLowerCase();
        let finalDir = 'north';
        if (['شمال', 'شمالية', 'north'].includes(rawDir)) finalDir = 'north';
        else if (['جنوب', 'جنوبية', 'south'].includes(rawDir)) finalDir = 'south';
        else if (['شرق', 'شرقية', 'east'].includes(rawDir)) finalDir = 'east';
        else if (['غرب', 'غربية', 'west'].includes(rawDir)) finalDir = 'west';

        // Parse features
        let rawFeatures = getRowVal('المميزات', 'Features') || '';
        let finalFeatures: string[] = [];
        if (typeof rawFeatures === 'string' && rawFeatures.trim()) {
          finalFeatures = rawFeatures.split(',').map((f: string) => f.trim());
        } else if (Array.isArray(rawFeatures)) {
          finalFeatures = rawFeatures.map((f: any) => String(f).trim());
        }

        return {
          title: getRowVal('عنوان الوحدة', 'Title') || getRowVal('اسم الوحدة', 'Name') || 'وحدة سكنية جديدة',
          type: finalType,
          status: finalStatus,
          price: parseFloat(getRowVal('السعر', 'Price')) || 0,
          pricePerMeter: parseFloat(getRowVal('سعر المتر', 'Price Per Meter')) || 0,
          area: parseFloat(getRowVal('المساحة', 'Area')) || 0,
          bedrooms: parseInt(getRowVal('غرف النوم', 'Bedrooms')) || 3,
          bathrooms: parseInt(getRowVal('دورات المياه', 'Bathrooms')) || 3,
          livingRooms: parseInt(getRowVal('الصالات', 'Living Rooms')) || 1,
          parking: parseInt(getRowVal('المواقف', 'Parking')) || 1,
          floor: getRowVal('الدور', 'Floor'),
          totalFloors: getRowVal('عدد الأدوار', 'Total Floors'),
          view: getRowVal('الإطلالة', 'View') || '',
          direction: finalDir,
          features: finalFeatures,
          description: getRowVal('الوصف', 'Description') || '',
        };
      });

      setParsedProperties(mappedProperties);
      toast.success(`تم استخراج ${mappedProperties.length} وحدة بنجاح! سيتم إضافتهم فور حفظ المشروع.`);
    } else {
      toast.success('تم تحميل وتعديل بيانات المشروع بنجاح');
    }
  };

  // Submit form (Save changes or Create)
  const handleSubmit = async (e: React.FormEvent, redirectAfterSave?: string) => {
    e.preventDefault();
    if (!name) {
      toast.error('الرجاء إدخال اسم المشروع');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const payload = {
      name,
      tagline,
      status,
      city,
      district,
      address,
      description,
      heroImage,
      gallery,
      videos,
      priceMin: priceMin || 0,
      priceMax: priceMax || 0,
      totalUnits: totalUnits || 0,
      availableUnits: availableUnits || 0,
      completionDate,
      featured,
      published,
      brochureUrl,
    };

    try {
      let result;
      if (projectId) {
        result = await updateProject(projectId, payload, parsedProperties);
      } else {
        result = await createProject(payload, parsedProperties);
      }

      if (result.success) {
        toast.success(projectId ? 'تم تحديث المشروع بنجاح!' : 'تم إنشاء المشروع بنجاح!');
        setParsedProperties([]); // Reset after insert
        
        if (redirectAfterSave) {
          router.push(redirectAfterSave + `?projectId=${result.data.id}`);
        } else {
          router.push('/mar-cp/projects');
        }
      } else {
        setError(result.error || 'حدث خطأ أثناء الحفظ');
        toast.error(result.error || 'حدث خطأ أثناء الحفظ');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'حدث خطأ غير متوقع');
      toast.error('حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--neu-text-heading)]">
            {projectId ? 'تعديل بيانات المشروع' : 'إضافة مشروع جديد للشركة'}
          </h2>
          <p className="text-xs text-[var(--neu-text-muted)] mt-1">
            أدخل مواصفات وموقع وتفاصيل المشروع السكني
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Action to Save & Add Property */}
          <button
            type="button"
            onClick={(e) => {
              if (projectId) {
                router.push(`/mar-cp/properties/new?projectId=${projectId}`);
              } else {
                handleSubmit(e, '/mar-cp/properties/new');
              }
            }}
            disabled={loading}
            className="neu-btn neu-btn-ghost text-xs text-[var(--neu-gold)] border-[var(--neu-gold)]/20 hover:bg-[var(--neu-gold)]/10"
          >
            <PlusCircle className="w-4 h-4" />
            حفظ وإضافة وحدة لهذا المشروع
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="neu-btn neu-btn-primary py-2.5 px-5 text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                حفظ المشروع
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-[var(--neu-danger)]/10 border border-[var(--neu-danger)]/20 p-4 rounded-2xl flex items-center gap-3 text-[var(--neu-danger)] text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs list */}
      <div className="flex border-b border-white/5 overflow-x-auto pb-px gap-1">
        {(
          [
            { id: 'basic', label: 'البيانات الأساسية', icon: FolderKanban },
            { id: 'location', label: 'الموقع الجغرافي', icon: MapPin },
            { id: 'stats', label: 'الأرقام والإحصائيات', icon: CircleDollarSign },
            { id: 'media', label: 'الصور والوسائط', icon: Layers },
            { id: 'import', label: 'استيراد (Excel/Google)', icon: FileSpreadsheet },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[var(--neu-gold)] text-[var(--neu-gold)]'
                  : 'border-transparent text-[var(--neu-text-muted)] hover:text-[var(--neu-text-secondary)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="mt-6">
        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className="neu-card space-y-6">
            <h3 className="text-base font-bold text-[var(--neu-text-heading)] border-b border-white/5 pb-3">
              البيانات الرئيسية للمشروع
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="neu-label" htmlFor="projectNameInput">اسم المشروع *</label>
                <input
                  id="projectNameInput"
                  type="text"
                  required
                  placeholder="مثال: ريناد غاليري"
                  title="اسم المشروع"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="neu-input"
                />
              </div>

              <div>
                <label className="neu-label" htmlFor="projectTaglineInput">العبارة الترويجية (Tagline)</label>
                <input
                  id="projectTaglineInput"
                  type="text"
                  placeholder="مثال: نمط عيش استثنائي في قلب جدة"
                  title="العبارة الترويجية"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="neu-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="neu-label">حالة المشروع</label>
                <AdminSelect
                  options={PROJECT_STATUSES}
                  value={status}
                  onChange={setStatus}
                />
              </div>

              <div className="flex items-center gap-6 pt-8">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="sr-only peer"
                    title="مشروع مميز"
                  />
                  <div className="w-5 h-5 rounded bg-[var(--neu-depressed)] border border-white/10 flex items-center justify-center peer-checked:bg-[var(--neu-gold)] peer-checked:border-0 transition-all">
                    {featured && <Check className="w-3.5 h-3.5 text-[var(--neu-bg-primary)] stroke-[3]" />}
                  </div>
                  <span className="text-sm font-semibold text-[var(--neu-text-heading)]">تمييز المشروع (Featured)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="sr-only peer"
                    title="نشر المشروع"
                  />
                  <div className="w-5 h-5 rounded bg-[var(--neu-depressed)] border border-white/10 flex items-center justify-center peer-checked:bg-[var(--neu-gold)] peer-checked:border-0 transition-all">
                    {published && <Check className="w-3.5 h-3.5 text-[var(--neu-bg-primary)] stroke-[3]" />}
                  </div>
                  <span className="text-sm font-semibold text-[var(--neu-text-heading)]">نشر المشروع فوراً (Published)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="neu-label" htmlFor="projectDescInput">وصف تفصيلي للمشروع</label>
              <textarea
                id="projectDescInput"
                placeholder="اكتب وصفاً جذاباً وشاملاً للمشروع والخدمات المتاحة..."
                title="وصف تفصيلي للمشروع"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="neu-input neu-textarea"
                rows={5}
              />
            </div>
          </div>
        )}

        {/* Location Tab */}
        {activeTab === 'location' && (
          <div className="neu-card space-y-6">
            <h3 className="text-base font-bold text-[var(--neu-text-heading)] border-b border-white/5 pb-3">
              موقع المشروع
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="neu-label">المدينة</label>
                {!isManualCity ? (
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <AdminSelect
                        options={SAUDI_CITIES}
                        value={city}
                        onChange={setCity}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsManualCity(true);
                        setCity('');
                      }}
                      className="neu-btn neu-btn-secondary text-xs px-3"
                    >
                      إدخال يدوي
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="مثال: الخبر"
                      title="المدينة يدوياً"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="neu-input flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIsManualCity(false);
                        setCity('جدة');
                      }}
                      className="neu-btn neu-btn-secondary text-xs px-3"
                    >
                      اختر من القائمة
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="neu-label" htmlFor="projectDistrictInput">الحي *</label>
                <input
                  id="projectDistrictInput"
                  type="text"
                  required
                  placeholder="مثال: النعيم"
                  title="الحي"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="neu-input"
                />
              </div>
            </div>

            <div>
              <label className="neu-label" htmlFor="projectAddressInput">العنوان بالكامل</label>
              <input
                id="projectAddressInput"
                type="text"
                placeholder="مثال: شارع النعيم، حي النعيم، جدة"
                title="العنوان بالكامل"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="neu-input"
              />
            </div>
          </div>
        )}

        {/* Stats & Numbers Tab */}
        {activeTab === 'stats' && (
          <div className="neu-card space-y-6">
            <h3 className="text-base font-bold text-[var(--neu-text-heading)] border-b border-white/5 pb-3">
              تفاصيل الأرقام والأسعار والوحدات
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="neu-label" htmlFor="priceMinInput">السعر الأدنى للوحدات (ر.س)</label>
                <input
                  id="priceMinInput"
                  type="number"
                  placeholder="مثال: 550000"
                  title="السعر الأدنى"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="neu-input"
                />
              </div>

              <div>
                <label className="neu-label" htmlFor="priceMaxInput">السعر الأعلى للوحدات (ر.س)</label>
                <input
                  id="priceMaxInput"
                  type="number"
                  placeholder="مثال: 1200000"
                  title="السعر الأعلى"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="neu-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="neu-label" htmlFor="totalUnitsInput">إجمالي عدد الوحدات بالمشروع</label>
                <input
                  id="totalUnitsInput"
                  type="number"
                  placeholder="مثال: 48"
                  title="إجمالي عدد الوحدات"
                  value={totalUnits}
                  onChange={(e) => setTotalUnits(e.target.value)}
                  className="neu-input"
                />
              </div>

              <div>
                <label className="neu-label" htmlFor="availableUnitsInput">عدد الوحدات المتاحة حالياً</label>
                <input
                  id="availableUnitsInput"
                  type="number"
                  placeholder="مثال: 12"
                  title="عدد الوحدات المتاحة"
                  value={availableUnits}
                  onChange={(e) => setAvailableUnits(e.target.value)}
                  className="neu-input"
                />
              </div>

              <div>
                <label className="neu-label" htmlFor="completionDateInput">تاريخ الانتهاء والتسليم</label>
                <input
                  id="completionDateInput"
                  type="text"
                  placeholder="مثال: الربع الأول 2027"
                  title="تاريخ التسليم"
                  value={completionDate}
                  onChange={(e) => setCompletionDate(e.target.value)}
                  className="neu-input"
                />
              </div>
            </div>
          </div>
        )}

        {/* Media Tab */}
        {activeTab === 'media' && (
          <div className="neu-card space-y-6">
            <h3 className="text-base font-bold text-[var(--neu-text-heading)] border-b border-white/5 pb-3">
              الصور والمقاطع الترويجية
            </h3>

            {/* Hero Image */}
            <div>
              <label className="neu-label">الصورة الرئيسية للمشروع (Hero Banner) *</label>
              {heroImage ? (
                <div className="relative h-64 rounded-2xl overflow-hidden bg-[var(--neu-depressed)] border border-white/5 mt-2 group">
                  <Image src={heroImage} alt="Hero Preview" fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => heroInputRef.current?.click()}
                      className="neu-btn neu-btn-primary text-xs"
                    >
                      تغيير الصورة
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeroImage('')}
                      className="neu-btn neu-btn-danger text-xs bg-red-600 hover:bg-red-500 border-0"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => heroInputRef.current?.click()}
                  className="border-2 border-dashed border-white/10 hover:border-[var(--neu-gold)]/40 hover:bg-[var(--neu-gold)]/5 transition-all p-8 rounded-2xl text-center cursor-pointer mt-2"
                >
                  <Upload className="w-8 h-8 text-[var(--neu-gold)] mx-auto mb-3" />
                  <p className="text-sm font-semibold text-[var(--neu-text-heading)]">
                    {uploadingHero ? 'جاري الرفع وضغط الصورة...' : 'اضغط لرفع الصورة الرئيسية للمشروع'}
                  </p>
                  <p className="text-xs text-[var(--neu-text-muted)] mt-1">
                    صورة أفقية عالية الجودة (يفضل WebP أو JPG)
                  </p>
                </div>
              )}
              <input
                ref={heroInputRef}
                type="file"
                accept="image/*"
                onChange={handleHeroUpload}
                className="hidden"
                title="رفع الصورة الرئيسية"
              />
            </div>

            {/* Gallery Images */}
            <div>
              <label className="neu-label">معرض صور المشروع (Gallery)</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 mt-2">
                {gallery.map((img, idx) => (
                  <div key={idx} className="relative h-32 rounded-xl overflow-hidden bg-[var(--neu-depressed)] group border border-white/5">
                    <Image src={img} alt="Gallery Preview" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(idx)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-red-500 hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                
                <div
                  onClick={() => galleryInputRef.current?.click()}
                  className="border-2 border-dashed border-white/10 hover:border-[var(--neu-gold)]/40 hover:bg-[var(--neu-gold)]/5 transition-all h-32 rounded-xl flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload className="w-6 h-6 text-[var(--neu-gold)] mb-2" />
                  <span className="text-[10px] text-[var(--neu-text-secondary)]">
                    {uploadingGallery ? 'جاري رفع الصور...' : 'رفع صور المعرض'}
                  </span>
                </div>
              </div>
              <input
                ref={galleryInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleGalleryUpload}
                className="hidden"
                title="رفع صور المعرض"
              />
            </div>

            {/* Video Urls */}
            <div>
              <label className="neu-label">مقاطع الفيديو الترويجية للمشروع</label>
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <input
                  type="url"
                  placeholder="أدخل رابط فيديو العرض (YouTube / Cloudinary)..."
                  title="رابط الفيديو"
                  value={typedVideoUrl}
                  onChange={(e) => setTypedVideoUrl(e.target.value)}
                  className="neu-input flex-1"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addVideoUrl}
                    className="neu-btn neu-btn-gold px-4 whitespace-nowrap"
                  >
                    إضافة رابط
                  </button>
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className="neu-btn neu-btn-secondary px-4 whitespace-nowrap"
                    disabled={uploadingVideo}
                  >
                    {uploadingVideo ? (
                      <div className="flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>جاري الرفع ({videoProgress}%)</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5 inline ms-1" />
                        <span>رفع مقطع فيديو</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleVideoUpload}
                title="رفع ملف فيديو للمشروع"
              />
              
              {videos.length > 0 && (
                <div className="space-y-2 mt-3">
                  {videos.map((vid, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[var(--neu-depressed)] border border-white/5 text-xs">
                      <span className="truncate max-w-[80%] text-[var(--neu-text-heading)] font-mono">{vid}</span>
                      <button
                        type="button"
                        onClick={() => removeVideoUrl(idx)}
                        className="text-red-500 hover:text-red-400 font-semibold"
                      >
                        إزالة
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Project Brochure PDF */}
            <div className="space-y-2 mt-6 pt-6 border-t border-white/5">
              <label className="neu-label text-[var(--neu-text-heading)] font-bold">بروفايل المشروع (PDF Brochure)</label>
              <p className="text-xs text-[var(--neu-text-muted)] leading-relaxed">
                ارفع ملف بروفايل المشروع بصيغة PDF ليتمكن الزوار من تحميله وتصفحه مباشرة من صفحة تفاصيل المشروع.
              </p>
              {brochureUrl ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--neu-depressed)] border border-white/5 text-xs mt-2">
                  <div className="flex items-center gap-2 max-w-[80%]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="truncate text-[var(--neu-text-heading)] font-mono">{brochureUrl.split('/').pop() || 'brochure.pdf'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={brochureUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--neu-gold)] hover:underline font-semibold"
                    >
                      عرض الملف
                    </a>
                    <button
                      type="button"
                      onClick={async () => {
                        if (brochureUrl) {
                          const path = getStoragePathFromUrl(brochureUrl);
                          if (path) {
                            await deleteFile('media', path);
                          }
                          setBrochureUrl('');
                          toast.success('تم إزالة الملف بنجاح');
                        }
                      }}
                      className="text-red-500 hover:text-red-400 font-semibold"
                    >
                      إزالة
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => brochureInputRef.current?.click()}
                    className="neu-btn neu-btn-secondary px-4 whitespace-nowrap text-xs"
                    disabled={uploadingBrochure}
                  >
                    {uploadingBrochure ? (
                      <div className="flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>جاري الرفع...</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5 inline ms-1" />
                        <span>رفع ملف PDF</span>
                      </>
                    )}
                  </button>
                </div>
              )}
              <input
                ref={brochureInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleBrochureUpload}
                title="رفع ملف بروفايل المشروع (PDF)"
              />
            </div>

          </div>
        )}

        {/* Import Tab (Excel / Google Sheets) */}
        {activeTab === 'import' && (
          <div className="neu-card space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-base font-bold text-[var(--neu-text-heading)] border-b border-white/5 pb-3">
                استيراد بيانات المشروع والشقق بالكامل
              </h3>
              <p className="text-xs text-[var(--neu-text-muted)] mt-1.5 leading-relaxed">
                تسمح لك هذه الميزة برفع ملف Excel أو ربط جدول Google Sheets يحتوي على تفاصيل المشروع وكافة الوحدات السكنية (الشقق) التابعة له. سيقوم النظام بتحليل الملف فوراً وإدراجها كعقارات تحت اسم هذا المشروع عند حفظ النموذج.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Option A: Excel Upload */}
              <div className="p-5 rounded-2xl bg-[var(--neu-depressed)] border border-white/5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <FileSpreadsheet className="w-5 h-5 text-[var(--neu-gold)]" />
                    <h4 className="text-sm font-bold text-[var(--neu-text-heading)]">استيراد عبر ملف Excel المحلي</h4>
                  </div>
                  <p className="text-xs text-[var(--neu-text-secondary)] mb-4 leading-relaxed">
                    قم برفع ملف `.xlsx` أو `.csv` بالهيكل المعتمد. سيقوم المتصفح بقراءته محلياً لتحديث النموذج الحالي.
                  </p>
                </div>
                
                <div>
                  <button
                    type="button"
                    onClick={() => excelInputRef.current?.click()}
                    className="neu-btn neu-btn-gold w-full py-2.5 text-xs font-bold"
                  >
                    اختر ملف إكسل (.xlsx)
                  </button>
                  <input
                    ref={excelInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleExcelUpload}
                    className="hidden"
                    title="تحميل ملف إكسل"
                  />
                </div>
              </div>

              {/* Option B: Google Sheets URL */}
              <div className="p-5 rounded-2xl bg-[var(--neu-depressed)] border border-white/5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Link2 className="w-5 h-5 text-[var(--neu-gold)]" />
                    <h4 className="text-sm font-bold text-[var(--neu-text-heading)]">استيراد مباشر من Google Sheets</h4>
                  </div>
                  <p className="text-xs text-[var(--neu-text-secondary)] mb-4 leading-relaxed">
                    الصق رابط جدول بيانات جوجل (يجب أن يكون خيار المشاركة متاحاً كـ "عرض للجميع").
                  </p>
                </div>

                <div className="space-y-2">
                  <input
                    type="url"
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    title="رابط جدول بيانات جوجل"
                    value={googleSheetsUrl}
                    onChange={(e) => setGoogleSheetsUrl(e.target.value)}
                    className="neu-input text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleGoogleSheetsImport}
                    disabled={importingSheets}
                    className="neu-btn neu-btn-secondary w-full py-2.5 text-xs font-bold"
                  >
                    {importingSheets ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        جاري جلب وتحليل البيانات...
                      </>
                    ) : (
                      'جلب البيانات الآن'
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Parsed Units Preview Table */}
            {parsedProperties.length > 0 && (
              <div className="border border-white/5 rounded-2xl overflow-hidden mt-6 animate-in slide-in-from-bottom-3 duration-300">
                <div className="bg-white/[0.02] p-4 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-bold text-[var(--neu-text-heading)]">
                      تم استخراج {parsedProperties.length} وحدة سكنية جاهزة للاستيراد
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setParsedProperties([])}
                    className="text-xs text-red-500 hover:text-red-400 font-semibold"
                  >
                    إلغاء الاستيراد
                  </button>
                </div>

                <div className="overflow-x-auto max-h-72">
                  <table className="w-full text-right border-collapse text-xs">
                    <thead>
                      <tr className="bg-white/[0.01] border-b border-white/5 text-[var(--neu-text-muted)] font-semibold">
                        <th className="p-3">#</th>
                        <th className="p-3">عنوان الوحدة</th>
                        <th className="p-3">النوع</th>
                        <th className="p-3">المساحة</th>
                        <th className="p-3">الغرف / الحمامات</th>
                        <th className="p-3">السعر</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-[var(--neu-text-heading)]">
                      {parsedProperties.map((prop, index) => (
                        <tr key={index} className="hover:bg-white/[0.01]">
                          <td className="p-3 text-[var(--neu-text-muted)]">{index + 1}</td>
                          <td className="p-3 font-semibold">{prop.title}</td>
                          <td className="p-3">
                            {prop.type === 'apartment' ? 'شقة' : prop.type === 'villa' ? 'فيلا' : prop.type === 'annex' ? 'ملحق' : prop.type}
                          </td>
                          <td className="p-3">{prop.area} م²</td>
                          <td className="p-3">
                            {prop.bedrooms} غرف نوم / {prop.bathrooms} حمامات
                          </td>
                          <td className="p-3 text-[var(--neu-gold)] font-bold">
                            {prop.price ? prop.price.toLocaleString('en-US') : 'غير محدد'} ر.س
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </form>
  );
}
