# ملحق تقني: صلاحية مشروع الغربية الذهبية للتحويل إلى مار

تاريخ الفحص: 8 سبتمبر 2026. المصدر: `C:\Users\karim\Desktop\mara\alghrbiagolde`.

**النتيجة:** المشروع مناسب كأساس لإعادة استخدام وظائف الموقع العقاري، لكن التحويل إلى مار يحتاج هوية ومحتوى وبيانات وإعدادات مستقلة. هذا فحص للمصدر؛ لم تُنشأ نسخة مار ولم يُعدّل المشروع الأصلي.

## ما يمكن إعادة استخدامه

| الجزء | الموجود في المصدر | المرجع |
|---|---|---|
| أساس التطبيق | Next.js 16 وReact 19 وTypeScript وTailwind وFramer Motion وSupabase وCloudinary | [package.json](C:/Users/karim/Desktop/mara/alghrbiagolde/package.json:12) |
| الصفحات والتنقل | الرئيسية، العقارات، المشاريع، من نحن، التواصل، وتفاصيل المشروع والوحدة | [Navbar.tsx](C:/Users/karim/Desktop/mara/alghrbiagolde/src/components/layout/Navbar.tsx:17) |
| العربية | بنية عربية وRTL على مستوى الصفحة الرئيسية للتطبيق | [layout.tsx](C:/Users/karim/Desktop/mara/alghrbiagolde/src/app/layout.tsx:52) |
| البحث والفلترة | المدينة والنوع والغرف والسعر والبحث النصي | [الصفحة الرئيسية](C:/Users/karim/Desktop/mara/alghrbiagolde/src/app/(website)/page.tsx:45) |
| عرض العقارات والمشاريع | بطاقات، قوائم، تفاصيل، ومعرض صور وفيديو | [PropertyCard.tsx](C:/Users/karim/Desktop/mara/alghrbiagolde/src/components/property/PropertyCard.tsx)، [MediaGallery.tsx](C:/Users/karim/Desktop/mara/alghrbiagolde/src/components/ui/MediaGallery.tsx) |
| التواصل | نموذج طلب معاينة يرسل إلى Server Action، مع حالات نجاح وخطأ | [InquiryModal.tsx](C:/Users/karim/Desktop/mara/alghrbiagolde/src/components/layout/InquiryModal.tsx:17) |
| الجولة الافتراضية | مكوّن عرض بانورامي قابل لإعادة الاستخدام؛ صورته الحالية تخص المحتوى القديم | [VirtualTourSection.tsx](C:/Users/karim/Desktop/mara/alghrbiagolde/src/components/home/VirtualTourSection.tsx:70) |
| الإدارة | شاشات العقارات والمشاريع والمستخدمين والوسائط والطلبات والإعدادات؛ تحتاج تحديد نطاق مار والتحقق قبل الإصدار | [مسار لوحة الإدارة](C:/Users/karim/Desktop/mara/alghrbiagolde/src/app/algharbia-cp/page.tsx) |

## نطاق التحويل البصري والمحتوى

