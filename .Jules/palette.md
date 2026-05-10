## 2024-05-18 - Missing ARIA Labels on Icon Buttons
**Learning:** Across the frontend codebase, many icon-only buttons (e.g., Wishlist toggles in product cards, Search/User/Hamburger buttons in the Navbar) were missing `aria-label`s and focus indicators for keyboard navigation, impairing accessibility.
**Action:** Always verify that icon-only buttons include `aria-label`s (and occasionally `title` for tooltip fallback). Ensure `focus-visible:ring-1 focus:outline-none` or equivalent styles are consistently applied for keyboard visibility without mouse disruption. A reusable `IconButton` component should be considered for future feature additions to standardise this behavior.

## 2026-05-10 - Accessible Show/Hide Password Toggles
**Learning:** Password visibility toggles often lack accessible names (`aria-label`), tooltips (`title`), and clear keyboard focus indicators, making them difficult to use for screen reader and keyboard users.
**Action:** Always ensure that interactive elements like password toggles have descriptive, dynamically updating `aria-label` and `title` attributes (e.g., 'Show password' / 'Hide password'). Additionally, implement visible focus styles using `focus-visible` utility classes to support keyboard navigation.
