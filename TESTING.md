# Authentication Flow Testing Checklist

This document outlines the complete authentication flow testing procedures for the Vektор.Про application.

---

## 1. UNAUTHENTICATED USER TESTS

### Test 1.1: Home Page Access
- **Action**: Visit `/` (home page)
- **Expected Result**: 
  - ✓ Home page loads successfully
  - ✓ Header shows "Тарифы" and "Войти" button
  - ✓ No authenticated menu items visible (Анализ, Компании, Профиль, Выйти)

### Test 1.2: Pricing Page Access
- **Action**: Click "Тарифы" from home page or visit `/pricing` directly
- **Expected Result**: 
  - ✓ Pricing page loads successfully
  - ✓ No authentication required (public page)
  - ✓ Header still shows unauthenticated menu

### Test 1.3: Protected Route - Analysis
- **Action**: Try to visit `/analysis` directly (without login)
- **Expected Result**: 
  - ✓ Immediate redirect to `/login`
  - ✓ Loading spinner shown briefly
  - ✓ Login page displayed

### Test 1.4: Protected Route - Companies
- **Action**: Try to visit `/companies` directly (without login)
- **Expected Result**: 
  - ✓ Immediate redirect to `/login`
  - ✓ Cannot access companies list

### Test 1.5: Protected Route - Profile
- **Action**: Try to visit `/profile` directly (without login)
- **Expected Result**: 
  - ✓ Immediate redirect to `/login`
  - ✓ Cannot access profile page

### Test 1.6: Protected Route - Report
- **Action**: Try to visit `/report/[id]` directly (without login)
- **Expected Result**: 
  - ✓ Immediate redirect to `/login`
  - ✓ Cannot access report page

---

## 2. LOGIN FLOW TESTS

### Test 2.1: Access Login Page
- **Action**: Visit `/login`
- **Expected Result**: 
  - ✓ Login page loads successfully
  - ✓ "Вход" tab is active by default
  - ✓ Shows email and password fields
  - ✓ "Войти" button visible

### Test 2.2: Login Form Validation
- **Action**: Try to submit empty login form
- **Expected Result**: 
  - ✓ Browser validation prevents submission
  - ✓ Email field shows "required" error
  - ✓ Password field shows "required" error

### Test 2.3: Successful Login
- **Action**: 
  1. Enter valid email and password
  2. Click "Войти"
- **Expected Result**: 
  - ✓ Loading state shows "Вход..."
  - ✓ API call to `/api/auth/login` succeeds
  - ✓ Token saved to `localStorage` (key: `token`)
  - ✓ User data saved to `localStorage` (key: `userData`)
  - ✓ Automatic redirect to `/analysis`
  - ✓ Menu changes to authenticated menu
  - ✓ Shows: Анализ, Компании, Тарифы, Профиль, Выйти

### Test 2.4: Failed Login - Wrong Password
- **Action**: Enter valid email but wrong password
- **Expected Result**: 
  - ✓ Error message displayed
  - ✓ No redirect occurs
  - ✓ User stays on login page
  - ✓ Can try again

### Test 2.5: Failed Login - Wrong Email
- **Action**: Enter non-existent email
- **Expected Result**: 
  - ✓ Error message displayed
  - ✓ No redirect occurs
  - ✓ User stays on login page

### Test 2.6: Login When Already Authenticated
- **Action**: Login successfully, then try to visit `/login` again
- **Expected Result**: 
  - ✓ Automatic redirect to `/analysis`
  - ✓ Cannot access login page when logged in

---

## 3. REGISTER FLOW TESTS

### Test 3.1: Access Registration Tab
- **Action**: 
  1. Visit `/login`
  2. Click "Регистрация" tab
- **Expected Result**: 
  - ✓ Registration tab becomes active
  - ✓ Shows all 5 fields: Имя, Email, Пароль, Организация, Телефон
  - ✓ "Зарегистрироваться" button visible

### Test 3.2: Registration Form Validation
- **Action**: Try to submit empty registration form
- **Expected Result**: 
  - ✓ Browser validation prevents submission
  - ✓ All required fields show errors

### Test 3.3: Password Length Validation
- **Action**: Enter password with less than 8 characters
- **Expected Result**: 
  - ✓ Browser validation shows "минимум 8 символов" error
  - ✓ Cannot submit form

