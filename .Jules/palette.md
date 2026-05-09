## 2024-05-18 - Missing ARIA Labels on Icon Buttons
**Learning:** Across the frontend codebase, many icon-only buttons (e.g., Wishlist toggles in product cards, Search/User/Hamburger buttons in the Navbar) were missing `aria-label`s and focus indicators for keyboard navigation, impairing accessibility.
**Action:** Always verify that icon-only buttons include `aria-label`s (and occasionally `title` for tooltip fallback). Ensure `focus-visible:ring-1 focus:outline-none` or equivalent styles are consistently applied for keyboard visibility without mouse disruption. A reusable `IconButton` component should be considered for future feature additions to standardise this behavior.
## 2024-05-10 - Add aria-labels to icon-only buttons
**Learning:** Found multiple icon-only action buttons across admin sections without `aria-label`s. Because these sections had no visual text, screen readers would not know what actions these buttons perform.
**Action:** Always ensure any icon-only button across the entire platform, whether customer-facing or admin, has a clear and descriptive `aria-label` associated with it to maintain full accessibility.
