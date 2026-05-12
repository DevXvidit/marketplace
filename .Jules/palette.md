## 2024-05-18 - Missing ARIA Labels on Icon Buttons
**Learning:** Across the frontend codebase, many icon-only buttons (e.g., Wishlist toggles in product cards, Search/User/Hamburger buttons in the Navbar) were missing `aria-label`s and focus indicators for keyboard navigation, impairing accessibility.
**Action:** Always verify that icon-only buttons include `aria-label`s (and occasionally `title` for tooltip fallback). Ensure `focus-visible:ring-1 focus:outline-none` or equivalent styles are consistently applied for keyboard visibility without mouse disruption. A reusable `IconButton` component should be considered for future feature additions to standardise this behavior.
## 2024-05-18 - Auth Password Visibility Buttons

**Learning:** When using custom icon buttons instead of standard inputs, developers often omit the aria-label and standard keyboard focus states. This affects password toggles specifically because they rely purely on visual emojis (👁️/🙈). Furthermore, the application features an explicit custom luxury focus state (`focus-visible:ring-1 focus-visible:ring-gold-500 focus:outline-none`).

**Action:** Consistently enforce `aria-label` (and optionally `title`) on all custom interactive elements without text nodes. For styling, use the luxury focus utility class to retain accessibility without compromising the aesthetic standard.