- **الألوان الحالية:** كحلي داكن `#060D1A` و`#0A1628`، أزرق `#1A5BA5`، وذهبي `#C9A96E`. توجد متغيرات مركزية في [globals.css](C:/Users/karim/Desktop/mara/alghrbiagolde/src/styles/globals.css:12)، لكن توجد أيضًا ألوان وتدرجات وظلال مكتوبة داخل المكونات، مثل [Footer.tsx](C:/Users/karim/Desktop/mara/alghrbiagolde/src/components/layout/Footer.tsx:13). لذلك تغيير المتغيرات وحده لن يستكمل هوية مار.
- **الخط الفعلي الافتراضي:** El Messiri، مع تحميل Cairo وTajawal وAref Ruqaa أيضًا. المرجع: [تحميل الخطوط](C:/Users/karim/Desktop/mara/alghrbiagolde/src/app/layout.tsx:3) و[خط الجسم](C:/Users/karim/Desktop/mara/alghrbiagolde/src/styles/globals.css:168).
- **الشعار والاسم:** صورة `/logo-new.webp` ونصا «الغربية الذهبية» و`GOLDEN WESTERN` منفصلان داخل [Navbar.tsx](C:/Users/karim/Desktop/mara/alghrbiagolde/src/components/layout/Navbar.tsx:32) و[Footer.tsx](C:/Users/karim/Desktop/mara/alghrbiagolde/src/components/layout/Footer.tsx:31). يلزم تحديث الأيقونات وبيانات البحث أيضًا في [layout.tsx](C:/Users/karim/Desktop/mara/alghrbiagolde/src/app/layout.tsx:34).
- **افتتاحية الموقع:** ثلاث صور تتبدل كل 6 ثوانٍ مع تلاشي وتقريب. لا توجد في هذا المكوّن آلية لتشغيل فيديو مار أو ربطه بالتمرير. المرجع: [HeroSection.tsx](C:/Users/karim/Desktop/mara/alghrbiagolde/src/components/home/HeroSection.tsx:7). دمج الفيديو سيكون تنفيذًا جديدًا لهذا الجزء.
- **بيانات الشركة:** الهواتف والبريد والعناوين والتراخيص موزعة على عدة ملفات. توجد أرقام مختلفة، وحتى أرقام تجريبية في [صفحة العقارات](C:/Users/karim/Desktop/mara/alghrbiagolde/src/app/(website)/properties/page.tsx:175). تراخيص الشركة القديمة في [Footer.tsx](C:/Users/karim/Desktop/mara/alghrbiagolde/src/components/layout/Footer.tsx:57)، وبيانات الاتصال في [FloatingContact.tsx](C:/Users/karim/Desktop/mara/alghrbiagolde/src/components/layout/FloatingContact.tsx:8). الأفضل جمع بيانات مار المعتمدة في مصدر إعدادات واحد.
- **المحتوى التجاري:** أسماء المشاريع والوحدات في [mockData.ts](C:/Users/karim/Desktop/mara/alghrbiagolde/src/lib/mockData.ts:76)، شهادات العملاء في [TestimonialsSection.tsx](C:/Users/karim/Desktop/mara/alghrbiagolde/src/components/home/TestimonialsSection.tsx:7)، الشركاء في [PartnersMarquee.tsx](C:/Users/karim/Desktop/mara/alghrbiagolde/src/components/home/PartnersMarquee.tsx:7)، وادعاءات «15 عامًا / 25 مشروعًا / 500 وحدة» في [WhyUsSection.tsx](C:/Users/karim/Desktop/mara/alghrbiagolde/src/components/home/WhyUsSection.tsx:30). يلزم استبدالها بمحتوى مار الموثق؛ تغيير اسم الشركة داخلها لا يثبت صحة نسبتها لمار.

## نقاط يجب حلها في النسخة الجديدة

### 1. عودة بيانات الغربية الذهبية عند فراغ قاعدة البيانات

تبدأ الصفحة الرئيسية ببيانات `PROPERTIES` و`PROJECTS` القديمة، ولا تستبدلها إلا إذا أعادت قاعدة البيانات قائمة غير فارغة. إذا كانت قاعدة مار جديدة أو حدث خطأ، يظل محتوى الشركة القديمة ظاهرًا. المرجع: [الصفحة الرئيسية، تهيئة البيانات](C:/Users/karim/Desktop/mara/alghrbiagolde/src/app/(website)/page.tsx:22). ويتكرر النمط في [قائمة المشاريع](C:/Users/karim/Desktop/mara/alghrbiagolde/src/app/(website)/projects/page.tsx:286) و[قائمة العقارات](C:/Users/karim/Desktop/mara/alghrbiagolde/src/app/(website)/properties/page.tsx:206). المطلوب حالات تحميل وفراغ وخطأ واضحة، مع بيانات مار فقط.