### Test 3.4: Successful Registration
- **Action**: 
  1. Fill all fields with valid data:
     - Имя: "Test User"
     - Email: "test@example.com"
     - Пароль: "password123" (min 8 chars)
     - Организация: "Test Company"
     - Телефон: "+7 (999) 123-45-67"
  2. Click "Зарегистрироваться"
- **Expected Result**: 
  - ✓ Loading state shows "Регистрация..."
  - ✓ API call to `/api/auth/register` succeeds
  - ✓ Token saved to `localStorage`
  - ✓ User data saved to `localStorage`
  - ✓ Automatic redirect to `/analysis`
  - ✓ User is logged in (authenticated menu visible)

### Test 3.5: Failed Registration - Existing Email
- **Action**: Try to register with already registered email
- **Expected Result**: 
  - ✓ Error message displayed (e.g., "Email already exists")
  - ✓ No redirect occurs
  - ✓ User stays on registration form

### Test 3.6: Switch Between Login and Register
- **Action**: 
  1. Enter data in login form
  2. Switch to register tab
  3. Switch back to login tab
- **Expected Result**: 
  - ✓ Tabs switch smoothly
  - ✓ Error messages clear when switching
  - ✓ Form data is preserved (or cleared based on design)

---

## 4. AUTHENTICATED USER TESTS

### Test 4.1: Access Protected Pages
- **Action**: After login, navigate to:
  - `/analysis`
  - `/companies`
  - `/profile`
- **Expected Result**: 
  - ✓ All pages load successfully
  - ✓ No redirects to login
  - ✓ Content visible

### Test 4.2: Authenticated Menu Display
- **Action**: Check header menu after login
- **Expected Result**: 
  - ✓ Shows: Анализ, Компании, Тарифы, Профиль, Выйти
  - ✓ Does NOT show: "Войти" button
  - ✓ Logo links to `/analysis` (not `/`)

### Test 4.3: Navigation Between Pages
- **Action**: 
  1. Login
  2. Click "Компании"
  3. Click "Профиль"
  4. Click "Анализ"
  5. Click "Тарифы"
- **Expected Result**: 
  - ✓ All navigation works
  - ✓ No unexpected redirects
  - ✓ Menu remains visible
  - ✓ Active page indicator (if implemented)

### Test 4.4: Logout Flow
- **Action**: 
  1. Login successfully
  2. Click "Выйти" button
- **Expected Result**: 
  - ✓ `localStorage` is cleared (token and userData removed)
  - ✓ Automatic redirect to `/` (home page)
  - ✓ Menu changes back to unauthenticated state
  - ✓ Shows "Тарифы" and "Войти" button again

### Test 4.5: Access Login Page After Logout
- **Action**: 
  1. Logout
  2. Try to visit `/login`
- **Expected Result**: 
  - ✓ Login page loads successfully
  - ✓ Can login again

### Test 4.6: Access Protected Routes After Logout
- **Action**: 
  1. Logout
  2. Try to visit `/analysis`, `/companies`, `/profile`
- **Expected Result**: 
  - ✓ All redirect to `/login`
  - ✓ Cannot access without authentication

---

## 5. PERSISTENCE TESTS

### Test 5.1: Page Refresh While Logged In
- **Action**: 
  1. Login successfully
  2. Navigate to `/analysis`
  3. Refresh the page (F5 or Ctrl+R)
- **Expected Result**: 
  - ✓ User remains logged in
  - ✓ `/analysis` page reloads successfully
  - ✓ No redirect to login
  - ✓ Authenticated menu still visible

### Test 5.2: Browser Close and Reopen
- **Action**: 
  1. Login successfully
  2. Close browser completely
  3. Reopen browser
  4. Visit the website
- **Expected Result**: 
  - ✓ User remains logged in (token persists)
  - ✓ Can access protected routes
  - ✓ Authenticated menu visible
  - ✓ User data restored from localStorage

### Test 5.3: Page Refresh After Logout
- **Action**: 
  1. Logout
  2. Refresh the page
- **Expected Result**: 
  - ✓ User stays logged out
  - ✓ No authentication data in localStorage
  - ✓ Unauthenticated menu visible

### Test 5.4: New Tab While Logged In
- **Action**: 
  1. Login in Tab 1
  2. Open new Tab 2
  3. Navigate to the website in Tab 2
