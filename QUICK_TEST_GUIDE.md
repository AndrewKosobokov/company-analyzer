# Quick Test Guide - Target Proposal Fix

## Quick Test (5 minutes)

### 1. Start the App
```bash
npm run dev
```

### 2. Navigate to a Report
```
http://localhost:3000/report/{reportId}
```

### 3. Open Target Proposal
- Click **"Целевое предложение"** button in left sidebar
- Modal should open
- Loading state shows (~30 seconds)
- Progress bar animates

### 4. Test Export Buttons
Once text appears, test each button:

#### PDF Export
- Click **PDF** button
- File downloads: `Целевое предложение - {CompanyName}.pdf`
- Open PDF - should show formatted text with Cyrillic support

#### Word Export
- Click **Word** button
- File downloads: `Целевое предложение - {CompanyName}.docx`
- Open in Word/LibreOffice - should show formatted document

#### Copy
- Click **Копировать** button
- Button changes to "Скопировано!" for 2 seconds
- Paste somewhere (Ctrl+V) - should paste full text with header

#### Telegram
- Click **Telegram** icon
- Should open Telegram (app or web)
- Message pre-filled with proposal text

#### WhatsApp
- Click **WhatsApp** icon
- Should open WhatsApp (app or web)
- Message pre-filled with proposal text

### 5. Verify Content Format
Check that the text:
- ✅ Has clear section headers (ПОЗИЦИОНИРОВАНИЕ, etc.)
- ✅ Has proper line breaks between sections
- ✅ NO emojis anywhere
- ✅ Professional, business tone
- ✅ Plain text (not JSON structure)

---

## Expected Button Layout

```
[PDF] [Word] [Копировать]  |  [Telegram Icon] [WhatsApp Icon]
```

---

## What Changed

### Before:
```json
{
  "proposal": {
    "positioning": "...",
    "painPoints": ["...", "..."],
    "benefits": {...}
  }
}
```
- JSON structured response
- Export buttons showed alerts
- No messenger sharing

### After:
```json
{
  "proposalText": "ПОЗИЦИОНИРОВАНИЕ\n\n..."
}
```
- Plain text response (like Gemini)
- All export buttons work
- Telegram/WhatsApp sharing added

---

## If Something Doesn't Work

### PDF/Word Export Fails
Check browser console for errors:
```javascript
// Should see:
exportToPDF called with: title, inn, content
```

### Copy Doesn't Work
- Check if HTTPS (clipboard API requires secure context)
- Try: `navigator.clipboard.writeText()` in console

### Telegram/WhatsApp Don't Open
- Check if buttons have `onClick` handlers
- Console should show: `shareToTelegram called`
- Verify URLs are generated correctly

### No Text Appears
- Check API response in Network tab
- Should return: `{ "proposalText": "..." }`
- NOT: `{ "proposal": {...} }`

---

## Files That Were Changed

1. `app/components/TargetProposalModal.tsx` - Complete rewrite
2. `app/api/analysis/generate-proposal/route.ts` - Response format

Files that were NOT changed (already working):
- `utils/exportReport.ts` - Export utilities
- `app/report/[id]/page.tsx` - Modal integration

---

## Success Criteria

✅ Modal opens on button click  
✅ Loading state shows with progress bar  
✅ Plain text appears (no JSON structure)  
✅ PDF export downloads file  
✅ Word export downloads file  
✅ Copy button works with feedback  
✅ Telegram opens with message  
✅ WhatsApp opens with message  
✅ No emojis in content  
✅ Professional formatting  
✅ Button layout matches main report  

---

## Common Issues

### Issue: "Export buttons still show alerts"
**Solution:** Clear browser cache and refresh

### Issue: "Text shows as JSON"
**Solution:** Check API endpoint - should NOT have `responseMimeType: 'application/json'`

### Issue: "Copy button doesn't work"
**Solution:** Must be on HTTPS or localhost

### Issue: "Buttons don't wrap on mobile"
**Solution:** Check `flexWrap: 'wrap'` in button container style

---

## Production Checklist

Before deploying to production:

- [ ] Test PDF export with Cyrillic text
- [ ] Test Word export opens correctly
- [ ] Test copy on mobile devices
- [ ] Test Telegram deep link on mobile
- [ ] Test WhatsApp on mobile
- [ ] Verify no console errors
- [ ] Check mobile responsive layout
- [ ] Test with different report lengths
- [ ] Verify GEMINI_API_KEY is set
- [ ] Check JWT authentication works

---

## Environment Variables

Make sure you have:
```bash
GEMINI_API_KEY=your_key_here
JWT_SECRET=your_secret_here
```

---

## Performance

- Generation time: ~30 seconds (Gemini processing)
- PDF generation: ~2-3 seconds
- Word generation: ~1-2 seconds
- Copy: Instant
- Messenger share: Instant (opens external app)

---

## Browser Compatibility

### Desktop
- ✅ Chrome/Edge (full support)
- ✅ Firefox (full support)
- ✅ Safari (full support)

### Mobile
- ✅ Chrome Android (full support)
- ✅ Safari iOS (full support)
- ⚠️ Copy may require user interaction on some browsers

---

## Next Steps

If everything works:
1. Commit changes
2. Push to production
3. Update documentation
4. Train users on new features

If issues found:
1. Check browser console
2. Check Network tab for API calls
3. Verify file changes were applied
4. Clear cache and retry


