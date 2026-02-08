"use client";

import { useEffect } from "react";

export default function Favicon() {
  useEffect(() => {
    // Remove existing favicon links
    const existingLinks = document.querySelectorAll('link[rel*="icon"]');
    existingLinks.forEach((link) => link.remove());

    // Add new favicon link
    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/png";
    link.href = "/icons8-github-16.png";
    document.head.appendChild(link);

    // Also add shortcut icon
    const shortcutLink = document.createElement("link");
    shortcutLink.rel = "shortcut icon";
    shortcutLink.type = "image/png";
    shortcutLink.href = "/icons8-github-16.png";
    document.head.appendChild(shortcutLink);

    // Add apple touch icon
    const appleLink = document.createElement("link");
    appleLink.rel = "apple-touch-icon";
    appleLink.href = "/icons8-github-16.png";
    document.head.appendChild(appleLink);
  }, []);

  return null;
}
