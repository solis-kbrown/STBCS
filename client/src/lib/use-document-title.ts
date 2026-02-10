import { useEffect } from "react";

export function useDocumentTitle(title: string, description?: string) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      const prevDesc = metaDesc?.getAttribute("content") || "";
      if (metaDesc) {
        metaDesc.setAttribute("content", description);
      }

      let ogDesc = document.querySelector('meta[property="og:description"]');
      const prevOgDesc = ogDesc?.getAttribute("content") || "";
      if (ogDesc) {
        ogDesc.setAttribute("content", description);
      }

      let ogTitle = document.querySelector('meta[property="og:title"]');
      const prevOgTitle = ogTitle?.getAttribute("content") || "";
      if (ogTitle) {
        ogTitle.setAttribute("content", title);
      }

      let ogUrl = document.querySelector('meta[property="og:url"]');
      const prevOgUrl = ogUrl?.getAttribute("content") || "";
      if (ogUrl) {
        ogUrl.setAttribute("content", `https://stbcybersecurity.com${window.location.pathname}`);
      }

      let twitterTitle = document.querySelector('meta[name="twitter:title"]');
      const prevTwitterTitle = twitterTitle?.getAttribute("content") || "";
      if (twitterTitle) {
        twitterTitle.setAttribute("content", title);
      }

      let twitterDesc = document.querySelector('meta[name="twitter:description"]');
      const prevTwitterDesc = twitterDesc?.getAttribute("content") || "";
      if (twitterDesc) {
        twitterDesc.setAttribute("content", description);
      }

      let canonical = document.querySelector('link[rel="canonical"]');
      const prevCanonical = canonical?.getAttribute("href") || "";
      if (canonical) {
        canonical.setAttribute("href", `https://stbcybersecurity.com${window.location.pathname}`);
      }

      return () => {
        document.title = previousTitle;
        if (metaDesc) metaDesc.setAttribute("content", prevDesc);
        if (ogDesc) ogDesc.setAttribute("content", prevOgDesc);
        if (ogTitle) ogTitle.setAttribute("content", prevOgTitle);
        if (ogUrl) ogUrl.setAttribute("content", prevOgUrl);
        if (twitterTitle) twitterTitle.setAttribute("content", prevTwitterTitle);
        if (twitterDesc) twitterDesc.setAttribute("content", prevTwitterDesc);
        if (canonical) canonical.setAttribute("href", prevCanonical);
      };
    }

    return () => {
      document.title = previousTitle;
    };
  }, [title, description]);
}
