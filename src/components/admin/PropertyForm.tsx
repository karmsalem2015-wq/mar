// src/components/admin/PropertyForm.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  Save,
  X,
  Upload,
  Plus,
  Trash2,
  Building2,
  MapPin,
  CircleDollarSign,
  Layers,
  Sparkles,
  Eye,
  Loader2,
  Check,
  Star,
  Map,
  Compass,
  Maximize,
  ArrowRight,
  Film,
  Percent,
  Waves,
  Trees,
  Car,
  Bed,
  UserCheck,
  Wind,
  ArrowUpDown,
  ShieldCheck,
  Cpu,
  Droplet,
  Zap,
} from 'lucide-react';
import { getProjectsList, createProperty, updateProperty, quickCreateProject } from '../../app/actions/properties';
import { getCloudinarySignature } from '../../app/actions/cloudinary';
import { uploadFile, deleteFile } from '../../lib/supabase/storage';
import { compressImageToWebP } from '../../lib/image';
import AdminSelect from './AdminSelect';
import MapPicker from './MapPicker';

interface PropertyFormProps {
  initialData?: any; // If editing
  propertyId?: string;
}

const PROPERTY_TYPES = [
  { value: 'apartment', label: 'شقة' },
  { value: 'villa', label: 'فيلا' },
  { value: 'annex', label: 'ملحق' },
  { value: 'penthouse', label: 'بنتهاوس' },
  { value: 'duplex', label: 'دوبلكس' },
];

const PROPERTY_STATUSES = [
  { value: 'available', label: 'متاح' },
  { value: 'reserved', label: 'محجوز' },
  { value: 'sold', label: 'مُباع' },
  { value: 'coming_soon', label: 'قريباً' },
];

const PROPERTY_DIRECTIONS = [
  { value: 'north', label: 'شمالية' },
  { value: 'south', label: 'جنوبية' },
  { value: 'east', label: 'شرقية' },
  { value: 'west', label: 'غربية' },
  { value: 'corner', label: 'زاوية' },
];

const numOptions = (max: number, start = 1) =>
  Array.from({ length: max - start + 1 }, (_, i) => ({ value: String(start + i), label: String(start + i) }));

const zeroStartOptions = (max: number) => numOptions(max, 0);

