import type { CvTemplateId, MasterCv } from "./career-types";
import type { Language } from "./i18n/types";

type SampleCopy = Omit<MasterCv, "template" | "updatedAt" | "version">;

const en: SampleCopy = {
  name: "Sara Lindqvist",
  title: "Customer Service Specialist",
  email: "sara.lindqvist@mail.com",
  phone: "+46 70 123 45 67",
  location: "Stockholm, Sweden",
  links: ["linkedin.com/in/saralindqvist"],
  summary:
    "Service-minded professional with 6 years of experience helping customers by phone, chat and email. Calm under pressure, quick to learn new systems, and used to working in busy teams.",
  experience: [
    {
      id: "s-exp-1",
      role: "Customer Service Specialist",
      company: "Nordbutik AB",
      location: "Stockholm",
      start: "2021",
      end: "Present",
      bullets: [
        "Handles around 60 customer cases a day by phone, chat and email.",
        "Trains new colleagues on the order and returns system.",
        "Kept a customer satisfaction score above 4.6 out of 5.",
      ],
    },
    {
      id: "s-exp-2",
      role: "Store Assistant",
      company: "CityMarket",
      location: "Uppsala",
      start: "2018",
      end: "2021",
      bullets: [
        "Advised customers and managed the checkout during peak hours.",
        "Responsible for stock counts and weekly deliveries.",
      ],
    },
  ],
  education: [
    {
      id: "s-edu-1",
      school: "Uppsala Vocational College",
      program: "Business Administration & Service",
      start: "2016",
      end: "2018",
    },
  ],
  skills: ["Customer support", "Conflict handling", "Order management", "Teamwork", "Reporting"],
  languages: ["Swedish (native)", "English (fluent)", "Arabic (basic)"],
  tools: ["Zendesk", "Microsoft 365", "Shopify", "Slack"],
  certifications: ["Service & Communication certificate, 2022"],
  projects: [
    {
      id: "s-proj-1",
      name: "Faster returns flow",
      description: "Suggested a simpler returns checklist that cut handling time by 20%.",
      year: "2023",
    },
  ],
  volunteer: ["Volunteer language café host, Stockholm City Library (2020–2022)"],
};

const sv: SampleCopy = {
  name: "Sara Lindqvist",
  title: "Kundtjänstspecialist",
  email: "sara.lindqvist@mail.com",
  phone: "+46 70 123 45 67",
  location: "Stockholm, Sverige",
  links: ["linkedin.com/in/saralindqvist"],
  summary:
    "Serviceinriktad medarbetare med 6 års erfarenhet av att hjälpa kunder via telefon, chatt och mejl. Lugn i pressade lägen, snabblärd i nya system och van vid team med högt tempo.",
  experience: [
    {
      id: "s-exp-1",
      role: "Kundtjänstspecialist",
      company: "Nordbutik AB",
      location: "Stockholm",
      start: "2021",
      end: "Nu",
      bullets: [
        "Hanterar cirka 60 kundärenden per dag via telefon, chatt och mejl.",
        "Utbildar nya kollegor i order- och returhanteringssystemet.",
        "Höll kundnöjdheten över 4,6 av 5.",
      ],
    },
    {
      id: "s-exp-2",
      role: "Butiksmedarbetare",
      company: "CityMarket",
      location: "Uppsala",
      start: "2018",
      end: "2021",
      bullets: [
        "Rådgav kunder och skötte kassan under högtrafik.",
        "Ansvarade för lagerinventering och veckoleveranser.",
      ],
    },
  ],
  education: [
    {
      id: "s-edu-1",
      school: "Uppsala Yrkeshögskola",
      program: "Företagsekonomi & service",
      start: "2016",
      end: "2018",
    },
  ],
  skills: ["Kundsupport", "Konflikthantering", "Orderhantering", "Samarbete", "Rapportering"],
  languages: ["Svenska (modersmål)", "Engelska (flytande)", "Arabiska (grund)"],
  tools: ["Zendesk", "Microsoft 365", "Shopify", "Slack"],
  certifications: ["Diplom i service och kommunikation, 2022"],
  projects: [
    {
      id: "s-proj-1",
      name: "Snabbare returflöde",
      description: "Föreslog en enklare returchecklista som kortade handläggningstiden med 20 %.",
      year: "2023",
    },
  ],
  volunteer: ["Volontär i språkcafé, Stockholms stadsbibliotek (2020–2022)"],
};

const ar: SampleCopy = {
  name: "سارة لينكفيست",
  title: "أخصائية خدمة عملاء",
  email: "sara.lindqvist@mail.com",
  phone: "+46 70 123 45 67",
  location: "ستوكهولم، السويد",
  links: ["linkedin.com/in/saralindqvist"],
  summary:
    "موظفة خدمة عملاء بخبرة 6 سنوات في مساعدة العملاء عبر الهاتف والدردشة والبريد الإلكتروني. هادئة تحت الضغط، سريعة التعلّم للأنظمة الجديدة، ومعتادة على العمل ضمن فرق سريعة الإيقاع.",
  experience: [
    {
      id: "s-exp-1",
      role: "أخصائية خدمة عملاء",
      company: "شركة نوردبوتيك",
      location: "ستوكهولم",
      start: "2021",
      end: "حتى الآن",
      bullets: [
        "معالجة نحو 60 طلب عميل يوميًا عبر الهاتف والدردشة والبريد.",
        "تدريب الزملاء الجدد على نظام الطلبات والمرتجعات.",
        "الحفاظ على رضا العملاء فوق 4.6 من 5.",
      ],
    },
    {
      id: "s-exp-2",
      role: "مساعدة مبيعات",
      company: "سيتي ماركت",
      location: "أوبسالا",
      start: "2018",
      end: "2021",
      bullets: [
        "إرشاد العملاء وإدارة الصندوق في أوقات الذروة.",
        "المسؤولية عن جرد المخزون واستلام التوريدات الأسبوعية.",
      ],
    },
  ],
  education: [
    {
      id: "s-edu-1",
      school: "كلية أوبسالا المهنية",
      program: "إدارة الأعمال والخدمات",
      start: "2016",
      end: "2018",
    },
  ],
  skills: ["دعم العملاء", "إدارة الخلافات", "معالجة الطلبات", "العمل الجماعي", "إعداد التقارير"],
  languages: ["السويدية (لغة أم)", "الإنجليزية (بطلاقة)", "العربية (أساسي)"],
  tools: ["Zendesk", "Microsoft 365", "Shopify", "Slack"],
  certifications: ["شهادة في الخدمة والتواصل، 2022"],
  projects: [
    {
      id: "s-proj-1",
      name: "تسريع مسار المرتجعات",
      description: "اقتراح قائمة تحقق أبسط للمرتجعات قلّصت زمن المعالجة بنسبة 20%.",
      year: "2023",
    },
  ],
  volunteer: ["متطوعة في مقهى اللغة، مكتبة مدينة ستوكهولم (2020–2022)"],
};

const byLang: Record<Language, SampleCopy> = { en, sv, ar };

export function sampleCvFor(lang: Language, template: CvTemplateId): MasterCv {
  return {
    ...(byLang[lang] ?? en),
    template,
    updatedAt: "2024-01-01T00:00:00.000Z",
    version: 0,
  };
}
