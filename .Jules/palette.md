## 2024-05-18 - Missing ARIA Labels on Icon Buttons
**Learning:** Across the frontend codebase, many icon-only buttons (e.g., Wishlist toggles in product cards, Search/User/Hamburger buttons in the Navbar) were missing `aria-label`s and focus indicators for keyboard navigation, impairing accessibility.
**Action:** Always verify that icon-only buttons include `aria-label`s (and occasionally `title` for tooltip fallback). Ensure `focus-visible:ring-1 focus:outline-none` or equivalent styles are consistently applied for keyboard visibility without mouse disruption. A reusable `IconButton` component should be considered for future feature additions to standardise this behavior.

## 2024-05-20 - Registration Password Toggle
**Learning:** Complex password forms without visibility toggles lead to user frustration. When adding dynamic `type` toggles, ensure the toggle button receives appropriate focus states (`focus-visible:ring-1`) and dynamic `aria-label`s ("Show password" / "Hide password") to accommodate both keyboard navigation and screen readers.
**Action:** When implementing password validation interfaces, consistently provide a "Show Password" toggle to allow users to verify their input visually.
