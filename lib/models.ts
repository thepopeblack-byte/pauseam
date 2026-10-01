// Revisions read from the official Hugging Face metadata on 2026-10-01.
// Registration is not evidence of a successful model call.
export const LANGUAGES = {
 en: {label:"Nigerian-accented English",tag:"en-NG",model:"NCAIR1/NigerianAccentedEnglish",revision:"3c52c6e6c9ec508014a7b9db6a42b503b8930dff"},
 yo: {label:"Yoruba",tag:"yo",model:"NCAIR1/Yoruba-ASR",revision:"d1ae7b8b79c2ccd547d8761effe5057433f3fc7f"},
 ha: {label:"Hausa",tag:"ha",model:"NCAIR1/Hausa-ASR",revision:"e635b9eda29060c6114c8f4d8b2d903f5c83a44a"},
 ig: {label:"Igbo",tag:"ig",model:"NCAIR1/Igbo-ASR",revision:"180732299d5cba3dc8b289260ac84b7838bb3954"},
} as const;
export type Language = keyof typeof LANGUAGES;
export function isLanguage(value:unknown):value is Language {return typeof value === "string" && Object.hasOwn(LANGUAGES,value);}
export const TEXT_MODEL={model:"NCAIR1/N-ATLaS",revision:"e294476928aca9030e924ca27bb8e085e8581273"} as const;
export const ATTRIBUTION="N-ATLaS is an initiative of the Federal Ministry of Communications, Innovation and Digital Economy, and powered by Awarri Technologies.";
