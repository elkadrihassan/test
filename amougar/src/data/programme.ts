import type { Lang } from '../i18n/content';

export type Category = 'culture' | 'music' | 'heritage' | 'sport' | 'children' | 'innovation' | 'night';
export const CATEGORIES: Category[] = ['culture', 'music', 'heritage', 'sport', 'children', 'innovation', 'night'];

type L = Record<Lang, string>;

export const VENUES: Record<string, L> = {
  grounds: { fr: 'Site du Moussem', en: 'Moussem grounds', ar: 'موقع الموسم' },
  tent: { fr: 'Grande khaïma', en: 'Grand khaima', ar: 'الخيمة الكبرى' },
  fantasia: { fr: 'Terrain de fantasia', en: 'Fantasia ground', ar: 'ميدان التبوريدة' },
  centre: { fr: 'Centre-ville', en: 'City centre', ar: 'وسط المدينة' },
  culture: { fr: 'Maison de la Culture', en: 'Cultural Centre', ar: 'دار الثقافة' },
  beach: { fr: 'Tan-Tan Plage', en: 'Tan-Tan Plage', ar: 'طانطان الشاطئ' },
  artisans: { fr: 'Village artisanal', en: 'Artisan village', ar: 'القرية الحرفية' },
  youth: { fr: 'Espace Jeunesse', en: 'Youth hub', ar: 'فضاء الشباب' },
  stage: { fr: 'Grande scène', en: 'Main stage', ar: 'المنصة الكبرى' },
};

export interface EventItem {
  day: 0 | 1 | 2 | 3 | 4;
  time: string;
  venue: keyof typeof VENUES;
  cat: Category;
  title: L;
}

