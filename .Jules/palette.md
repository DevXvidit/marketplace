## 2024-04-29 - Show Password Toggle for Complex Requirements
**Learning:** Users often struggle with registration forms that enforce complex password requirements (8+ chars, uppercase, lowercase, numbers, symbols) when the password field is permanently masked, leading to frequent typos and frustration.
**Action:** Always provide a "Show Password" toggle on registration or password reset forms, especially when specific complexity rules are enforced, ensuring the toggle is fully accessible via keyboard (`focus-visible`) and screen readers (dynamic `aria-label`).
