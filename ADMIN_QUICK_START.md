# 🚀 Admin Panel - Quick Start Guide

**Admin User:** kosobokov90@yandex.ru

---

## ⚡ 3-Minute Setup

### Windows Users:
```cmd
ADMIN_SETUP_COMMANDS.cmd
```

### Linux/Mac Users:
```bash
chmod +x ADMIN_SETUP_COMMANDS.sh
./ADMIN_SETUP_COMMANDS.sh
```

### Manual Setup:
```bash
# 1. Generate Prisma client
npx prisma generate

# 2. Update database
npx prisma db push

# 3. Restart server
npm run dev
```

---

## 🔑 Enable Admin Access (ONE TIME ONLY)

### Option 1: Browser/Postman
```
POST http://localhost:3000/api/admin/init
```

### Option 2: curl (Windows PowerShell)
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/admin/init" -Method POST
```

### Option 3: curl (Linux/Mac)
```bash
curl -X POST http://localhost:3000/api/admin/init
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Admin role set successfully",
  "user": "kosobokov90@yandex.ru"
}
```

---

## 🎯 Access Admin Panel

1. **Login:** http://localhost:3000/login
   - Email: kosobokov90@yandex.ru
   - Password: (your password)

2. **Admin Dashboard:** http://localhost:3000/admin

3. **Security Cleanup:**
   ```bash
   # After confirming admin access works:
   rm app/api/admin/init/route.ts
   # or on Windows:
   del app\api\admin\init\route.ts
   ```

---

## 📊 What You Can Do

### View Statistics:
- Total users count
- Active users (last 7 days)
- Total analyses created
- Plan distribution

### Manage Users:
- View all user accounts
- See analysis usage per user
- **Update user limits** (any value)
- View user creation dates

### Monitor Reports:
- View 100 most recent analyses
- See which users create reports
- Monitor platform usage

---

## 🔒 Security Notes

✅ Admin endpoints require JWT authentication
✅ All routes verify admin role
✅ Non-admin users get "Access denied"
✅ Init endpoint should be deleted after first use

⚠️ **Important:** Delete `/api/admin/init/route.ts` after setting admin role!

---

## 🛠️ Troubleshooting

### "Access denied" error?
- Verify POST /api/admin/init was successful
- Check you're logged in as kosobokov90@yandex.ru
- Clear browser cache and re-login

### Can't access /admin?
- Confirm database was updated (npx prisma db push)
- Restart dev server
- Check browser console for errors

### "Failed to fetch stats"?
- Verify JWT token is valid
- Check server logs for errors
- Confirm Prisma client was regenerated

---

## 📱 Admin Panel Features

### User Management Table
| Column | Description |
|--------|-------------|
| Email | User email address |
| Name | User display name |
| Plan | Current subscription plan |
| Limit | Analysis limit (editable) |
| Analyses | Total analyses created |
| Actions | Edit button for limit changes |

### How to Change User Limit:
1. Find user in table
2. Click "Изменить" button
3. Enter new limit value
4. Click "Сохранить"
5. Table refreshes automatically

---

## 🎨 UI Design

- **Monochrome theme** (black/white/grey)
- **Responsive layout** (desktop + mobile)
- **Inline editing** (no modals)
- **Real-time stats** (auto-refresh on update)
- **Clean tables** (easy scanning)

---

## ✅ Success Checklist

- [ ] Run setup commands
- [ ] Call init endpoint once
- [ ] Login as admin
- [ ] Access /admin successfully
- [ ] View user statistics
- [ ] Test limit update
- [ ] Delete init endpoint
- [ ] Verify non-admin can't access

---

**Setup Complete! Access your admin panel at:**
👉 http://localhost:3000/admin
























