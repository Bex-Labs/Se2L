import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// This is where all your English text will live
const resources = {
  en: {
    translation: {
      auth: {
        welcomeBack: "Welcome back",
        createAccount: "Create an account",
        emailLabel: "Email Address",
        signIn: "Sign In",
        signUp: "Create Account",
        magicLinkBtn: "Send Magic Link",
        googleBtn: "Continue with Google"
      },
      landing: {
        title: "Your UK settlement journey, organised into simple steps.",
        getStarted: "Get Started",
        logIn: "Log in"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // Default language
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;