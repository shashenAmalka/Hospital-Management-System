# 🎨 Dynamic Form Validation - Visual Reference

## 📋 Form Structure Visual Guide

### Patient Test Request Form

```
┌───────────────────────────────────────────────────────────────┐
│  Laboratory Test Request                                      │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  Test Type *                                                  │
│  ┌─────────────────────────────────────────────────┐         │
│  │ Select a test type...                        ▼ │         │
│  └─────────────────────────────────────────────────┘         │
│  ℹ️ Complete Blood Count and Blood Chemistry Analysis       │
│                                                               │
│  ⚠️  Fasting Required                                        │
│  │   This test requires fasting. Please read the            │
│  │   preparation instructions carefully.                     │
│  │   ☑ I acknowledge the fasting requirements               │
│                                                               │
│  📋 Preparation Instructions                           [+]   │
│  ─────────────────────────────────────────────────────       │
│  │ ✓ Fast for 8-12 hours before the test                   │
│  │ ✓ Drink plenty of water                                 │
│  │ ✓ Avoid alcohol 24 hours before test                    │
│  │ ✓ Take regular medications unless advised otherwise     │
│                                                               │
│  Preferred Date *                                             │
│  ┌─────────────────────────────────────────────────┐         │
│  │ 📅 2025-10-20                                   │         │
│  └─────────────────────────────────────────────────┘         │
│  Select a date within the next 90 days                        │
│                                                               │
│  Preferred Time *                                             │
│  ┌─────────────────────────────────────────────────┐         │
│  │ 🕐 09:30                                        │         │
│  └─────────────────────────────────────────────────┘         │
│  Working hours: 8:00 AM - 5:00 PM                            │
│                                                               │
│  Priority Level                                               │
│  ┌─────────────────────────────────────────────────┐         │
│  │ Normal                                       ▼ │         │
│  └─────────────────────────────────────────────────┘         │
│  STAT requests will be processed immediately                 │
│                                                               │
│  Additional Notes                                             │
│  ┌─────────────────────────────────────────────────┐         │
│  │ Any additional information or special          │         │
│  │ requests...                                     │         │
│  │                                                 │         │
│  └─────────────────────────────────────────────────┘         │
│  0/500 characters                                             │
│                                                               │
│                                  [Cancel] [Submit Request]    │
└───────────────────────────────────────────────────────────────┘
```

### Lab Technician Report Form

```
┌───────────────────────────────────────────────────────────────┐
│  🧪 Blood Test Report                                         │
│  Complete Blood Count and Blood Chemistry Analysis            │
│                                        Request ID: 67abc123   │
│                                        Patient: John Doe      │
├───────────────────────────────────────────────────────────────┤
│  [Hematology] [Chemistry]                                     │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  Hematology                                                   │
│                                                               │
│  Hemoglobin *                       WBC Count *               │
│  (g/dL)                             (cells/mcL)               │
│  ┌──────────────────┐               ┌──────────────────┐      │
│  │ 14.5            │               │ 7500            │      │
│  └──────────────────┘               └──────────────────┘      │
│  ℹ️ Reference: 12.0-17.5            ℹ️ Reference: 4,000-11,000│
│                                                               │
│  RBC Count *                        Platelet Count *          │
│  (million cells/mcL)                (cells/mcL)               │
│  ┌──────────────────┐               ┌──────────────────┐      │
│  │ 5.2             │               │ 250000          │      │
│  └──────────────────┘               └──────────────────┘      │
│  ℹ️ Reference: 4.5-5.9              ℹ️ Reference: 150,000-400,000│
│                                                               │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  📄 Technician Notes                                          │
│  ┌─────────────────────────────────────────────────┐         │
│  │ All parameters within normal limits. Quality    │         │
│  │ control passed. No hemolysis or clotting        │         │
│  │ observed in specimen.                           │         │
│  └─────────────────────────────────────────────────┘         │
│  Optional: Minimum 10 characters if provided                  │
│                                                               │
│  Completion Date         Completion Time                      │
│  ┌──────────────────┐    ┌──────────────────┐                │
│  │ 2025-10-15      │    │ 14:30           │                │
│  └──────────────────┘    └──────────────────┘                │
│                                                               │
│  * Required fields                                            │
│                                             [Cancel] [💾 Save Report] │
└───────────────────────────────────────────────────────────────┘
```