- **Expected Result**: 
  - ✓ User is logged in in Tab 2
  - ✓ Same authentication state across tabs
  - ✓ Can access protected routes in both tabs

### Test 5.5: Logout in One Tab
- **Action**: 
  1. Login and open two tabs
  2. Logout in Tab 1
  3. Navigate in Tab 2
- **Expected Result**: 
  - ✓ Tab 1 shows logged out state
  - ✓ Tab 2 might still show logged in (until refresh)
  - ✓ Refreshing Tab 2 should show logged out state

### Test 5.6: LocalStorage Inspection
- **Action**: 
  1. Login
  2. Open browser DevTools → Application → Local Storage
- **Expected Result**: 
  - ✓ `token` key exists with JWT value
  - ✓ `userData` key exists with JSON object containing:
    - name
    - email
    - organization

---

## 6. EDGE CASES AND ERROR HANDLING

### Test 6.1: Invalid Token in LocalStorage
- **Action**: 
  1. Login
  2. Manually modify token in localStorage to invalid value
  3. Refresh page or navigate
- **Expected Result**: 
  - ✓ API calls fail with 401/403
  - ✓ User should be logged out (ideally)
  - ✓ Redirect to login

### Test 6.2: Expired Token
- **Action**: Use expired JWT token
- **Expected Result**: 
  - ✓ API returns 401 Unauthorized
  - ✓ User logged out automatically (if implemented)
  - ✓ Redirect to login

### Test 6.3: Network Error During Login
- **Action**: 
  1. Disconnect network
  2. Try to login
- **Expected Result**: 
  - ✓ Error message displayed
  - ✓ User stays on login page
  - ✓ Can retry after reconnecting

### Test 6.4: Slow API Response
- **Action**: Simulate slow network (DevTools → Network → Slow 3G)
- **Expected Result**: 
  - ✓ Loading indicators shown
  - ✓ UI remains responsive
  - ✓ Eventually completes or times out gracefully

---

## 7. DEVELOPER TESTING TOOLS

### Browser DevTools Checks:
1. **Console**: No errors during normal flow
2. **Network**: 
   - Check API calls to `/api/auth/login` and `/api/auth/register`
   - Verify Authorization headers on protected API calls
3. **Application → Local Storage**:
   - Verify `token` and `userData` storage
4. **React DevTools** (if available):
   - Check AuthContext state
   - Verify isAuthenticated boolean

### Manual Testing Commands:
```javascript
// Check if user is logged in (in browser console)
console.log('Token:', localStorage.getItem('token'))
console.log('User Data:', JSON.parse(localStorage.getItem('userData')))

// Manually logout
localStorage.clear()
location.reload()

// Check localStorage size
console.log('LocalStorage size:', new Blob(Object.values(localStorage)).size, 'bytes')
```

---

## 8. REGRESSION TESTING

After any code changes, re-run these critical tests:

- ✓ Login → Redirect to /analysis
- ✓ Register → Redirect to /analysis
- ✓ Protected routes redirect unauthenticated users
- ✓ Logout → Clear storage → Redirect to home
- ✓ Page refresh maintains authentication state

---

## TEST STATUS TRACKER

| Test Category | Status | Notes |
|---------------|--------|-------|
| 1. Unauthenticated User | ⏳ Pending | |
| 2. Login Flow | ⏳ Pending | |
| 3. Register Flow | ⏳ Pending | |
| 4. Authenticated User | ⏳ Pending | |
| 5. Persistence | ⏳ Pending | |
| 6. Edge Cases | ⏳ Pending | |

**Legend:**
- ⏳ Pending
- ✅ Passed
- ❌ Failed
- ⚠️ Partial

---

## AUTOMATED TESTING (Future Enhancement)

Consider implementing:
- E2E tests with Playwright or Cypress
- Unit tests for AuthContext
- Integration tests for authentication API routes
- Mock localStorage for testing

---

## NOTES

- Test with different browsers: Chrome, Firefox, Safari, Edge
- Test on mobile devices (responsive design)
- Clear localStorage between major test runs
- Document any bugs found with screenshots
- Verify all console errors are addressed

---

**Last Updated**: $(date)
**Tester**: _______________
**Build Version**: _______________




































