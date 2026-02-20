import { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

const translations = {
  de: {
    login: 'Anmelden',
    username: 'Benutzername',
    password: 'Passwort',
    logout: 'Abmelden',
    dashboard: 'Dashboard',
    statistics: 'Statistiken',
    uploadFiles: 'Dateien hochladen',
    operations: 'Operationen',
    opId: 'OP-ID',
    date: 'Datum',
    diagnose: 'Diagnose',
    anasthesieTyp: 'Anästhesie',
    duration: 'Dauer (Min)',
    bloodLoss: 'Blutverlust (ml)',
    team: 'OP-Team',
    pathology: 'Pathologie',
    complete: 'Vollständig',
    incomplete: 'Unvollständig',
    missingFields: 'Fehlende Felder',
    edit: 'Bearbeiten',
    save: 'Speichern',
    cancel: 'Abbrechen',
    delete: 'Löschen',
    export: 'Exportieren',
    totalOps: 'Gesamt Operationen',
    avgDuration: 'Durchschnittliche Dauer',
    byYear: 'Nach Jahr',
    byDiagnose: 'Nach Diagnose',
    byICD: 'Nach ICD-Code'
  },
  en: {
    login: 'Login',
    username: 'Username',
    password: 'Password',
    logout: 'Logout',
    dashboard: 'Dashboard',
    statistics: 'Statistics',
    uploadFiles: 'Upload Files',
    operations: 'Operations',
    opId: 'OP-ID',
    date: 'Date',
    diagnose: 'Diagnosis',
    anasthesieTyp: 'Anesthesia',
    duration: 'Duration (Min)',
    bloodLoss: 'Blood Loss (ml)',
    team: 'OP Team',
    pathology: 'Pathology',
    complete: 'Complete',
    incomplete: 'Incomplete',
    missingFields: 'Missing Fields',
    edit: 'Edit',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    export: 'Export',
    totalOps: 'Total Operations',
    avgDuration: 'Average Duration',
    byYear: 'By Year',
    byDiagnose: 'By Diagnosis',
    byICD: 'By ICD Code'
  }
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('de');

  const t = (key) => translations[lang][key] || key;

  const toggleLang = () => setLang(lang === 'de' ? 'en' : 'de');

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