---

## 🎨 Color Scheme

### Request Form Colors

```css
Primary Blue:     #2563EB (bg-blue-600)
Success Green:    #10B981 (bg-green-500)
Warning Yellow:   #F59E0B (bg-yellow-500)
Error Red:        #EF4444 (bg-red-500)
Info Blue:        #3B82F6 (bg-blue-50)
Gray Background:  #F9FAFB (bg-gray-50)
```

### Report Form Colors

```css
Header Gradient:  #2563EB → #1E40AF (blue-600 → blue-700)
Category Active:  #2563EB (text-blue-600)
Category Inactive: #6B7280 (text-gray-500)
Reference Info:   #9CA3AF (text-gray-400)
Success:          #10B981 (text-green-600)
Warning:          #F59E0B (text-yellow-600)
Error:            #EF4444 (text-red-600)
```

---

## 🔤 Typography

```css
Headers (h2):     text-2xl font-bold (24px, 700 weight)
Subheaders (h3):  text-lg font-semibold (18px, 600 weight)
Labels:           text-sm font-medium (14px, 500 weight)
Body Text:        text-sm (14px, 400 weight)
Helper Text:      text-xs text-gray-500 (12px, gray)
Error Text:       text-sm text-red-600 (14px, red)
```

---

## 📐 Spacing & Layout

### Form Spacing

```
Outer Container:  max-w-4xl (672px)
Padding:          p-6 (24px all sides)
Field Spacing:    space-y-6 (24px vertical)
Grid Gap:         gap-4 (16px)
Button Spacing:   space-x-4 (16px horizontal)
```

### Report Form Spacing

```
Outer Container:  max-w-6xl (1152px)
Header Padding:   px-6 py-4 (24px horizontal, 16px vertical)
Content Padding:  p-6 (24px all sides)
Component Gap:    gap-4 (16px)
Category Margin:  mb-6 (24px bottom)
```

---

## 🎯 Component Sizes

### Input Fields

```
Height:           py-2 (32px)
Padding:          px-4 (16px horizontal)
Border Radius:    rounded-lg (8px)
Border Width:     border (1px)
Focus Ring:       ring-2 (2px)
```

### Buttons

```
Primary Button:
  Height:         py-2 (32px)
  Padding:        px-6 (24px horizontal)
  Border Radius:  rounded-lg (8px)
  Font:           text-sm font-medium

Secondary Button:
  Same as primary with border-gray-300
```

### Icons

```
Standard Icons:   h-5 w-5 (20px)
Small Icons:      h-4 w-4 (16px)
Large Icons:      h-6 w-6 (24px)
```

---

## 📱 Responsive Breakpoints

### Grid Layouts

```css
/* Mobile (< 640px) */
grid-cols-1

/* Tablet (640px - 1024px) */
md:grid-cols-2

/* Desktop (> 1024px) */
lg:grid-cols-3
```

### Category Tabs

```css
/* Mobile */
overflow-x-auto
whitespace-nowrap

/* Desktop */
Full width, no scroll
```

---

## ✅ Validation States

### Valid State

```
Border:   border-gray-300 (default)
Background: bg-white
Icon:     None or ✓ (checkmark)
```

### Error State

```
Border:   border-red-500
Background: bg-white
Icon:     ⚠️ (AlertCircle)
Text:     text-red-600 below field
```

### Focus State

```
Border:   border-transparent
Ring:     ring-2 ring-blue-500
Shadow:   focus:ring-2 focus:ring-blue-500
```

### Disabled State

```
Background: bg-gray-400
Cursor:     cursor-not-allowed
Opacity:    opacity-50
```

---

## 🎭 Animation States

### Loading State

```jsx
<svg className="animate-spin h-5 w-5 mr-2">
  <circle className="opacity-25" />
  <path className="opacity-75" />
</svg>
```

### Hover State

```css
Button Hover:   hover:bg-blue-700
Link Hover:     hover:text-gray-700
Border Hover:   hover:border-gray-400
```

### Transition

