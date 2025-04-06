import React, { useEffect } from "react";

const GTranslate = () => {
  useEffect(() => {
    const addGoogleTranslateScript = () => {
      if (!document.querySelector("#google-translate-script")) {
        const script = document.createElement("script");
        script.id = "google-translate-script";
        script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        script.async = true;
        document.body.appendChild(script);
      }
    };
    
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en", // Default language
          includedLanguages: "zh-CN,zh-TW,en,sd,hi,gu,mr,ta,fr,ja,de,ru,en,hi", // Added both simplified and traditional Chinese
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        },
        "google_translate_element"
      );
    };
    
    addGoogleTranslateScript();
  }, []);
  
  return (
    <div
      id="google_translate_element"
      style={{
        position: 'absolute',
        top: '1rem',
        right: '0.2rem',
        opacity: 0.2,
        zIndex: 1000,
        backgroundColor: 'white',
        borderRadius: '5px',
        padding: '0.5rem',
      }}
    ></div>
  );
};

export default GTranslate;