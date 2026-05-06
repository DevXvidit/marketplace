## 2024-05-18 - Missing ARIA Labels on Icon Buttons
**Learning:** Across the frontend codebase, many icon-only buttons (e.g., Wishlist toggles in product cards, Search/User/Hamburger buttons in the Navbar) were missing `aria-label`s and focus indicators for keyboard navigation, impairing accessibility.
**Action:** Always verify that icon-only buttons include `aria-label`s (and occasionally `title` for tooltip fallback). Ensure `focus-visible:ring-1 focus:outline-none` or equivalent styles are consistently applied for keyboard visibility without mouse disruption. A reusable `IconButton` component should be considered for future feature additions to standardise this behavior.

## 2024-05-06 - [Complex Form Field Associations and Interactivity]
**Learning:** When building complex form validation with strict password requirements, ensuring accessible field associations (using `htmlFor`/`id`) and providing a password visibility toggle significantly improves user experience and prevents frustration from hidden typos, especially in dynamic React setups.
**Action:** Always link form labels to their inputs precisely and provide accessible toggle states (with ARIA labels and focus indicators) for sensitive inputs in registration flows.
