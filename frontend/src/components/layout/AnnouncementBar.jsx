/**
 * AnnouncementBar.jsx
 *
 * A thin brand-green strip at the top of the page.
 * Contains a short marquee-style marketing message.
 */

import { Sparkles } from "lucide-react";

export default function AnnouncementBar() {
  return (
    <div className="announcement-bar" role="banner" aria-label="إعلان المتجر">
      <Sparkles size={13} aria-hidden="true" />
      <span>كل قطعة لها حكاية — اكتشف إبداع الصناع المستقلين</span>
      <Sparkles size={13} aria-hidden="true" />
    </div>
  );
}
