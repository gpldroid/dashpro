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
    account:"الحساب", navigation:"التنقل الرئيسي"
  },
  en: {
    workspace:"Workspace", dashboard:"Dashboard", overview:"Overview", projects:"Projects",
    templateEditor:"Template editor", githubManager:"GitHub file manager", githubDelivery:"GitHub delivery",
    localFiles:"Local files", snippets:"Code snippets", components:"Components", settings:"Settings",
    creativeSpace:"Your creative space", creativeDescription:"All your web-building tools in one place.",
    newProject:"New project", switchLanguage:"التبديل إلى العربية", signOut:"Sign out",
    lightMode:"Switch to light mode", darkMode:"Switch to dark mode", checkingSession:"Checking session…",
    account:"Account", navigation:"Main navigation"
  }
} as const;

type TranslationKey = keyof typeof translations.ar;
type LanguageContextValue = { language: Language; setLanguage: (language: Language) => void; toggleLanguage: () => void; t: (key: TranslationKey) => string };
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ar");
  useEffect(() => {
    const stored = window.localStorage.getItem("dashpro-language");
    const next: Language = stored === "en" || stored === "ar" ? stored : "ar";
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
  const value = useMemo(() => ({ language, setLanguage, toggleLanguage, t }), [language, setLanguage, toggleLanguage, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
