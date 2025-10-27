# 🔍 DEBUG: Find What's Blocking SF Pro Display

## Step-by-Step Browser DevTools Investigation

### Step 1: Inspect the Logo Text

1. **Open your website**
2. **Right-click on "Вектор.Про"** (the logo text)
3. **Click "Inspect"** or "Inspect Element"
4. **DevTools should open** with the element selected

---

## Step 2: Check Computed Styles

### In the DevTools panel:

1. **Click the "Computed" tab** (next to "Styles")
2. **Scroll to find "font-family"**
3. **Copy what it shows** and check against this:

#### ✅ CORRECT (What You Should See):

**On macOS:**
```
-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif
```
**Rendered as:**
```
.AppleSystemUIFont
```
or
```
SF Pro Display
```

**On Windows:**
```
-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif
```
**Rendered as:**
```
Segoe UI
```

#### ❌ WRONG (Problem Indicators):

```
Arial
Helvetica
Helvetica Neue
Times New Roman
serif
```

If you see these, something is overriding our font stack!

---

## Step 3: Check Styles Tab (Find the Culprit)

### In the DevTools panel:

1. **Click the "Styles" tab**
2. **Scroll through all the CSS rules**
3. **Look for any with "font-family" property**

### What to Look For:

#### Crossed-Out Rules (Less Specific)
```css
.logo {
  font-family: ...; /* If this is crossed out, it's being overridden */
}
```

#### Winning Rule (Most Specific)
The rule **without** a strikethrough is the one being applied.

**Check if it's from:**
- ❌ Tailwind CSS (might be overriding)
- ❌ Inline styles (`style=""` attribute)
- ❌ User agent stylesheet (browser default)
- ✅ Your custom CSS (should win)

---

## Step 4: Run JavaScript Diagnostic

### Copy and paste this into the **Console** tab:

```javascript
// ============================================
// FONT DIAGNOSTIC TOOL
// ============================================

console.log('🔍 FONT DIAGNOSTIC REPORT\n' + '='.repeat(50));

// 1. Check logo element
const logo = document.querySelector('.logo');
if (logo) {
  const logoStyles = getComputedStyle(logo);
  console.log('\n📍 LOGO ELEMENT:');
  console.log('Font Family:', logoStyles.fontFamily);
  console.log('Font Size:', logoStyles.fontSize);
  console.log('Font Weight:', logoStyles.fontWeight);
  console.log('Letter Spacing:', logoStyles.letterSpacing);
  console.log('Font Smoothing:', logoStyles.webkitFontSmoothing);
  console.log('Text Rendering:', logoStyles.textRendering);
}

// 2. Check body element
const bodyStyles = getComputedStyle(document.body);
console.log('\n📍 BODY ELEMENT:');
console.log('Font Family:', bodyStyles.fontFamily);
console.log('Font Size:', bodyStyles.fontSize);
console.log('Line Height:', bodyStyles.lineHeight);
console.log('Letter Spacing:', bodyStyles.letterSpacing);

// 3. Check for Tailwind override
const htmlStyles = getComputedStyle(document.documentElement);
console.log('\n📍 HTML ELEMENT:');
console.log('Font Family:', htmlStyles.fontFamily);

// 4. Check for inline styles
if (logo && logo.style.fontFamily) {
  console.log('\n⚠️ INLINE STYLE DETECTED:');
  console.log('Inline Font:', logo.style.fontFamily);
}

// 5. Platform detection
const platform = navigator.platform;
console.log('\n🖥️ PLATFORM:');
console.log('OS:', platform);
console.log('User Agent:', navigator.userAgent);

if (platform.includes('Mac')) {
  console.log('✅ On macOS - Should see SF Pro Display');
} else if (platform.includes('Win')) {
  console.log('✅ On Windows - Should see Segoe UI');
} else if (platform.includes('Linux')) {
  console.log('✅ On Linux - Should see system default');
}

// 6. Check for CSS specificity issues
console.log('\n🎯 CSS RULES APPLIED:');
const logoRules = [];
const sheets = Array.from(document.styleSheets);
sheets.forEach(sheet => {
  try {
    const rules = Array.from(sheet.cssRules || []);
    rules.forEach(rule => {
      if (rule.selectorText && rule.selectorText.includes('.logo')) {
        logoRules.push({
          selector: rule.selectorText,
          fontFamily: rule.style.fontFamily
        });
      }
    });
  } catch (e) {
    // CORS or other error, skip
  }
});
console.table(logoRules);

console.log('\n' + '='.repeat(50));
console.log('📋 Copy this entire output and share it!');
```

---

## Step 5: Visual Font Test

### Run this in Console to see actual font rendering:

```javascript
// Create test elements
const testContainer = document.createElement('div');
testContainer.style.cssText = `
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border: 2px solid black;
  padding: 40px;
  z-index: 999999;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
