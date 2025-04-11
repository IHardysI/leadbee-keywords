"use client";

import { useState, useEffect } from "react";
import { UserProfile } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function UserProfilePage() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  useEffect(() => {
    // Check initial theme
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
    
    // Setup observer to detect theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.attributeName === 'class' &&
          mutation.target === document.documentElement
        ) {
          const isDark = document.documentElement.classList.contains('dark');
          setIsDarkMode(isDark);
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full h-full">
      <UserProfile
        appearance={{
          baseTheme: isDarkMode ? dark : undefined,
          elements: {
            rootBox: 'w-full! h-full!',
            card: 'w-full!',
            cardBox: 'w-full! h-full!',
          },
        }}
      />
    </div>
  );
}