const AVAILABLE_FEATURES = [
  { id: 'pool', label: 'مسبح خاص' },
  { id: 'garden', label: 'حديقة خاصة' },
  { id: 'parking', label: 'موقف سيارات خاص' },
  { id: 'maid_room', label: 'غرفة خادمة' },
  { id: 'driver_room', label: 'غرفة سائق' },
  { id: 'central_ac', label: 'تكييف مركزي' },
  { id: 'elevator', label: 'مصعد خاص' },
  { id: 'security', label: 'حراسة وأمن' },
  { id: 'smart', label: 'منزل ذكي (Smart Home)' },
  { id: 'view', label: 'إطلالة بحرية/مفتوحة' },
  { id: 'water_tank', label: 'خزان مياه مستقل' },
  { id: 'electricity_meter', label: 'عداد كهرباء مستقل' },
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

const FEATURE_ICONS: Record<string, React.ComponentType<any>> = {
  pool: Waves,
  garden: Trees,
  parking: Car,
  maid_room: Bed,
  driver_room: UserCheck,
  central_ac: Wind,
  elevator: ArrowUpDown,
  security: ShieldCheck,
  smart: Cpu,
  view: Eye,
  water_tank: Droplet,
  electricity_meter: Zap,
};

export default function PropertyForm({ initialData, propertyId }: PropertyFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlProjectId = searchParams.get('projectId') || '';
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [title, setTitle] = useState(initialData?.title || '');
  const [type, setType] = useState(initialData?.type || 'apartment');
  const [status, setStatus] = useState(initialData?.status || 'available');
  const [projectId, setProjectId] = useState(initialData?.project_id || urlProjectId);
  const [description, setDescription] = useState(initialData?.description || '');
  const [featured, setFeatured] = useState(initialData?.featured || false);
  const [published, setPublished] = useState(initialData?.published || false);

  // Pricing State
  const [price, setPrice] = useState(initialData?.price || '');
  const [pricePerMeter, setPricePerMeter] = useState(initialData?.price_per_meter || '');
  const [isNegotiable, setIsNegotiable] = useState(initialData?.is_negotiable || false);
  const [downPaymentPct, setDownPaymentPct] = useState(initialData?.down_payment_pct || '');
  const [monthlyInstallment, setMonthlyInstallment] = useState(initialData?.monthly_installment || '');

  // Location State
  const [city, setCity] = useState(initialData?.city || 'جدة');
  const isInitialCityManual = initialData?.city ? !SAUDI_CITIES.some(c => c.value === initialData.city) : false;
  const [isManualCity, setIsManualCity] = useState(isInitialCityManual);
  const [district, setDistrict] = useState(initialData?.district || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [lat, setLat] = useState(initialData?.lat || '');
  const [lng, setLng] = useState(initialData?.lng || '');
  const [googleMapsLink, setGoogleMapsLink] = useState('');

  // Specs State
  const [area, setArea] = useState(initialData?.area || '');
  const [bedrooms, setBedrooms] = useState(initialData?.bedrooms || '3');
  const [bathrooms, setBathrooms] = useState(initialData?.bathrooms || '3');
  const [livingRooms, setLivingRooms] = useState(initialData?.living_rooms || '1');
  const [parking, setParking] = useState(initialData?.parking || '1');
  const [floor, setFloor] = useState(initialData?.floor !== null && initialData?.floor !== undefined ? initialData.floor : '');
  const [totalFloors, setTotalFloors] = useState(initialData?.total_floors !== null && initialData?.total_floors !== undefined ? initialData.total_floors : '');
  const [view, setView] = useState(initialData?.view || '');
  const [direction, setDirection] = useState(initialData?.direction || 'north');
  const [features, setFeatures] = useState<string[]>(initialData?.features || []);

  // Media State
  const [thumbnail, setThumbnail] = useState(initialData?.thumbnail || '');
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [videos, setVideos] = useState<string[]>(initialData?.videos || []);
  const [floorPlan, setFloorPlan] = useState(initialData?.floor_plan || '');
  const [virtualTour, setVirtualTour] = useState(initialData?.virtual_tour || '');

  // File Upload State
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingFloorPlan, setUploadingFloorPlan] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingVirtualTour, setUploadingVirtualTour] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [hasInstallment, setHasInstallment] = useState(initialData?.down_payment_pct || initialData?.monthly_installment ? true : false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectCity, setNewProjectCity] = useState('');
  const [newProjectDistrict, setNewProjectDistrict] = useState('');
  const [quickProjectLoading, setQuickProjectLoading] = useState(false);
  const [quickProjectError, setQuickProjectError] = useState('');
  const [typedVideoUrl, setTypedVideoUrl] = useState('');

  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const floorPlanInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const virtualTourInputRef = useRef<HTMLInputElement>(null);

  // Fetch Projects List on Mount
  useEffect(() => {
    async function loadProjects() {
      const data = await getProjectsList();
      setProjects(data);
    }
    loadProjects();
  }, []);

  // Synchronize location fields when projectId is selected
  useEffect(() => {
    if (projectId) {
      const selectedProject = projects.find((proj) => proj.id === projectId);
      if (selectedProject) {
        setCity(selectedProject.city || 'جدة');
        setDistrict(selectedProject.district || '');
        setAddress(selectedProject.address || '');
      }
    }
  }, [projectId, projects]);

  // Parse Google Maps Link for Lat/Lng if possible
  useEffect(() => {
    if (googleMapsLink) {
      try {
        const match = googleMapsLink.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (match && match[1] && match[2]) {
          setLat(match[1]);
          setLng(match[2]);
        }
      } catch (err) {
        console.error('Failed to parse google maps link coordinates:', err);
      }
    }
  }, [googleMapsLink]);

  // Calculate Price per Meter automatically if Area changes
  useEffect(() => {
    if (price && area && Number(area) > 0) {
      setPricePerMeter(Math.round(Number(price) / Number(area)));
    }
  }, [price, area]);

  // Handle Feature Checkbox Change
  const handleFeatureToggle = (featureId: string) => {
    setFeatures((prev) =>
      prev.includes(featureId) ? prev.filter((id) => id !== featureId) : [...prev, featureId]
    );
  };

  // Submit new project details quickly from modal
  const handleQuickProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName || !newProjectCity || !newProjectDistrict) {
      setQuickProjectError('يرجى ملء كافة الحقول المطلوبة');
      return;
    }

    setQuickProjectLoading(true);
    setQuickProjectError('');

    try {
      const res = await quickCreateProject(newProjectName, newProjectCity, newProjectDistrict);
      if (res.success) {
        // Refresh project list
        const updatedProjects = await getProjectsList();
        setProjects(updatedProjects);
        // Select newly created project id
        setProjectId(res.data.id);
        // Reset states and close modal
        setShowNewProjectModal(false);
        setNewProjectName('');
        setNewProjectCity('');
        setNewProjectDistrict('');
      } else {
        setQuickProjectError(res.error || 'فشل إضافة المشروع');
      }
    } catch (err: any) {
      setQuickProjectError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setQuickProjectLoading(false);
    }
  };