```css
All Elements:   transition-colors
Duration:       Default (150ms)
```

---

## 📊 Data Display

### Reference Ranges

```
Format:     ℹ️ Reference: [min]-[max] [unit]
Example:    ℹ️ Reference: 12.0-17.5 g/dL
Color:      text-gray-500
Size:       text-xs
Position:   Below input field
```

### Warning Messages

```
Format:     ⚠️ [Warning text]
Example:    ⚠️ Fasting required for accurate results
Color:      text-yellow-600
Size:       text-xs
Icon:       AlertCircle (h-3 w-3)
```

### Success Messages

```
Format:     ✓ [Success text]
Example:    ✓ Report saved successfully!
Color:      text-green-600
Background: bg-green-50 border-green-200
Icon:       CheckCircle
```

---

## 🧩 Component Patterns

### Alert Box Pattern

```jsx
<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
  <div className="flex items-start">
    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
    <div>
      <h3 className="text-sm font-medium text-yellow-800">Title</h3>
      <p className="mt-1 text-sm text-yellow-700">Message</p>
    </div>
  </div>
</div>
```

### Input with Icon Pattern

```jsx
<div className="relative">
  <input className="w-full px-4 py-2 pl-10 border rounded-lg" />
  <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
</div>
```

### Error Message Pattern

```jsx
{errors.fieldName && touched.fieldName && (
  <p className="mt-1 text-sm text-red-600 flex items-center">
    <AlertCircle className="h-4 w-4 mr-1" />
    {errors.fieldName}
  </p>
)}
```

---

## 🎪 Interactive Examples

### Example 1: Number Input with Validation

```
Hemoglobin * (g/dL)
┌──────────────────────────┐
│ 14.5                     │  ← Valid input
└──────────────────────────┘
ℹ️ Reference: 12.0-17.5

Hemoglobin * (g/dL)
┌──────────────────────────┐
│ 30.5                     │  ← Invalid input (red border)
└──────────────────────────┘
⚠️ Hemoglobin must not exceed 25
```

### Example 2: Select Dropdown

```
Color *
┌──────────────────────────┐
│ Yellow                ▼ │  ← Selected value
└──────────────────────────┘
ℹ️ Reference: Yellow to Amber
```

### Example 3: Textarea with Character Count

```
Findings *
┌──────────────────────────────────────────┐
│ No acute abnormalities detected. All     │
│ structures appear normal in size and     │
│ configuration.                           │
└──────────────────────────────────────────┘
ℹ️ Reference: 
125/2000 characters
```

---

## 🎨 Custom Styling Example

### Override Default Theme

```javascript
// In your component
const customTheme = {
  primary: 'green',    // Change from blue to green
  radius: 'md',        // rounded-md instead of rounded-lg
  spacing: '8',        // p-8 instead of p-6
};

// Apply custom classes
<button className={`bg-${customTheme.primary}-600 p-${customTheme.spacing} rounded-${customTheme.radius}`}>
  Submit
</button>
```

---

## 📱 Mobile View

```
┌─────────────────────────┐
│  Lab Test Request       │
├─────────────────────────┤
│                         │
│  Test Type *            │
│  [Blood Test        ▼]  │
│                         │
│  ⚠️ Fasting Required    │
│  ☑ I acknowledge        │
│                         │
│  📋 Prep Instructions[+]│
│                         │
│  Preferred Date *       │
│  [📅 2025-10-20]        │
│                         │
│  Preferred Time *       │
│  [🕐 09:30]             │
│                         │
│  Priority               │
│  [Normal            ▼]  │
│                         │
│  [Cancel] [Submit]      │
│                         │
└─────────────────────────┘

Single column layout
Full width inputs
Touch-friendly spacing
```

---

## 🎯 Accessibility Features

```
✓ Semantic HTML (<form>, <label>, <input>)
✓ ARIA labels on icons
✓ Keyboard navigation (Tab, Enter)
✓ Focus visible states
✓ Error announcements
✓ Color contrast (WCAG AA)
✓ Touch target size (44x44px)
✓ Screen reader friendly
```

---

**Visual Guide Version:** 1.0.0  
**Last Updated:** October 14, 2025