`;

testContainer.innerHTML = `
  <h2 style="margin-bottom: 20px;">Font Rendering Test</h2>
  
  <p style="font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif; font-size: 24px; margin: 10px 0;">
    <strong>Test 1:</strong> -apple-system (Should be SF Pro)
  </p>
  
  <p style="font-family: Arial; font-size: 24px; margin: 10px 0;">
    <strong>Test 2:</strong> Arial (Should look different)
  </p>
  
  <p style="font-family: Helvetica; font-size: 24px; margin: 10px 0;">
    <strong>Test 3:</strong> Helvetica (Should look different)
  </p>
  
  <p style="font-family: system-ui; font-size: 24px; margin: 10px 0;">
    <strong>Test 4:</strong> system-ui (Should match Test 1)
  </p>
  
  <button onclick="this.parentElement.remove()" style="margin-top: 20px; padding: 10px 20px; cursor: pointer;">
    Close Test
  </button>
`;

document.body.appendChild(testContainer);

console.log('✅ Visual test rendered - Compare fonts!');
```

**If Test 1 and Test 2 look the same, San Francisco is NOT loading!**

---

## Step 6: Check for Overrides

### Run this to find ALL font-family declarations:

```javascript
// Find all elements with font-family
const allElements = document.querySelectorAll('*');
const fontFamilies = new Map();

allElements.forEach(el => {
  const style = getComputedStyle(el);
  const font = style.fontFamily;
  
  if (!fontFamilies.has(font)) {
    fontFamilies.set(font, []);
  }
  fontFamilies.get(font).push({
    element: el.tagName,
    class: el.className,
    font: font
  });
});

console.log('📊 ALL FONTS IN USE:');
fontFamilies.forEach((elements, font) => {
  console.log(`\n${font}:`);
  console.log(`  Used by ${elements.length} elements`);
  console.log('  Examples:', elements.slice(0, 3));
});
```

---

## 🐛 Common Issues & Fixes

### Issue 1: DevTools Shows Arial/Helvetica

**Cause:** CSS specificity - something is overriding our font  
**Fix:** Need to add `!important` temporarily

**Add this to `app/globals.css`:**
```css
.logo {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif !important;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif !important;
}
```

### Issue 2: Tailwind is Overriding

**Cause:** Tailwind's base styles have higher specificity  
**Fix:** Already added `@layer base` but might need stronger

**Update `tailwind.config.ts`:**
```typescript
theme: {
  extend: {
    fontFamily: {
      sans: [
        '-apple-system',
        'BlinkMacSystemFont',
        'SF Pro Display',
        'SF Pro Text',
        'system-ui',
        'sans-serif',
      ],
    },
  },
}
```

### Issue 3: Inline Styles Exist

**Cause:** Some component has `style={{ fontFamily: ... }}`  
**Fix:** Search for inline styles in TSX files

Run:
```bash
grep -r "fontFamily" app/ --include="*.tsx"
```

### Issue 4: Not on macOS

**Reality Check:**
- **Windows:** Will show Segoe UI (not SF Pro) - this is correct!
- **Linux:** Will show system default - this is correct!
- **Only macOS/iOS:** Will show SF Pro Display

If you're on Windows, you'll never see SF Pro Display - that's expected.

---

## 📋 Report Template

**Copy this and fill it out:**

```
=== FONT DEBUG REPORT ===

OS: [Mac / Windows / Linux]
Browser: [Chrome / Safari / Firefox] (version)

DevTools "Computed" tab shows:
font-family: [paste here]

Rendered font (if shown):
[paste here]

DevTools "Styles" tab shows:
Winning rule: [paste selector and rule]
Crossed-out rules: [list any]

JavaScript diagnostic output:
[paste entire console output]

Visual test result:
Test 1 vs Test 2: [Same / Different]

===========================
```

---

## 🎯 Quick Diagnosis Decision Tree

```
Is the computed font-family showing -apple-system?
│
├─ NO → CSS is being overridden
│   └─ Fix: Add !important or increase specificity
│
└─ YES → Font stack is correct
    │
    ├─ Are you on macOS?
    │   │
    │   ├─ NO (Windows) → Should show Segoe UI ✅
    │   ├─ NO (Linux) → Should show system default ✅
    │   └─ YES (macOS) → Should show SF Pro Display
    │       │
    │       └─ Still looks like Arial?
    │           └─ macOS version might be too old
    │               (SF Pro only on 10.11+)
```

---

## ✅ What Success Looks Like

### On macOS:

**DevTools Computed:**
```
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display"...
```

**Rendered font:**
```
.AppleSystemUIFont
```

**Visual:**
- Letters look rounder than Arial
- Slightly wider letter forms
- More consistent stroke width
- Matches apple.com exactly

### On Windows:

**Rendered font:**
```
Segoe UI
```

**Visual:**
- Clean, modern sans-serif
- Similar to SF Pro but not identical
- Matches Windows 10/11 UI

---

## 🚀 Next Steps

1. **Run the JavaScript diagnostic** (copy entire console output)
2. **Take screenshot** of DevTools Computed tab
3. **Run the visual test** (check if fonts look different)
4. **Fill out the report template**
5. **Share the results** so I can provide exact fix

---

**The diagnostic tool will tell us exactly what's wrong!**











