const getStoragePathFromUrl = (url: string) => {
  if (!url) return null;
  const match = url.match(/\/storage\/v1\/object\/public\/media\/(.+)$/);
  if (match && match[1]) {
    return decodeURIComponent(match[1]);
  }
  return null;
};

  // Upload Thumbnail
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingThumbnail(true);
    setError('');

    try {
      if (thumbnail) {
        const oldPath = getStoragePathFromUrl(thumbnail);
        if (oldPath) {
          await deleteFile('media', oldPath);
        }
      }
      const webpFile = await compressImageToWebP(file);
      const uniqueName = `thumbnail-${Date.now()}.webp`;
      const filePath = `properties/${uniqueName}`;

      const res = await uploadFile('media', filePath, webpFile, { contentType: 'image/webp' });
      if (res) {
        setThumbnail(res.url);
      } else {
        throw new Error('فشل الرفع إلى الخادم');
      }
    } catch (err: any) {
      setError(err.message || 'فشل رفع الصورة المصغرة');
    } finally {
      setUploadingThumbnail(false);
    }
  };

  // Upload Gallery Images
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingGallery(true);
    setError('');

    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const webpFile = await compressImageToWebP(file);
        const uniqueName = `gallery-${Date.now()}-${i}.webp`;
        const filePath = `properties/gallery/${uniqueName}`;

        const res = await uploadFile('media', filePath, webpFile, { contentType: 'image/webp' });
        if (res) {
          uploadedUrls.push(res.url);
        }
      }
      setImages((prev) => [...prev, ...uploadedUrls]);
    } catch (err: any) {
      setError(err.message || 'فشل رفع ألبوم الصور');
    } finally {
      setUploadingGallery(false);
    }
  };

  // Upload Floor Plan
  const handleFloorPlanUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFloorPlan(true);
    setError('');

    try {
      if (floorPlan) {
        const oldPath = getStoragePathFromUrl(floorPlan);
        if (oldPath) {
          await deleteFile('media', oldPath);
        }
      }
      const webpFile = await compressImageToWebP(file);
      const uniqueName = `floorplan-${Date.now()}.webp`;
      const filePath = `properties/plans/${uniqueName}`;

      const res = await uploadFile('media', filePath, webpFile, { contentType: 'image/webp' });
      if (res) {
        setFloorPlan(res.url);
      } else {
        throw new Error('فشل الرفع إلى الخادم');
      }
    } catch (err: any) {
      setError(err.message || 'فشل رفع مخطط الطابق');
    } finally {
      setUploadingFloorPlan(false);
    }
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
            setVideos((prev) => [...prev, res.secure_url]);
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
    } finally {
      setUploadingVideo(false);
      setVideoProgress(0);
    }
  };

  // Upload Virtual Tour to Supabase
  const handleVirtualTourUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingVirtualTour(true);
    setError('');

    try {
      if (virtualTour) {
        const oldPath = getStoragePathFromUrl(virtualTour);
        if (oldPath) {
          await deleteFile('media', oldPath);
        }
      }
      const extension = file.name.split('.').pop() || 'html';
      const uniqueName = `tour-${Date.now()}.${extension}`;
      const filePath = `properties/tours/${uniqueName}`;

      const res = await uploadFile('media', filePath, file, { contentType: file.type || 'text/html' });
      if (res) {
        setVirtualTour(res.url);
      } else {
        throw new Error('فشل الرفع إلى الخادم');
      }
    } catch (err: any) {
      setError(err.message || 'فشل رفع الجولة الافتراضية');
    } finally {
      setUploadingVirtualTour(false);
    }
  };

  // Remove Gallery Image
  const removeGalleryImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Add typed video URL to list
  const addTypedVideo = () => {
    if (typedVideoUrl.trim()) {
      setVideos((prev) => [...prev, typedVideoUrl.trim()]);
      setTypedVideoUrl('');
    }
  };

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validations
    if (!title) {
      setError('يرجى إدخال عنوان العقار');
      setLoading(false);
      return;
    }
    if (!price || Number(price) <= 0) {
      setError('يرجى إدخال سعر صحيح للعقار');
      setLoading(false);
      return;
    }
    if (!area || Number(area) <= 0) {
      setError('يرجى إدخال مساحة صحيحة للعقار');
      setLoading(false);
      return;
    }
    if (!city || !district) {
      setError('يرجى إدخال المدينة والحي');
      setLoading(false);
      return;
    }

    const payload = {
      title,
      type,
      status,
      projectId,
      description,
      featured,
      published,
      price,
      pricePerMeter,
      isNegotiable,
      downPaymentPct,
      monthlyInstallment,
      city,
      district,
      address,
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null,
      area,
      bedrooms,
      bathrooms,
      livingRooms,
      parking,
      floor,
      totalFloors,
      view,
      direction,
      features,
      thumbnail,
      images,
      videos,
      floorPlan,
      virtualTour,
    };

    let result;
    if (propertyId) {
      result = await updateProperty(propertyId, payload);
    } else {
      result = await createProperty(payload);
    }

    if (result.success) {
      setSuccess(propertyId ? 'تم تحديث بيانات العقار بنجاح!' : 'تم إضافة العقار الجديد بنجاح!');
      setTimeout(() => {
        router.push('/mar-cp/properties');
        router.refresh();
      }, 1500);
    } else {
      setError(result.error || 'حدث خطأ أثناء حفظ البيانات');
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6 w-full pb-12">
        {/* Top Banner / Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[var(--neu-text-heading)]">
              {propertyId ? 'تعديل العقار الحالي' : 'إضافة عقار جديد'}
            </h2>
            <p className="text-sm text-[var(--neu-text-muted)] mt-1">
              أدخل كافة البيانات والمواصفات الفنية بالتفصيل لتظهر في واجهة العميل
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push('/mar-cp/properties')}
              className="neu-btn neu-btn-secondary"
              disabled={loading}
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="neu-btn neu-btn-primary flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {propertyId ? 'تحديث العقار' : 'حفظ ونشر'}
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="p-4 bg-[var(--neu-danger-bg)] border border-[var(--neu-danger-border)] text-[var(--neu-danger)] rounded-2xl text-sm flex items-center gap-2">
            <X className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-4 bg-[var(--neu-success-bg)] border border-[var(--neu-success-border)] text-[var(--neu-success)] rounded-2xl text-sm flex items-center gap-2">
            <Check className="w-5 h-5" />
            <span>{success}</span>
          </div>
        )}

        {/* Main Form Grid */}
        <div className="space-y-6">

          {/* Row 1: Basic Info & Pricing (Equal Heights side-by-side) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">

            {/* CARD 1: Basic Information (Takes 2/3 width) */}
            <div className="lg:col-span-2 neu-card flex flex-col h-full justify-between p-5 sm:p-6">
              <div>
                <div className="flex items-center gap-2 mb-6 border-b border-[var(--neu-depressed)] pb-3">
                  <Building2 className="w-5 h-5 text-[var(--neu-gold)]" />
                  <h3 className="font-bold text-[var(--neu-text-heading)]">البيانات الأساسية للمسكن</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="neu-label">عنوان العقار بالعربية *</label>
                    <div className="relative">
                      <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--neu-gold)]/60" />
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="مثال: شقة فاخرة 4 غرف - مشروع أمل ستارز"
                        className="neu-input neu-input-icon-right font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="neu-label">نوع العقار *</label>
                      <AdminSelect
                        value={type}
                        onChange={setType}
                        options={PROPERTY_TYPES}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="neu-label">حالة الإتاحة *</label>
                      <AdminSelect
                        value={status}
                        onChange={setStatus}
                        options={PROPERTY_STATUSES}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="neu-label">المشروع السكني</label>
                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <AdminSelect
                            value={projectId}
                            onChange={setProjectId}
                            options={[
                              { value: '', label: 'عقار منفصل (بدون مشروع)' },
                              ...projects.map((proj) => ({ value: proj.id, label: proj.name })),
                            ]}
                            className="w-full"
                            placeholder="عقار منفصل"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowNewProjectModal(true)}
                          className="neu-btn neu-btn-secondary p-2.5 rounded-xl shrink-0 border border-dashed border-[var(--neu-gold)]/40 text-[var(--neu-gold)] hover:bg-[var(--neu-gold)]/10 cursor-pointer"
                          title="إنشاء مشروع جديد"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="neu-label">الوصف التفصيلي والتسويقي للعقار</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="اكتب تفاصيل العقار ومميزاته وموقعه وعروض الشراء..."
                      rows={4}
                      className="neu-input neu-textarea"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 5: Pricing & Financial Information (Takes 1/3 width, matches CARD 1 height) */}
            <div className="lg:col-span-1 neu-card flex flex-col h-full justify-between p-5 sm:p-6">
              <div>
                <div className="flex items-center gap-2 mb-6 border-b border-[var(--neu-depressed)] pb-3">
                  <CircleDollarSign className="w-5 h-5 text-[var(--neu-gold)]" />
                  <h3 className="font-bold text-[var(--neu-text-heading)]">الأسعار وعروض التمويل</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="neu-label">سعر البيع الكامل (ر.س) *</label>
                    <div className="relative">
                      <CircleDollarSign className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--neu-gold)]" />
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="850000"
                        className="neu-input neu-input-icon-right font-semibold text-lg text-[var(--neu-gold)]"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="neu-label">سعر المتر المربع</label>
                      <div className="relative">
                        <Maximize className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--neu-text-muted)]/60" />
                        <input
                          type="number"
                          value={pricePerMeter}
                          onChange={(e) => setPricePerMeter(e.target.value)}
                          placeholder="7080"
                          className="neu-input neu-input-icon-right text-center"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col justify-end pb-3">
                      <button
                        type="button"
                        onClick={() => setIsNegotiable(!isNegotiable)}
                        className="flex items-center gap-2 text-xs font-semibold text-[var(--neu-text-secondary)] hover:text-[var(--neu-text-primary)] transition-colors text-right"
                      >
                        <span className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${isNegotiable ? 'border-[var(--neu-gold)] bg-[var(--neu-gold)] text-white' : 'border-[var(--neu-text-muted)]/40'
                          }`}>
                          {isNegotiable && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </span>
                        <span>قابل للتفاوض</span>
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-[var(--neu-depressed)] pt-4 mt-2">
                    <button
                      type="button"
                      onClick={() => setHasInstallment(!hasInstallment)}
                      className="flex items-center gap-2 text-xs font-bold text-[var(--neu-text-secondary)] hover:text-[var(--neu-text-primary)] transition-colors text-right mb-3 cursor-pointer"
                    >
                      <span className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${hasInstallment ? 'border-[var(--neu-gold)] bg-[var(--neu-gold)] text-white' : 'border-[var(--neu-text-muted)]/40'
                        }`}>
                        {hasInstallment && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </span>
                      <span>العقار يدعم أقساط التمويل العقاري</span>
                    </button>

                    {hasInstallment && (
                      <div className="space-y-3 animation-fade-in">
                        <div>
                          <label className="neu-label">نسبة الدفعة الأولى (%)</label>
                          <div className="relative">
                            <Percent className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--neu-text-muted)]/60" />
                            <input
                              type="number"
                              value={downPaymentPct}
                              onChange={(e) => setDownPaymentPct(e.target.value)}
                              placeholder="10"
                              className="neu-input neu-input-icon-right"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="neu-label">القسط الشهري المتوقع (ر.س)</label>
                          <div className="relative">
                            <CircleDollarSign className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--neu-text-muted)]/60" />
                            <input
                              type="number"
                              value={monthlyInstallment}
                              onChange={(e) => setMonthlyInstallment(e.target.value)}
                              placeholder="2500"
                              className="neu-input neu-input-icon-right"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Technical Specifications (Full-Width with 8 columns for input metrics) */}
          <div className="neu-card w-full">
            <div className="flex items-center gap-2 mb-6 border-b border-[var(--neu-depressed)] pb-3">
              <Layers className="w-5 h-5 text-[var(--neu-gold)]" />
              <h3 className="font-bold text-[var(--neu-text-heading)]">المواصفات الفنية والداخلية للمسكن</h3>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                <div>
                  <label className="neu-label text-center block">المساحة (م²) *</label>
                  <div className="relative">
                    <Maximize className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neu-gold)]/60" />
                    <input
                      type="number"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="120"
                      className="neu-input neu-input-icon-right text-center font-bold"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="neu-label text-center block">غرف النوم</label>
                  <AdminSelect
                    value={String(bedrooms)}
                    onChange={setBedrooms}
                    options={numOptions(10)}
                    className="w-full text-center"
                  />
                </div>
                <div>
                  <label className="neu-label text-center block">دورات المياه</label>
                  <AdminSelect
                    value={String(bathrooms)}
                    onChange={setBathrooms}
                    options={numOptions(10)}
                    className="w-full text-center"
                  />
                </div>
                <div>
                  <label className="neu-label text-center block">الصالات</label>
                  <AdminSelect
                    value={String(livingRooms)}
                    onChange={setLivingRooms}
                    options={zeroStartOptions(5)}
                    className="w-full text-center"
                  />
                </div>
                <div>
                  <label className="neu-label text-center block">رقم الدور</label>
                  <div className="relative">
                    <Layers className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neu-text-muted)]/60" />
                    <input
                      type="number"
                      value={floor}
                      onChange={(e) => setFloor(e.target.value)}
                      placeholder="2"
                      className="neu-input neu-input-icon-right text-center"
                    />
                  </div>
                </div>
                <div>
                  <label className="neu-label text-center block">إجمالي الأدوار</label>
                  <div className="relative">
                    <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neu-text-muted)]/60" />
                    <input
                      type="number"
                      value={totalFloors}
                      onChange={(e) => setTotalFloors(e.target.value)}
                      placeholder="5"
                      className="neu-input neu-input-icon-right text-center"
                    />
                  </div>
                </div>
                <div>
                  <label className="neu-label text-center block">مواقف السيارات</label>
                  <AdminSelect
                    value={String(parking)}
                    onChange={setParking}
                    options={zeroStartOptions(5)}
                    className="w-full text-center"
                  />
                </div>
                <div>
                  <label className="neu-label text-center block">واجهة العقار</label>
                  <AdminSelect
                    value={direction}
                    onChange={setDirection}
                    options={PROPERTY_DIRECTIONS}
                    className="w-full text-center font-bold text-[var(--neu-gold)]"
                  />
                </div>
              </div>

              <div>
                <label className="neu-label">إطلالة المسكن</label>
                <div className="relative">
                  <Compass className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--neu-text-muted)]/60" />
                  <input
                    type="text"
                    value={view}
                    onChange={(e) => setView(e.target.value)}
                    placeholder="مثال: إطلالة بحرية مباشرة، إطلالة على شارعين، على المسبح..."
                    className="neu-input neu-input-icon-right"
                  />
                </div>
              </div>

              {/* Amenities checkboxes (Expanded columns to fill width) */}
              <div>
                <label className="neu-label mb-3">الميزات الإضافية والخدمات التابعة</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {AVAILABLE_FEATURES.map((feat) => {
                    const isChecked = features.includes(feat.id);
                    const IconComponent = FEATURE_ICONS[feat.id] || Sparkles;
                    return (
                      <button
                        key={feat.id}
                        type="button"
                        onClick={() => handleFeatureToggle(feat.id)}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold transition-all duration-200 text-right ${isChecked
                          ? 'bg-[var(--neu-gold)]/10 border-[var(--neu-gold)] text-[var(--neu-gold)] shadow-inner'
                          : 'bg-[var(--neu-raised)] border-transparent text-[var(--neu-text-secondary)] hover:bg-[var(--neu-depressed)]'
                          }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border shrink-0 ${isChecked ? 'border-[var(--neu-gold)] bg-[var(--neu-gold)] text-white' : 'border-[var(--neu-text-muted)]/40'
                          }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </span>
                        <IconComponent className={`w-4 h-4 shrink-0 ${isChecked ? 'text-[var(--neu-gold)]' : 'text-[var(--neu-text-muted)]/60'}`} />
                        <span>{feat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Location Details (Full-Width with 4 and 2 column rows) */}
          <div className="neu-card w-full">
            <div className="flex items-center gap-2 mb-6 border-b border-[var(--neu-depressed)] pb-3">
              <MapPin className="w-5 h-5 text-[var(--neu-gold)]" />
              <h3 className="font-bold text-[var(--neu-text-heading)]">الموقع الجغرافي بالتفصيل</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="neu-label mb-0">المدينة *</label>
                    {projectId ? (
                      <span className="text-[10px] bg-[var(--neu-gold)]/10 text-[var(--neu-gold)] px-2 py-0.5 rounded-full font-bold">
                        تلقائي من المشروع
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsManualCity(!isManualCity)}
                        className="text-[10px] text-[var(--neu-gold)] font-bold hover:underline"
                      >
                        {isManualCity ? "اختر من القائمة" : "كتابة يدوية"}
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--neu-gold)]/60 z-10 pointer-events-none" />
                    {projectId ? (
                      <input
                        type="text"
                        value={city}
                        disabled
                        className="neu-input neu-input-icon-right opacity-70 bg-[var(--neu-depressed)] border-[var(--neu-depressed)]"
                      />
                    ) : isManualCity ? (
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="جدة"
                        className="neu-input neu-input-icon-right"
                        required
                      />
                    ) : (
                      <AdminSelect
                        value={city}
                        onChange={setCity}
                        options={SAUDI_CITIES}
                        className="w-full [&>button]:pr-11"
                      />
                    )}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="neu-label mb-0">الحي *</label>
                    {projectId && (
                      <span className="text-[10px] bg-[var(--neu-gold)]/10 text-[var(--neu-gold)] px-2 py-0.5 rounded-full font-bold">
                        تلقائي من المشروع
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--neu-gold)]/60" />
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="السلامة"
                      className={`neu-input neu-input-icon-right ${projectId ? 'opacity-70 bg-[var(--neu-depressed)] border-[var(--neu-depressed)]' : ''}`}
                      required
                      disabled={!!projectId}
                    />
                  </div>
                </div>
                <div>
                  <label className="neu-label">خط العرض (Latitude)</label>
                  <div className="relative">
                    <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--neu-text-muted)]/60" />
                    <input
                      type="number"
                      step="any"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      placeholder="21.573981"
                      className="neu-input neu-input-icon-right"
                    />
                  </div>
                </div>
                <div>
                  <label className="neu-label">خط الطول (Longitude)</label>
                  <div className="relative">
                    <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--neu-text-muted)]/60" />
                    <input
                      type="number"
                      step="any"
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      placeholder="39.155021"
                      className="neu-input neu-input-icon-right"
                    />
                  </div>
                </div>
              </div>

              {/* Map Picker */}
              <div className="pt-2">
                <MapPicker
                  lat={lat}
                  lng={lng}
                  onChange={(newLat, newLng) => {
                    setLat(newLat.toString());
                    setLng(newLng.toString());
                  }}
                  defaultCity={city}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="neu-label mb-0">العنوان بالتفصيل</label>
                    {projectId && (
                      <span className="text-[10px] bg-[var(--neu-gold)]/10 text-[var(--neu-gold)] px-2 py-0.5 rounded-full font-bold">
                        تلقائي من المشروع
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Compass className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--neu-gold)]/60" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="شارع قريش، عمارة أمل ستارز، الطابق الثالث"
                      className={`neu-input neu-input-icon-right ${projectId ? 'opacity-70 bg-[var(--neu-depressed)] border-[var(--neu-depressed)]' : ''}`}
                      disabled={!!projectId}
                    />
                  </div>
                </div>
                <div>
                  <label className="neu-label">رابط لوكيشن قوقل ماب (رسمي)</label>
                  <div className="relative">
                    <Map className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--neu-text-muted)]" />
                    <input
                      type="text"
                      value={googleMapsLink}
                      onChange={(e) => setGoogleMapsLink(e.target.value)}
                      placeholder="انسخ رابط اللوكيشن هنا لاستخراج الإحداثيات تلقائياً"
                      className="neu-input neu-input-icon-right"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 4: Media Gallery & Plans (Full-Width with wider gallery layout) */}
          <div className="neu-card w-full">
            <div className="flex items-center gap-2 mb-6 border-b border-[var(--neu-depressed)] pb-3">
              <Sparkles className="w-5 h-5 text-[var(--neu-gold)]" />
              <h3 className="font-bold text-[var(--neu-text-heading)]">الوسائط المتعددة والمخططات الهندسية</h3>
            </div>

            <div className="space-y-6">

              {/* Main image & Floor plan row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Thumbnail field */}
                <div className="neu-raised-sm p-4 rounded-2xl">
                  <label className="neu-label">الصورة الرئيسية للمسكن (Thumbnail) *</label>
                  <div className="flex flex-col sm:flex-row gap-4 items-center mt-2">
                    <div className="relative w-36 h-28 bg-[var(--neu-depressed)] rounded-2xl overflow-hidden border border-white/20 shrink-0">
                      {thumbnail ? (
                        <Image
                          src={thumbnail}
                          alt="المعاينة"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-[var(--neu-text-muted)] text-[10px]">
                          <Building2 className="w-8 h-8 mb-1 opacity-45" />
                          بلا صورة
                        </div>
                      )}
                    </div>
                    <div className="flex-1 w-full space-y-2">
                      <input
                        type="text"
                        value={thumbnail}
                        onChange={(e) => setThumbnail(e.target.value)}
                        placeholder="رابط الصورة المباشر"
                        className="neu-input"
                      />
                      <button
                        type="button"
                        onClick={() => thumbnailInputRef.current?.click()}
                        className="neu-btn neu-btn-secondary text-xs w-full sm:w-auto"
                        disabled={uploadingThumbnail}
                      >
                        {uploadingThumbnail ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        رفع صورة
                      </button>
                      <input
                        ref={thumbnailInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleThumbnailUpload}
                      />
                    </div>
                  </div>
                </div>

                {/* Floor plan field */}
                <div className="neu-raised-sm p-4 rounded-2xl">
                  <label className="neu-label">مخطط الطابق الهندسي (Floor Plan)</label>
                  <div className="flex flex-col sm:flex-row gap-4 items-center mt-2">
                    <div className="relative w-36 h-28 bg-[var(--neu-depressed)] rounded-2xl overflow-hidden border border-white/20 shrink-0">
                      {floorPlan ? (
                        <Image
                          src={floorPlan}
                          alt="مخطط الطابق"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-[var(--neu-text-muted)] text-[10px]">
                          <Maximize className="w-8 h-8 mb-1 opacity-45" />
                          بلا مخطط
                        </div>
                      )}
                    </div>
                    <div className="flex-1 w-full space-y-2">
                      <input
                        type="text"
                        value={floorPlan}
                        onChange={(e) => setFloorPlan(e.target.value)}
                        placeholder="رابط المخطط المباشر"
                        className="neu-input"
                      />
                      <button
                        type="button"
                        onClick={() => floorPlanInputRef.current?.click()}
                        className="neu-btn neu-btn-secondary text-xs w-full sm:w-auto"
                        disabled={uploadingFloorPlan}
                      >
                        {uploadingFloorPlan ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        رفع المخطط
                      </button>
                      <input
                        ref={floorPlanInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFloorPlanUpload}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Album gallery (Expanded previews grid) */}
              <div>
                <label className="neu-label mb-2">ألبوم صور العقار الكامل (متعدد)</label>

                {/* Images grid preview (Shows up to 10 cols) */}
                {images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3 mb-4">
                    {images.map((imgUrl, idx) => (
                      <div key={idx} className="relative aspect-video bg-[var(--neu-depressed)] rounded-xl overflow-hidden group border border-white/10">
                        <Image
                          src={imgUrl}
                          alt="ألبوم"
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(idx)}
                          className="absolute top-1 left-1 bg-red-600/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="w-full">
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="w-full py-8 rounded-2xl border-2 border-dashed border-[var(--neu-text-muted)]/30 hover:border-[var(--neu-gold)]/40 hover:bg-[var(--neu-depressed)]/30 transition-all flex flex-col items-center justify-center text-xs font-semibold text-[var(--neu-text-secondary)] gap-2 cursor-pointer"
                    disabled={uploadingGallery}
                  >
                    {uploadingGallery ? (
                      <Loader2 className="w-6 h-6 animate-spin text-[var(--neu-gold)]" />
                    ) : (
                      <Plus className="w-6 h-6 text-[var(--neu-gold)]" />
                    )}
                    اضغط لتحديد صور متعددة لرفعها في ألبوم المعرض
                  </button>
                  <input
                    ref={galleryInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleGalleryUpload}
                  />
                </div>
              </div>

              {/* Videos and virtual tour */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="neu-label">الجولة الافتراضية ثلاثية الأبعاد (3D Tour)</label>
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="flex-1 w-full space-y-2">
                      <input
                        type="text"
                        value={virtualTour}
                        onChange={(e) => setVirtualTour(e.target.value)}
                        placeholder="رابط الجولة الافتراضية أو ارفعه بالزر الجانبي"
                        className="neu-input"
                      />
                      <button
                        type="button"
                        onClick={() => virtualTourInputRef.current?.click()}
                        className="neu-btn neu-btn-secondary text-xs w-full sm:w-auto"
                        disabled={uploadingVirtualTour}
                      >
                        {uploadingVirtualTour ? (
                          <div className="flex items-center gap-1.5">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>جاري الرفع...</span>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>رفع ملف الجولة</span>
                          </>
                        )}
                      </button>
                      <input
                        ref={virtualTourInputRef}
                        type="file"
                        accept=".html,.zip,.pdf,image/*"
                        className="hidden"
                        onChange={handleVirtualTourUpload}
                      />
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2 mt-4">
                  <label className="neu-label mb-2">مقاطع الفيديو الترويجية للعقار (متعدد)</label>
                  
                  {videos.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 mb-4">
                      {videos.map((vidUrl, idx) => (
                        <div key={idx} className="relative aspect-video bg-[var(--neu-depressed)] rounded-2xl overflow-hidden group border border-white/20">
                          <video src={vidUrl} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                window.open(vidUrl, '_blank');
                              }}
                              className="bg-white/25 hover:bg-white/40 text-white rounded-full p-2"
                              title="معاينة"
                            >
                              <Film className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setVideos((prev) => prev.filter((_, i) => i !== idx));
                              }}
                              className="bg-red-600/80 hover:bg-red-600 text-white rounded-full p-2"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">
                            فيديو {idx + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="flex-1 w-full space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={typedVideoUrl}
                          onChange={(e) => setTypedVideoUrl(e.target.value)}
                          placeholder="رابط فيديو مباشر (MP4 / Cloudinary)..."
                          className="neu-input flex-1"
                        />
                        <button
                          type="button"
                          onClick={addTypedVideo}
                          className="neu-btn neu-btn-primary px-4 shrink-0"
                        >
                          إضافة الرابط
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => videoInputRef.current?.click()}
                        className="neu-btn neu-btn-secondary text-xs w-full sm:w-auto"
                        disabled={uploadingVideo}
                      >
                        {uploadingVideo ? (
                          <div className="flex items-center gap-1.5">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>جاري الرفع ({videoProgress}%)</span>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>رفع مقطع فيديو جديد</span>
                          </>
                        )}
                      </button>
                      <input
                        ref={videoInputRef}
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={handleVideoUpload}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 5: Publishing Controls (Horizontal bar at the bottom) */}
          <div className="neu-card w-full">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2.5 shrink-0 text-right">
                <Star className="w-5 h-5 text-[var(--neu-gold)]" />
                <div>
                  <h3 className="font-bold text-[var(--neu-text-heading)]">التحكم بحالة النشر والتميز</h3>
                  <p className="text-xs text-[var(--neu-text-muted)] mt-0.5">تحكم في مكان ظهور العقار على الواجهة وحالة تفعيله</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                {/* Featured toggle */}
                <button
                  type="button"
                  onClick={() => setFeatured(!featured)}
                  className={`flex-1 sm:flex-initial flex items-center justify-between gap-4 px-5 py-3.5 rounded-2xl border text-right transition-all duration-200 cursor-pointer ${featured
                    ? 'bg-[var(--neu-gold)]/10 border-[var(--neu-gold)] text-[var(--neu-gold)] shadow-inner'
                    : 'bg-[var(--neu-raised)] border-transparent text-[var(--neu-text-secondary)] hover:bg-[var(--neu-depressed)]'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <Star className={`w-4 h-4 ${featured ? 'fill-[var(--neu-gold)]' : ''}`} />
                    <span className="text-xs font-bold">عقار مميز (Featured)</span>
                  </div>
                  <div className={`w-9 h-5 rounded-full p-0.5 transition-colors ${featured ? 'bg-[var(--neu-gold)]' : 'bg-[var(--neu-text-muted)]/20'} ms-4`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${featured ? '-translate-x-4' : 'translate-x-0'}`} />
                  </div>
                </button>

                {/* Published toggle */}
                <button
                  type="button"
                  onClick={() => setPublished(!published)}
                  className={`flex-1 sm:flex-initial flex items-center justify-between gap-4 px-5 py-3.5 rounded-2xl border text-right transition-all duration-200 cursor-pointer ${published
                    ? 'bg-[var(--neu-success-bg)] border-[var(--neu-success-border)] text-[var(--neu-success)] shadow-inner'
                    : 'bg-[var(--neu-raised)] border-transparent text-[var(--neu-text-secondary)] hover:bg-[var(--neu-depressed)]'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span className="text-xs font-bold">حالة النشر على الموقع</span>
                  </div>
                  <div className={`w-9 h-5 rounded-full p-0.5 transition-colors ${published ? 'bg-[var(--neu-success)]' : 'bg-[var(--neu-text-muted)]/20'} ms-4`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${published ? '-translate-x-4' : 'translate-x-0'}`} />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Quick Create Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[var(--neu-raised)] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4 text-right">
            <div className="flex items-center justify-between border-b border-[var(--neu-depressed)] pb-3">
              <button
                type="button"
                onClick={() => setShowNewProjectModal(false)}
                className="text-[var(--neu-text-muted)] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[var(--neu-gold)]" />
                <h3 className="font-bold text-[var(--neu-text-heading)] font-cairo">إضافة مشروع جديد سريع</h3>
              </div>
            </div>

            {quickProjectError && (
              <div className="p-3 bg-[var(--neu-danger-bg)] border border-[var(--neu-danger-border)] text-[var(--neu-danger)] rounded-xl text-xs flex items-center gap-2">
                <X className="w-4 h-4" />
                <span>{quickProjectError}</span>
              </div>
            )}

            <form onSubmit={handleQuickProjectSubmit} className="space-y-4">
              <div>
                <label className="neu-label">اسم المشروع *</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="مثال: مشروع أمل 120 السكني"
                  className="neu-input"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="neu-label">المدينة *</label>
                  <input
                    type="text"
                    value={newProjectCity}
                    onChange={(e) => setNewProjectCity(e.target.value)}
                    placeholder="جدة"
                    className="neu-input"
                    required
                  />
                </div>
                <div>
                  <label className="neu-label">الحي *</label>
                  <input
                    type="text"
                    value={newProjectDistrict}
                    onChange={(e) => setNewProjectDistrict(e.target.value)}
                    placeholder="السلامة"
                    className="neu-input"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={quickProjectLoading}
                  className="flex-1 neu-btn neu-btn-primary py-3 rounded-2xl flex items-center justify-center gap-2 cursor-pointer font-bold text-xs"
                >
                  {quickProjectLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  حفظ المشروع
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  className="flex-1 neu-btn neu-btn-secondary py-3 rounded-2xl cursor-pointer text-xs"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
