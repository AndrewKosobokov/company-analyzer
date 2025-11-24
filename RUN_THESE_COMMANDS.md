# 🚨 RUN THESE COMMANDS NOW

## Critical: Clear Cache and Restart

### Step 1: Stop Your Dev Server
Press `Ctrl + C` in your terminal

### Step 2: Delete .next Folder

**Copy and paste ONE of these commands:**

**Mac/Linux:**
```bash
rm -rf .next && npm run dev
```

**Windows PowerShell:**
```powershell
Remove-Item -Recurse -Force .next; npm run dev
```

**Windows Command Prompt:**
```cmd
rmdir /s /q .next && npm run dev
```

### Step 3: Hard Refresh Browser

**After server restarts:**

**Mac:**
- Hold: `Cmd + Shift + R`

**Windows:**
- Hold: `Ctrl + Shift + R`

---

## ✅ Quick Verification

### Check Font in DevTools

1. Open your site
2. Right-click "Вектор.Про" (the logo)
3. Click "Inspect"
4. Go to "Computed" tab
5. Find "font-family"

**Should show:**
```
-apple-system, BlinkMacSystemFont, "SF Pro Display"...
```

**On macOS, rendered font:**
```
.AppleSystemUIFont
```
or
```
SF Pro Display
```

---

## 🎯 What To Look For

### On macOS (the key test):

✅ Logo has **slightly wider** letter spacing  
✅ Body text is **tighter** than before  
✅ Text looks **identical** to apple.com  
✅ Buttons are **lighter weight** (not bold anymore)  
✅ Everything is **crisp** (no blur)  

### Compare Side-by-Side:

Open **apple.com** next to your site.  
The font should look **exactly the same**.

---

## 🐛 If Still Not Working

### Nuclear Option:
```bash
# Stop server (Ctrl+C)
rm -rf .next
rm -rf node_modules/.cache
npm run dev
# Then hard refresh browser (Cmd+Shift+R)
```

### Check You're On:
- ✅ macOS (Windows uses Segoe UI instead)
- ✅ Safari or Chrome (best rendering)
- ✅ Hard refreshed (Cmd+Shift+R, not just F5)

---

## 📊 What Changed

| Element | Before | After |
|---------|--------|-------|
| Font Loading | Maybe slow | ⚡ Instant |
| Letter Spacing | Normal | 🎨 Apple-tight |
| Button Weight | 600 (bold) | 400 (normal) |
| Line Height | Generic | Apple exact |

---

## ✨ Success = Looks Like Apple.com

**That's it!** If your site looks like apple.com, you're done. 🎉
















































































