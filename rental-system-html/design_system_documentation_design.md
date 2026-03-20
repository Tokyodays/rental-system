# Slate Precision Design System

## 1. Overview & Creative North Star
**Creative North Star: "The Clinical Architect"**
Slate Precision is built for high-stakes clarity and operational efficiency. It rejects decorative elements in favor of structural integrity and data density. The aesthetic is inspired by high-end architectural blueprints and medical diagnostic equipment—precise, reliable, and strictly functional.

---

## 2. Visual Principles
*   **Structured Layouts:** Every element is part of a 3-pane responsive grid.
*   **High-Contrast Clarity:** A neutral base with a single high-visibility accent (#2563EB) to guide focus.
*   **Data First:** Tables and cards are designed for scanning large amounts of information quickly.
*   **Intentional Feedback:** Distinct status badges for immediate operational awareness (Success: #16A34A, Error: #DC2626).

---

## 3. Design Tokens

### 3.1 Color Palette
*   **Primary (Action):** `#2563EB` (Royal Blue)
*   **Backgrounds:**
    *   `#FFFFFF` (Canvas/Base)
    *   `#F8FAFC` (Sidebar/Subtle background)
*   **Status Colors:**
    *   `Available/Success`: `#16A34A`
    *   `Lent/Error`: `#DC2626`
    *   `Inactive/Neutral`: `#64748B`
*   **Typography & Borders:**
    *   `#0F172A` (H1/Titles)
    *   `#475569` (Body Text)
    *   `#E2E8F0` (Borders/Dividers)

### 3.2 Typography
*   **Font Family:** Modern Sans-Serif (Inter/System Fonts)
*   **H1 (Page Title):** 24px, SemiBold, Tracking -0.025em
*   **H2 (Section Heading):** 18px, Medium
*   **Body Text:** 14px, Regular
*   **Metadata/Small:** 12px, Regular

### 3.3 Effects & Geometry
*   **Border Radius:** `8px` (Standard)
*   **Shadows:** 
    *   `Shadow-sm`: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
    *   `Card-shadow`: Subtle elevation for primary interactive containers.

---

## 4. Component Library (Unified)

### 4.1 Side Navigation (Fixed)
*   **Width:** 240px
*   **Items:** Dashboard, Inventory, Lending, Return, Users, History, Setting.
*   **Active State:** Light blue background (`#EFF6FF`), blue text, and a right-side border indicator.
*   **Inactive State:** Slate text with subtle hover effect.

### 4.2 Top Bar (Fixed)
*   **Height:** 64px
*   **Elements:** Dynamic Page Title (Left), User Profile/Notification (Right).
*   **Visuals:** White background, 1px bottom border (`#E2E8F0`).

### 4.3 Tables (Standardized)
*   **Row Height:** 56px
*   **Header:** Fixed, semi-bold text, gray background.
*   **Interactions:** Hover state changes background color; sorting icons visible on sortable columns.
*   **Status Badges:** Pill-shaped with low-opacity background of the status color.

### 4.4 Information Cards
*   **Base:** White background, 8px radius, 1px border.
*   **Usage:** For high-level statistics and equipment details.

---

## 5. Interaction Model
*   **Transitions:** 150ms Fade/Scale for buttons and hover states.
*   **Modals:** Central overlay with background dimming for confirmation steps.
*   **Responsiveness:**
    *   **Desktop:** 3-pane structure (Fixed Side/Top).
    *   **Mobile:** Sidebar becomes a slide-out drawer; full-width content cards.