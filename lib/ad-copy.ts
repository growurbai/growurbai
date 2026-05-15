import type { DashboardCategory } from "./dashboard-categories";

/** Demo copy scaffold — swap with inference output once the model is wired. */
export function getDemoAdCopy(category: DashboardCategory): string {
  switch (category) {
    case "Fashion":
      return `
Headline · “Architected Drape. Monsoon Staple.”  
Sub · Hand-finished kota cotton with tonal selvedge—from Bengaluru studios to COD nationwide.  

Primary CTA · Build your capsule wardrobe  
Instagram caption · Monsoon errands don’t do stiff silhouettes. This fluid co-ord set dries in six minutes flat—shoot us a 📩 for ₹199 first-order credit. Ships PAN India.  

PDP bullets  
• Breathable GSM tuned for humid metros · tested in Bombay June humidity  
• Zero cheap sheen under ring lights • dual pockets on every trouser SKU  
`;

    case "Jewelry":
      return `
Headline · “Heritage Alloy. Future Stack.”  
Sub · Nickel-safe 22k micron plating forged in Jaipur ateliers—with lifetime polishing for India COD buyers.  

Primary CTA · Reserve your heirloom stack  
Instagram caption · Every arm party needs quiet flex. Slide into our concierge DM for ₹0 custom engraving on orders above ₹2.5k. Limited Diwali kiln slots remaining.  

PDP bullets  
• Anti-tarnish e-coating for coastal humidity  
• Allergy-tested posts for sensitive lobes • ships in recyclable rigid boxes  
`;

    case "Food":
      return `
Headline · “Small-Batch Ritual Fuel.”  
Sub · Single-origin cold brew steeped 18 hrs with jaggery finish—cold-chain ready for quick commerce in India’s top 8 zones.  

Primary CTA · Subscribe & save ₹12% monthly  
Instagram caption · 4 AM founders, this bottle is your silent co-founder. Tag your midnight hustle reel with #GlowUrbRitual—we’ll amplify three stories daily. COD friendly.  

PDP bullets  
• Nutrition panel localized for INR listings  
• Shelf-stable 45 days refrigerated • gifting sleeves for festive drops  
`;

    case "Electronics":
      return `
Headline · “Thermal Discipline Meets Bharat Fit.”  
Sub · Graphene-accented docking with surge shielding tuned for flaky Indian mains—localized manual + Hindi quick-start QR.  

Primary CTA · Secure launch pricing  
Instagram caption · Editors’ choice for remote founders: charge three devices simultaneously without desk spaghetti. ₹100 off if you WhatsApp invoice before Friday. PAN India logistics.  

PDP bullets  
• BIS-friendly adapter bundle options  
• EMI copy blocks for PDP integration • tempered glass-friendly footprint  
`;

    case "Home Decor":
      return `
Headline · “Quiet Luxury for Urban Corners.”  
Sub · Hand-loomed accents & tempered glass shelving styled for compact Mumbai flats—with COD bundles nationwide.  

Primary CTA · Refresh your reading nook today  
Instagram caption · Golden-hour vignettes hit different when your shelves finally match your espresso setup. Tap Stories for ₹250 bundle credit—limited Delhi & Bengaluru slots this week.  

PDP bullets  
• Scratch-tested finishes for humid coastal air • modular stacking  
• Neutral palettes calibrated for Instagram PDP crops • GST-inclusive INR  
`;

    case "Skincare":
      return `
Headline · “Glow Ritual Delivered Overnight”  
Sub · Cruelty-free actives bottled in Bombay. Free shipping ₹499+.  

Primary CTA · Shop the Monsoon Revival Kit  
Instagram caption · ☔️ Monsoon skin doesn’t negotiate. Our ceramide cloud cream locks hydration for 72h—tap to claim your ₹150 launch perk. Limited for India COD orders.  

PDP bullets  
• Lightweight gel-cream; no white cast under studio lights  
• pH-balanced for humid coastal cities · Mumbai-tested  
`;
  }
}