### 2. زر حفظ الإعدادات يعرض نجاحًا دون حفظ فعلي

دالة `handleSave` تشغل مؤقتًا ثم تغيّر حالة الواجهة إلى «تم الحفظ»، دون استدعاء حفظ للبيانات. المرجع: [settings/page.tsx](C:/Users/karim/Desktop/mara/alghrbiagolde/src/app/algharbia-cp/settings/page.tsx:112). كما أن عنوان الافتتاحية مكتوب مباشرة داخل [HeroSection.tsx](C:/Users/karim/Desktop/mara/alghrbiagolde/src/components/home/HeroSection.tsx:87). لذلك لوحة الإعدادات الحالية ليست وسيلة مكتملة لإدارة هوية مار.

### 3. ضرورة فصل قاعدة البيانات والتخزين والنشر

تستخدم الاتصالات متغيرات البيئة، بينما يحدد [next.config.mjs](C:/Users/karim/Desktop/mara/alghrbiagolde/next.config.mjs:7) نطاق مشروع Supabase القديم للصور، ويكرره ضمن سياسة اتصال المحتوى في [السطر 57](C:/Users/karim/Desktop/mara/alghrbiagolde/next.config.mjs:57). تحتاج النسخة الجديدة إعدادات MAR مستقلة لـSupabase والتخزين وCloudinary والنشر، دون نقل `.env.local` أو `.vercel` تلقائيًا.

توجد دالة `seedDatabase()` تستخدم صلاحية الخدمة وتحذف سجلات العقارات والمشاريع قبل إدخال البيانات التجريبية القديمة. المرجع: [properties.ts](C:/Users/karim/Desktop/mara/alghrbiagolde/src/app/actions/properties.ts:425). لم تُنفذ هذه الدالة أثناء الفحص؛ لا يجوز تشغيلها على قاعدة مرتبطة بالمشروع الأصلي أثناء تجهيز النسخة.

### 4. مراجعة أمنية قبل الإصدار

وجود لوحة إدارة لا يثبت جاهزيتها للإنتاج. ملف الترحيل الموجود يسمح للمستخدم المصادق عليه بإدارة العقارات والمشاريع دون شرط دور إداري في تلك السياسات: [001_initial_schema.sql](C:/Users/karim/Desktop/mara/alghrbiagolde/supabase/migrations/001_initial_schema.sql:202). حارس المسار يتحقق من تسجيل الدخول في [proxy.ts](C:/Users/karim/Desktop/mara/alghrbiagolde/src/proxy.ts:127)، وتقرأ إدارة الحسابات الصلاحيات من `user_metadata` في [users.ts](C:/Users/karim/Desktop/mara/alghrbiagolde/src/app/actions/users.ts:24). هذه ملاحظات على المصدر المحلي، وتحتاج التحقق من التفويض على الخادم وسياسات القاعدة الفعلية قبل الإطلاق.

## الترتيب المقترح وحدود الفحص

1. اعتماد اتجاه مار البصري والمحتوى الأساسي والفيديو المناسب للافتتاحية.
2. إنشاء نسخة مستقلة نظيفة مع إعدادات وبيانات مار، وإزالة البيانات التجريبية القديمة من سلوك العرض.
3. توحيد الهوية وبيانات الشركة، ثم تنفيذ الافتتاحية والصفحات المطلوبة.
4. التحقق من الوظائف والمظهر على الهاتف والكمبيوتر، ثم البناء والتفويض وسياسات البيانات قبل النشر.

اقتصر العمل على قراءة ملفات المصدر. لم تُقرأ ملفات الأسرار، ولم يبدأ خادم تطوير أو تُجرَ اختبارات بناء أو اختبارات متصفح أو اتصالات بقاعدة البيانات. لذلك لا يقدم هذا الملحق حكمًا على أداء النسخة العاملة أو أمان القاعدة الحية أو سلامة جميع وظائف الإدارة، ولا يدّعي اكتمال النسخ أو التحويل.
