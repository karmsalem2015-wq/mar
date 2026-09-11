export type HeroMediaVariant = 'desktop' | 'mobile';

export type HeroStoryAction =
  | {
      kind: 'link';
      label: string;
      href: string;
      emphasis: 'primary' | 'secondary';
    }
  | {
      kind: 'inquiry';
      label: string;
      emphasis: 'primary' | 'secondary';
    };

export type HeroStoryStop = {
  id: string;
  sceneNumber: string;
  scrollStart: number;
  scrollEnd: number;
  videoProgress: number;
  eyebrow: string;
  title: string;
  description: string;
  desktopSide: 'left' | 'right';
  actions?: readonly HeroStoryAction[];
};

export const HERO_MEDIA = {
  desktop: {
    src: '/media/hero/mar-hero-desktop.mp4',
    poster: '/media/hero/mar-hero-desktop-poster.jpg',
    duration: 50.8,
  },
  mobile: {
    src: '/media/hero/mar-hero-mobile.mp4',
    poster: '/media/hero/mar-hero-mobile-poster.jpg',
    duration: 50.583333,
  },
} as const satisfies Record<
  HeroMediaVariant,
  { src: string; poster: string; duration: number }
>;

/**
 * Continuous, smooth scroll progress -> video progress.
 * Strictly monotonic without dead plateaus so the camera glides naturally throughout the entire tour.
 */
export const HERO_SCROLL_KEYFRAMES = [
  { scroll: 0, video: 0 },
  { scroll: 0.20, video: 0.20 },
  { scroll: 0.40, video: 0.40 },
  { scroll: 0.60, video: 0.60 },
  { scroll: 0.80, video: 0.80 },
  { scroll: 1, video: 1 },
] as const;

export const HERO_STORY_STOPS: readonly HeroStoryStop[] = [
  {
    id: 'mar-promise',
    sceneNumber: '01',
    scrollStart: 0,
    scrollEnd: 0.20,
    videoProgress: 0.10,
    eyebrow: 'مار العقارية',
    title: 'العنوان الأول للاستثمار',
    description:
      'تطوير وبناء عقاري يجمع الرؤية المعاصرة بالخبرة التي تصنع الثقة.',
    desktopSide: 'right',
  },
  {
    id: 'engineering-knowledge',
    sceneNumber: '02',
    scrollStart: 0.20,
    scrollEnd: 0.40,
    videoProgress: 0.30,
    eyebrow: 'خبرة البناء',
    title: 'معرفة هندسية تقود كل خطوة',
    description:
      'من الفكرة الأولى إلى المساحة المكتملة، يبدأ الإتقان من قرار مدروس.',
    desktopSide: 'left',
  },
  {
    id: 'execution-details',
    sceneNumber: '03',
    scrollStart: 0.40,
    scrollEnd: 0.60,
    videoProgress: 0.50,
    eyebrow: 'دقة التنفيذ',
    title: 'تفاصيل مدروسة. جودة تُرى.',
    description:
      'نوازن بين جمال التصميم ووظيفة المكان لنقدّم تجربة سكنية متكاملة.',
    desktopSide: 'right',
  },
  {
    id: 'lasting-value',
    sceneNumber: '04',
    scrollStart: 0.60,
    scrollEnd: 0.80,
    videoProgress: 0.70,
    eyebrow: 'قيمة تدوم',
    title: 'مساحات ترتقي بطريقة العيش',
    description:
      'تصميم واضح، حركة مريحة، واهتمام بكل زاوية تصنع الفرق.',
    desktopSide: 'left',
  },
  {
    id: 'discover-mar',
    sceneNumber: '05',
    scrollStart: 0.80,
    scrollEnd: 1,
    videoProgress: 0.90,
    eyebrow: 'ابدأ من هنا',
    title: 'اكتشف مشاريع مار العقارية',
    description:
      'تعرّف على مشاريعنا، أو تحدّث مباشرة مع مستشار عقاري.',
    desktopSide: 'right',
    actions: [
      {
        kind: 'link',
        label: 'استكشف المشاريع',
        href: '/projects',
        emphasis: 'primary',
      },
      {
        kind: 'inquiry',
        label: 'تحدّث مع مستشار',
        emphasis: 'secondary',
      },
    ],
  },
] as const;

export function getHeroVideoProgress(scrollProgress: number) {
  const progress = Math.min(Math.max(scrollProgress, 0), 1);

  for (let index = 1; index < HERO_SCROLL_KEYFRAMES.length; index += 1) {
    const previous = HERO_SCROLL_KEYFRAMES[index - 1];
    const next = HERO_SCROLL_KEYFRAMES[index];

    if (progress <= next.scroll) {
      const scrollDistance = next.scroll - previous.scroll;
      if (scrollDistance === 0) return next.video;

      const localProgress = (progress - previous.scroll) / scrollDistance;
      return previous.video + (next.video - previous.video) * localProgress;
    }
  }

  return 1;
}

export function getActiveHeroStop(scrollProgress: number) {
  const progress = Math.min(Math.max(scrollProgress, 0), 1);
  const index = HERO_STORY_STOPS.findIndex(
    (stop) => progress >= stop.scrollStart && progress <= stop.scrollEnd,
  );
  if (index !== -1) return index;
  return HERO_STORY_STOPS.length - 1;
}
