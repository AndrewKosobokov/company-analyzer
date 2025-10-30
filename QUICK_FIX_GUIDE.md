# 🔧 Quick Fix Guide - Based on What You Find

## Run This First (Diagnostic Command)

**Copy and paste into browser console:**

```javascript
const logo = document.querySelector('.logo');
const computed = getComputedStyle(logo);
console.log('Font:', computed.fontFamily);
console.log('Platform:', navigator.platform);
console.log('Rendered:', computed.fontFamily.split(',')[0]);
```

---

## Fix #1: If Console Shows "Arial" or "Helvetica"

### Problem: CSS is being overridden

**SOLUTION: Add to `app/globals.css` at line 189:**

```css
.logo {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif !important;
  font-size: 22px;
  font-weight: 600;
  letter-spacing: 0.011em !important;
}
```

**Then:**
```bash
rm -rf .next && npm run dev
```

---

## Fix #2: If You See Tailwind Classes in Styles Tab

### Problem: Tailwind utility classes overriding

**SOLUTION: Remove Tailwind font classes**

Search for these in your TSX files:
```bash
grep -r "font-sans\|font-serif\|font-mono" app/ --include="*.tsx"
```

Remove any:
- `className="font-sans"`
- `className="font-serif"`
- `className="font-mono"`

---

## Fix #3: If on Windows and Seeing Arial

### This might be correct!

Windows doesn't have SF Pro Display. Check console:
```javascript
console.log(navigator.platform);
```

**If shows "Win":**
- Should render as **Segoe UI** (not SF Pro)
- This is correct behavior!
- Compare to Microsoft.com - should match

---

## Fix #4: If Computed Shows Correct Font But Looks Wrong

### Problem: Font smoothing not applied

**SOLUTION: Check these lines exist at TOP of `globals.css`:**

```css
@supports (font: -apple-system-body) {
  html {
    font: -apple-system-body;
  }
}

* {
  -webkit-font-smoothing: antialiased !important;
  -moz-osx-font-smoothing: grayscale !important;
  text-rendering: optimizeLegibility !important;
}
```

---

## Fix #5: Nuclear Option (If Nothing Else Works)

### Clear everything and force the font:

**1. Update `app/globals.css` - Add at VERY TOP:**

```css
/* NUCLEAR FONT FIX */
html,
html *,
body,
body * {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif !important;
}

@supports (font: -apple-system-body) {
  html, body {
    font: -apple-system-body !important;
  }
}
```

**2. Delete cache:**
```bash
rm -rf .next
rm -rf node_modules/.cache
npm run dev
```

**3. Hard refresh:**
- Mac: `Cmd + Shift + R`
- Windows: `Ctrl + Shift + R`

---

## Fix #6: If Console Shows ".AppleSystemUIFont" But Looks Like Arial

### Problem: macOS version too old

**Check macOS version:**
```javascript
console.log(navigator.userAgent);
```

**SF Pro Display requires:**
- macOS 10.11 (El Capitan) or newer
- iOS 9 or newer

**If older:**
- You'll get Helvetica Neue (fallback)
- Upgrade macOS or accept Helvetica

---

## 🎯 Decision Matrix

| Console Shows | Platform | Expected | Action |
|---------------|----------|----------|--------|
| `-apple-system` | Mac | SF Pro Display | ✅ Correct |
| `-apple-system` | Windows | Segoe UI | ✅ Correct |
| `Arial` | Mac | Should be SF Pro | ❌ Apply Fix #1 |
| `Arial` | Windows | Should be Segoe UI | ❌ Apply Fix #1 |
| `Helvetica` | Mac | Should be SF Pro | ⚠️ Check macOS version |

---

## 📊 Verification After Fix

**Run this after applying any fix:**

```javascript
// Quick verification
const tests = {
  logo: document.querySelector('.logo'),
  body: document.body,
  h1: document.querySelector('h1')
};

Object.entries(tests).forEach(([name, el]) => {
  if (el) {
    const font = getComputedStyle(el).fontFamily;
    const correct = font.includes('-apple-system') || font.includes('system-ui');
    console.log(`${name}: ${correct ? '✅' : '❌'} ${font.split(',')[0]}`);
  }
});
```

**Should show:**
```
logo: ✅ -apple-system
body: ✅ -apple-system
h1: ✅ -apple-system
```

---

## 🚀 The "Just Make It Work" Command

**If you're frustrated and just want it to work:**

```bash
# 1. Stop server (Ctrl+C)

# 2. Run this mega-command:
rm -rf .next && rm -rf node_modules/.cache && npm run dev

# 3. Wait for server to restart

# 4. Hard refresh browser:
# Mac: Cmd + Shift + R
# Windows: Ctrl + Shift + R

# 5. Check console:
# Right-click logo → Inspect → Console tab → Paste:
console.log('Font:', getComputedStyle(document.querySelector('.logo')).fontFamily)
```

**If still shows Arial after this, you need Fix #1 (add !important)**

---

## ✅ Final Confirmation Test

**This will definitively tell you if SF Pro is rendering:**

```javascript
// Create side-by-side comparison
const test = document.createElement('div');
test.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 40px; border: 3px solid black; z-index: 999999; box-shadow: 0 20px 60px rgba(0,0,0,0.3);';

test.innerHTML = `
  <div style="font-family: -apple-system; font-size: 48px; margin: 10px 0;">
    Вектор.Про (SF Pro)
  </div>
  <div style="font-family: Arial; font-size: 48px; margin: 10px 0;">
    Вектор.Про (Arial)
  </div>
  <p style="margin: 20px 0; font-size: 14px;">
    <strong>On macOS:</strong> These should look DIFFERENT<br>
    <strong>On Windows:</strong> These might look similar
  </p>
  <button onclick="this.parentElement.remove()" style="padding: 10px 20px; cursor: pointer; background: black; color: white; border: none; border-radius: 8px;">
    Close
  </button>
`;

document.body.appendChild(test);
```

**If the two lines look identical on macOS, SF Pro is NOT loading.**

---

## 📞 Need More Help?

**Share these 3 things:**

1. **Console output:**
```javascript
console.log('Font:', getComputedStyle(document.querySelector('.logo')).fontFamily);
console.log('Platform:', navigator.platform);
console.log('User Agent:', navigator.userAgent);
```

2. **Screenshot** of DevTools → Computed tab → font-family

3. **Operating System** (Mac/Windows/Linux and version)

---

**Most likely you need Fix #1 (add !important) or Fix #5 (nuclear option).**
























