export const EVENTS: EventItem[] = [
  // 30 OCT
  { day: 0, time: '10:00', venue: 'grounds', cat: 'heritage', title: { fr: 'Ouverture officielle & cortège des tribus', en: 'Official opening & procession of the tribes', ar: 'الافتتاح الرسمي وموكب القبائل' } },
  { day: 0, time: '11:30', venue: 'artisans', cat: 'heritage', title: { fr: 'Inauguration du village artisanal', en: 'Opening of the artisan village', ar: 'افتتاح القرية الحرفية' } },
  { day: 0, time: '15:00', venue: 'culture', cat: 'culture', title: { fr: 'Exposition « Mémoire du Sahara »', en: 'Exhibition “Memory of the Sahara”', ar: 'معرض «ذاكرة الصحراء»' } },
  { day: 0, time: '17:30', venue: 'fantasia', cat: 'sport', title: { fr: 'Course de dromadaires', en: 'Camel race', ar: 'سباق الهجن' } },
  { day: 0, time: '21:00', venue: 'stage', cat: 'night', title: { fr: 'Soirée d’ouverture : musique hassanie', en: 'Opening night: Hassani music', ar: 'سهرة الافتتاح: الموسيقى الحسانية' } },
  // 31 OCT
  { day: 1, time: '09:30', venue: 'youth', cat: 'children', title: { fr: 'Atelier de contes pour enfants', en: 'Storytelling workshop for children', ar: 'ورشة حكايات للأطفال' } },
  { day: 1, time: '11:00', venue: 'culture', cat: 'culture', title: { fr: 'Table ronde : transmettre le patrimoine', en: 'Round table: passing on heritage', ar: 'مائدة مستديرة: نقل التراث' } },
  { day: 1, time: '16:00', venue: 'fantasia', cat: 'sport', title: { fr: 'Fantasia : grande parade équestre', en: 'Fantasia: the great riding parade', ar: 'التبوريدة: الاستعراض الكبير' } },
  { day: 1, time: '18:30', venue: 'tent', cat: 'heritage', title: { fr: 'Cérémonie du thé & hospitalité nomade', en: 'Tea ceremony & nomadic hospitality', ar: 'طقوس الشاي وكرم الضيافة البدوية' } },
  { day: 1, time: '21:30', venue: 'stage', cat: 'night', title: { fr: 'Nuit de la poésie hassanie', en: 'Night of Hassani poetry', ar: 'ليلة الشعر الحساني' } },
  // 01 NOV
  { day: 2, time: '10:00', venue: 'youth', cat: 'innovation', title: { fr: 'Hackathon patrimoine & numérique — Tan-Tan Wings Tech', en: 'Heritage & digital hackathon — Tan-Tan Wings Tech', ar: 'هاكاثون التراث والرقمنة — Tan-Tan Wings Tech' } },
  { day: 2, time: '12:00', venue: 'centre', cat: 'culture', title: { fr: 'Parcours photo dans la ville', en: 'Photo walk through the city', ar: 'جولة تصوير في المدينة' } },
  { day: 2, time: '15:30', venue: 'tent', cat: 'music', title: { fr: 'Concert : tidinit & ardin', en: 'Concert: tidinit & ardin', ar: 'حفل: التيدينيت والآردين' } },
  { day: 2, time: '17:00', venue: 'beach', cat: 'sport', title: { fr: 'Rencontres sportives à Tan-Tan Plage', en: 'Sports meet on Tan-Tan Plage', ar: 'لقاءات رياضية بشاطئ طانطان' } },
  { day: 2, time: '21:00', venue: 'stage', cat: 'night', title: { fr: 'Grand concert de nuit', en: 'Grand night concert', ar: 'الحفل الليلي الكبير' } },
  // 02 NOV
  { day: 3, time: '09:30', venue: 'youth', cat: 'children', title: { fr: 'La petite caravane : balade pour enfants', en: 'The little caravan: a ride for children', ar: 'القافلة الصغيرة: جولة للأطفال' } },
  { day: 3, time: '11:00', venue: 'artisans', cat: 'heritage', title: { fr: 'Démonstrations d’artisans : cuir, tapis, bijoux', en: 'Artisan demonstrations: leather, rugs, jewellery', ar: 'عروض حرفية: الجلد والزرابي والحلي' } },
  { day: 3, time: '14:00', venue: 'grounds', cat: 'innovation', title: { fr: 'Parcours « patrimoine augmenté » : QR codes', en: '“Augmented heritage” trail: QR codes', ar: 'مسار «التراث المعزَّز»: رموز QR' } },
  { day: 3, time: '17:00', venue: 'fantasia', cat: 'sport', title: { fr: 'Fantasia : finale des troupes', en: 'Fantasia: troupes’ final', ar: 'التبوريدة: نهائي السربات' } },
  { day: 3, time: '20:30', venue: 'stage', cat: 'music', title: { fr: 'Soirée « Voix du Sahara »', en: '“Voices of the Sahara” evening', ar: 'سهرة «أصوات الصحراء»' } },
  // 03 NOV
  { day: 4, time: '10:00', venue: 'culture', cat: 'culture', title: { fr: 'Remise des prix de poésie', en: 'Poetry awards ceremony', ar: 'حفل توزيع جوائز الشعر' } },
  { day: 4, time: '12:30', venue: 'tent', cat: 'heritage', title: { fr: 'Déjeuner traditionnel partagé', en: 'Shared traditional lunch', ar: 'غداء تقليدي جماعي' } },
  { day: 4, time: '16:00', venue: 'grounds', cat: 'children', title: { fr: 'Grand carnaval des enfants', en: 'Children’s grand carnival', ar: 'الكرنفال الكبير للأطفال' } },
  { day: 4, time: '18:00', venue: 'centre', cat: 'heritage', title: { fr: 'Cortège de clôture & caravane', en: 'Closing procession & caravan', ar: 'موكب الختام والقافلة' } },
  { day: 4, time: '21:00', venue: 'stage', cat: 'night', title: { fr: 'Cérémonie de clôture & spectacle de lumières', en: 'Closing ceremony & light show', ar: 'حفل الختام وعرض الأضواء' } },
];
