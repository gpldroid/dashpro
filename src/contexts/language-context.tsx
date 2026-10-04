"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Language = "ar" | "en";
const translations = {
  ar: {
    workspace:"مساحة العمل", dashboard:"لوحة التحكم", overview:"نظرة عامة", projects:"المشاريع",
    templateEditor:"محرر القوالب", githubManager:"مدير ملفات GitHub", githubDelivery:"تسليم GitHub",
    localFiles:"الملفات المحلية", snippets:"مكتبة الأكواد", components:"المكونات", settings:"الإعدادات",
    creativeSpace:"مساحة إبداعك", creativeDescription:"كل أدوات بناء الويب في مكان واحد.",
    newProject:"مشروع جديد", switchLanguage:"Switch to English", signOut:"تسجيل الخروج",
    lightMode:"تفعيل الوضع الفاتح", darkMode:"تفعيل الوضع الداكن", checkingSession:"جارٍ التحقق من الجلسة…",
    account:"الحساب", navigation:"التنقل الرئيسي", openMenu:"فتح القائمة", closeMenu:"إغلاق القائمة",
    dashboardWelcome:"مرحبًا بك في DashPro", dashboardDescription:"مساحة واحدة لتصميم قوالب Blogger وبناء المواقع وإدارة ملفاتك ومشاريع GitHub.",
    cloudStudio:"استوديو التطوير السحابي", editBlogger:"حرّر قوالب Blogger، افحص البنية، عاين التصميم على عدة أجهزة، ثم احفظ مباشرة في GitHub.",
    saveGithub:"حفظ مباشر في GitHub", chooseTemplate:"القوالب الجاهزة", bloggerEditor:"محرر Blogger XML",
    github:"GitHub", livePreview:"معاينة حيّة", universalEditor:"المحرر العام", selectedProject:"المشروع المحدد",
    chooseRepository:"اختر مستودع GitHub وسجّل الدخول أولًا.", savedGithub:"تم الحفظ مباشرة في GitHub.",
    loadedTemplate:"تم تحميل القالب في المحرر.", unableSave:"تعذر الحفظ في GitHub.",
    projectsDescription:"جميع قوالب Blogger ومشاريع المواقع الخاصة بك.", loadProjects:"جارٍ تحميل المشاريع…",
    projectsError:"تعذر تحميل المشاريع. تحقق من إعداد قاعدة البيانات وسياسات الوصول.",
    noProjects:"لم تنشئ أي مشروع حتى الآن.", settingsDescription:"خصص اللغة والمظهر وتفضيلات مساحة العمل.",
    appearance:"المظهر", language:"اللغة", theme:"السمة", light:"فاتح", dark:"داكن",
    componentsTitle:"مكتبة المكونات", componentsDescription:"ستجد هنا مكونات Headers وFooters وWidgets الجاهزة والقابلة للسحب والإفلات.",
    backProjects:"العودة إلى المشاريع", createProjectTitle:"إنشاء مشروع جديد",
    createProjectDescription:"واجهة إنشاء المشروع وربطها بقاعدة البيانات ستكون ضمن مرحلة إدارة المشاريع. هيكل المصادقة ولوحة التحكم جاهز الآن.",
    openEditor:"جارٍ فتح المحرر…", noBloggerProject:"لا يوجد مشروع Blogger XML بعد.",
    bloggerOnly:"محرر Blogger XML مخصص لمشاريع القوالب بصيغة Blogger XML.",
    collapseSidebar:"طي القائمة الجانبية", expandSidebar:"توسيع القائمة الجانبية", connected:"متصل بالإنترنت", disconnected:"غير متصل بالإنترنت"
  },
  en: {
    workspace:"Workspace", dashboard:"Dashboard", overview:"Overview", projects:"Projects",
    templateEditor:"Template editor", githubManager:"GitHub file manager", githubDelivery:"GitHub delivery",
    localFiles:"Local files", snippets:"Code snippets", components:"Components", settings:"Settings",
    creativeSpace:"Your creative space", creativeDescription:"All your web-building tools in one place.",
    newProject:"New project", switchLanguage:"التبديل إلى العربية", signOut:"Sign out",
    lightMode:"Switch to light mode", darkMode:"Switch to dark mode", checkingSession:"Checking session…",
    account:"Account", navigation:"Main navigation", openMenu:"Open menu", closeMenu:"Close menu",
    dashboardWelcome:"Welcome to DashPro", dashboardDescription:"One workspace to design Blogger templates, build websites, and manage your files and GitHub projects.",
    cloudStudio:"Cloud development studio", editBlogger:"Edit Blogger templates, validate their structure, preview across devices, and save directly to GitHub.",
    saveGithub:"Save directly to GitHub", chooseTemplate:"Starter templates", bloggerEditor:"Blogger XML editor",
    github:"GitHub", livePreview:"Live preview", universalEditor:"Universal editor", selectedProject:"Selected project",
    chooseRepository:"Choose a GitHub repository and sign in first.", savedGithub:"Saved directly to GitHub.",
    loadedTemplate:"Template loaded into the editor.", unableSave:"Unable to save to GitHub.",
    projectsDescription:"All your Blogger templates and website projects.", loadProjects:"Loading projects…",
    projectsError:"Unable to load projects. Check your database configuration and access policies.",
    noProjects:"You have not created any projects yet.", settingsDescription:"Customize the language, appearance, and workspace preferences.",
    appearance:"Appearance", language:"Language", theme:"Theme", light:"Light", dark:"Dark",
    componentsTitle:"Components library", componentsDescription:"Ready-to-use headers, footers, and widgets that can be dragged and dropped.",
    backProjects:"Back to projects", createProjectTitle:"Create a new project",
    createProjectDescription:"The project creation flow and database integration will be added in the project management phase. Authentication and the dashboard foundation are ready.",
    openEditor:"Opening editor…", noBloggerProject:"There is no Blogger XML project yet.",
    bloggerOnly:"The Blogger XML editor is intended for Blogger XML template projects.",
    collapseSidebar:"Collapse sidebar", expandSidebar:"Expand sidebar", connected:"Online", disconnected:"Offline"
  }
} as const;

type TranslationKey = keyof typeof translations.ar;
type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
  tr: (arabic: string, english: string) => string;
};
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ar");
  useEffect(() => {
    let stored: string | null = null;
    try { stored = window.localStorage.getItem("dashpro-language"); } catch { /* storage may be unavailable */ }
    const next: Language = stored === "en" || stored === "ar" ? stored : "ar";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- restore the persisted locale after hydration
    setLanguageState(next);
  }, []);
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.dataset.language = language;
    try { window.localStorage.setItem("dashpro-language", language); } catch { /* storage may be unavailable */ }
  }, [language]);
  const setLanguage = useCallback((next: Language) => setLanguageState(next), []);
  const toggleLanguage = useCallback(() => setLanguageState(current => current === "ar" ? "en" : "ar"), []);
  const t = useCallback((key: TranslationKey) => translations[language][key], [language]);
  const tr = useCallback((arabic: string, english: string) => language === "ar" ? arabic : english, [language]);
  const value = useMemo(() => ({ language, setLanguage, toggleLanguage, t, tr }), [language, setLanguage, toggleLanguage, t, tr]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
