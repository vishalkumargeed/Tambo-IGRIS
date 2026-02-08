"use client";

import { useEffect } from "react";

export default function SocialMeta() {
  useEffect(() => {
    // Get the base URL
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

    // Open Graph meta tags
    const ogTags = [
      { property: "og:title", content: "Sentinel AI" },
      { property: "og:description", content: "Github & User Experience Designer" },
      { property: "og:image", content: `${baseUrl}/og-thumbnail.png` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Sentinel AI - Github & User Experience Designer" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: baseUrl },
    ];

    // Twitter Card meta tags
    const twitterTags = [
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Sentinel AI" },
      { name: "twitter:description", content: "Github & User Experience Designer" },
      { name: "twitter:image", content: `${baseUrl}/og-thumbnail.png` },
    ];

    // Remove existing social meta tags
    const existingOgTags = document.querySelectorAll('meta[property^="og:"]');
    existingOgTags.forEach((tag) => tag.remove());

    const existingTwitterTags = document.querySelectorAll('meta[name^="twitter:"]');
    existingTwitterTags.forEach((tag) => tag.remove());

    // Add Open Graph tags
    ogTags.forEach((tag) => {
      const meta = document.createElement("meta");
      meta.setAttribute("property", tag.property);
      meta.setAttribute("content", tag.content);
      document.head.appendChild(meta);
    });

    // Add Twitter Card tags
    twitterTags.forEach((tag) => {
      const meta = document.createElement("meta");
      meta.setAttribute("name", tag.name);
      meta.setAttribute("content", tag.content);
      document.head.appendChild(meta);
    });
  }, []);

  return null;
}
