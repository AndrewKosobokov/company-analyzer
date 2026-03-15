# MetalVector - Логика проекта

## 1. Структура роутинга

В проекте **нет route groups** вида `(public)` / `(protected)` / `(admin)`.
Структура реальная и плоская: страницы лежат прямо в `app/`, а защита делается через `middleware.ts`, `AuthContext` и проверки в admin API/page.

```text
app/
├── page.tsx                          → /
├── layout.tsx
├── about/page.tsx                    → /about
├── analysis/page.tsx                 → /analysis
├── admin/page.tsx                    → /admin
├── admin/dashboard/page.tsx          → /admin/dashboard
├── admin/users/page.tsx              → /admin/users
├── companies/page.tsx                → /companies
├── companies/[id]/page.tsx           → /companies/[id]
├── contacts/page.tsx                 → /contacts
├── forgot-password/page.tsx          → /forgot-password
├── login/page.tsx                    → /login
├── offer/page.tsx                    → /offer
├── payment/success/page.tsx          → /payment/success
├── pricing/page.tsx                  → /pricing
├── privacy/page.tsx                  → /privacy
├── profile/page.tsx                  → /profile
├── public/layout.tsx
├── public/report/[id]/page.tsx       → /public/report/[id]
├── public/targeted-offer/[id]/page.tsx
├── report/[id]/page.tsx              → /report/[id]
├── reset-password/page.tsx           → /reset-password
├── terms/page.tsx                    → /terms
├── verify-email/page.tsx             → /verify-email
├── components/
├── context/
├── lib/
└── api/
    ├── analyze/route.ts
    ├── auth/
    │   ├── login/route.ts
    │   ├── logout/route.ts
    │   ├── register/route.ts
    │   ├── status/route.ts
    │   ├── refresh/route.ts
    │   ├── forgot-password/route.ts
    │   ├── reset-password/route.ts
    │   ├── verify-email/route.ts
    │   └── change-password/route.ts
    ├── payment/
    │   ├── create/route.ts
    │   ├── check/[id]/route.ts
    │   └── webhook/route.ts
    ├── payments/history/route.ts
    ├── export/
    │   ├── pdf/route.ts
    │   └── word/route.ts
    ├── user/analyses-count/route.ts
    ├── analysis/
    │   ├── manage/route.ts
    │   ├── report/[analysisId]/route.ts
    │   └── save/route.ts
    ├── reports/archive/route.ts
    ├── trash/permanent-delete/route.ts
    ├── public/report/[id]/route.ts
    ├── product-analyze/route.ts
    ├── admin/
    │   ├── dashboard/
    │   │   ├── metrics/route.ts
    │   │   ├── users/route.ts
    │   │   └── ai-health/route.ts
    │   ├── users/route.ts
    │   ├── users/analyses-count/route.ts
    │   ├── users/[id]/route.ts
    │   ├── users/[id]/analyses-count/route.ts
    │   ├── delete-user/route.ts
    │   ├── reports/route.ts
    │   ├── stats/route.ts
    │   ├── init/route.ts
    │   ├── lib/verifyAdmin.ts
    │   └── fix-balances/route.ts   ← временный emergency endpoint
    ├── test/list-models/route.ts
    └── test-verification-email/route.ts
```

### Публичные страницы

- `/`
- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/verify-email`
- `/pricing`
- `/terms`
- `/privacy`

### Защищенные страницы

Все остальные page routes, если не входят в список public.

### Админские страницы

- `/admin`
- `/admin/dashboard`
- `/admin/users`

Важно: middleware не проверяет `role === 'admin'`. Админский доступ реально ограничивается:

1. на клиенте через `AuthContext + isAdmin`
2. на сервере через `verifyAdmin()`

---

## 2. Middleware (защита роутов)

Файл: `middleware.ts`

### Что делает middleware

1. Пропускает статику
2. Пропускает public pages
3. Пропускает public API
4. Для всего остального требует access token
5. Если токен истек для page request — пытается отправить на refresh
6. Если токена нет — редиректит на `/login`

### Публичные page routes

```ts
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/pricing',
  '/terms',
  '/privacy'
];
```

### Публичные API routes

```ts
const API_PUBLIC_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/verify-email',
  '/api/auth/refresh',
  '/api/payment/webhook'
];
```

### Важный факт

В `middleware.ts` **нет** специальной ветки:

```ts
if (pathname.startsWith('/admin')) {
  // check role
}
```

То есть middleware валидирует **только токен**, но не роль.
Проверка роли администратора вынесена в client pages и admin API.

---

## 3. AuthContext (состояние пользователя)

Файл: `app/context/AuthContext.tsx`

### Что хранит

- `isAuthenticated`
- `user`
- `isAdmin`
- `loading`
- `hydrated`

### Как работает

#### При загрузке:

- `useEffect(() => checkAuth(), [])`
- делает `GET /api/auth/status`
- если успешно:
  - кладет `user`
  - ставит `isAuthenticated = true`
  - ставит `isAdmin = user.role === 'admin'`
- если `401`:
  - пробует `POST /api/auth/refresh`

#### `login(email, password)`

- `POST /api/auth/login`
- получает user из ответа
- обновляет state
- auth cookie ставится сервером

#### `logout()`

- `POST /api/auth/logout`
- очищает local state
- чистит legacy localStorage
- редиректит на `/login`

---

## 4. Header (навигация)

Файл: `app/components/Header.tsx`

### Если пользователь не залогинен

Показываются:

- `Тарифы`
- `Войти`

### Если пользователь залогинен

Показываются:

- `Анализ`
- `Отчеты`
- `Тарифы`
- `Профиль`
- `Выйти`

### Если пользователь админ

Дополнительно показывается:

- `Админ-панель`

### Logout flow

- клик по `Выйти`
- вызывается `logout()`
- затем `router.push('/login')`

---

## 5. Пользовательские флоу

### Флоу 1. Регистрация

```text
/register
  ↓
POST /api/auth/register
  ↓
prisma.user.create({
  plan: 'trial',
  analysesRemaining: 3
})
  ↓
email verification token
  ↓
письмо подтверждения
  ↓
/login
  ↓
POST /api/auth/login
  ↓
JWT access + refresh cookies
  ↓
AuthContext.checkAuth/status
  ↓
isAuthenticated = true
```

Важно: в текущем `register` явно ставится `analysesRemaining: 3`, а `analysesInitial` опирается на default schema.

### Флоу 2. Создание анализа

```text
/analysis
  ↓
POST /api/analyze
  ↓
middleware валидирует токен
  ↓
API берет userId из JWT
  ↓
prisma.user.findUnique(select: { analysesRemaining, plan })
  ↓
если analysesRemaining <= 0 → 403
  ↓
fetch сайта / обработка INN
  ↓
generatePrompt(...)
  ↓
Vertex AI
  ↓
prisma.analysis.create(...)
  ↓
prisma.user.update({
  data: { analysesRemaining: { decrement: 1 } }
})
  ↓
frontend открывает /report/[id]
```

### Флоу 3. Покупка тарифа

```text
/pricing
  ↓
POST /api/payment/create
  ↓
createPayment(...) в ЮKassa
  ↓
prisma.payment.create(status=pending/created)
  ↓
redirect на confirmationUrl
  ↓
ЮKassa webhook
  ↓
POST /api/payment/webhook
  ↓
prisma.payment.update(status='succeeded')
  ↓
prisma.user.update({
  analysesRemaining: { increment: dbPayment.analysesCount },
  plan: dbPayment.planName
})
```

Важно: webhook сейчас обновляет `plan` и `analysesRemaining`, но **не обновляет `analysesInitial`**. Для консистентности это место тоже стоит выровнять.

### Флоу 4. Админ управляет пользователями

```text
/admin/users
  ↓
useAuth() → isAuthenticated / isAdmin
  ↓
если не admin → redirect
  ↓
GET /api/admin/users
  ↓
verifyAdmin()
  ↓
список пользователей
  ↓
открытие EditUserModal
  ↓
PATCH /api/admin/users/[id]
  ↓
SET_PLAN / SET_REPORTS / ADD_REPORTS / SUBTRACT_REPORTS
  ↓
обновление prisma.user
  ↓
повторная загрузка списка
```

---

## 6. API Endpoints

| Endpoint | Method | Auth | Описание |
|---|---|---:|---|
| `/api/auth/register` | POST | NO | Регистрация, создание user, verification token |
| `/api/auth/login` | POST | NO | Логин, выдача access/refresh cookies |
| `/api/auth/logout` | POST | YES | Очистка auth cookies |
| `/api/auth/status` | GET | YES | Получение текущего пользователя |
| `/api/auth/refresh` | POST | refresh | Обновление access token |
| `/api/auth/forgot-password` | POST | NO | Сброс пароля |
| `/api/auth/reset-password` | POST | NO | Подтверждение нового пароля |
| `/api/auth/verify-email` | GET/POST | NO | Подтверждение email |
| `/api/auth/change-password` | POST | YES | Смена пароля |
| `/api/analyze` | POST | YES | Создание анализа через Vertex AI |
| `/api/product-analyze` | POST | YES | Анализ продукта |
| `/api/user/analyses-count` | GET | YES | Кол-во анализов пользователя |
| `/api/payment/create` | POST | YES | Создание платежа |
| `/api/payment/check/[id]` | GET | YES | Проверка статуса платежа |
| `/api/payment/webhook` | POST | NO | Webhook от ЮKassa |
| `/api/payments/history` | GET | YES | История платежей |
| `/api/admin/users` | GET | ADMIN | Список пользователей |
| `/api/admin/users` | PATCH | ADMIN | Обновление остатка анализов |
| `/api/admin/users/[id]` | PATCH | ADMIN | Изменение плана/лимита пользователя |
| `/api/admin/users/analyses-count` | GET | ADMIN | Кол-во анализов пользователя по query |
| `/api/admin/users/[id]/analyses-count` | GET | ADMIN | Кол-во анализов пользователя по path id |
| `/api/admin/dashboard/metrics` | GET | ADMIN | Revenue, AOV, conversion, repeat, registrations |
| `/api/admin/dashboard/users` | GET | ADMIN | Распределение пользователей по тарифам |
| `/api/admin/dashboard/ai-health` | GET | ADMIN | Условное здоровье AI |
| `/api/admin/delete-user` | POST/DELETE | ADMIN | Удаление пользователя |
| `/api/admin/reports` | GET | ADMIN | Отчеты для админки |
| `/api/admin/stats` | GET | ADMIN | Админская статистика |
| `/api/admin/init` | POST | ADMIN | Инициализация админки |
| `/api/admin/fix-balances` | POST | ADMIN | Временный emergency repair balances |
| `/api/export/pdf` | GET | YES | Экспорт отчета в PDF |
| `/api/export/word` | GET | YES | Экспорт отчета в DOCX |
| `/api/analysis/save` | POST | YES | Сохранение анализа |
| `/api/analysis/manage` | POST | YES | Операции с анализами |
| `/api/analysis/report/[analysisId]` | GET | YES | Получение отчета |
| `/api/reports/archive` | GET/POST | YES | Архив отчетов |
| `/api/trash/permanent-delete` | POST | YES | Полное удаление из корзины |
| `/api/public/report/[id]` | GET | NO | Публичный доступ к опубликованному отчету |
| `/api/test/list-models` | GET | NO/dev | Тест AI моделей |
| `/api/test-verification-email` | GET | NO/dev | Тест письма |

---

## 7. Модель данных

### User

- `email`, `passwordHash`
- `name`, `organizationName`, `inn`, `phone`
- `plan`
- `analysesRemaining`
- `analysesInitial`
- `planStartDate`
- `role`
- `isEmailVerified`
- `analyses[]`
- `payments[]`

### Analysis

- принадлежит `user`
- хранит `companyName`, `companyInn`
- хранит `reportText`
- `firstContactExample`
- `isDeleted`
- `isNonTargetClient`
- `creditsUsed`
- `label`
- `analysisType`

### Payment

- принадлежит `user`
- `amount`, `currency`, `status`
- `paymentId`
- `planName`
- `analysesCount`
- `metadata`

---

## 8. Визуальная диаграмма

```text
┌─────────────────────────────────────────────────────────────┐
│                      METALVECTOR ЛОГИКА                     │
└─────────────────────────────────────────────────────────────┘

НЕАВТОРИЗОВАННЫЙ:
/                  → лендинг
/pricing           → тарифы
/login             → POST /api/auth/login
/register          → POST /api/auth/register
/forgot-password   → восстановление
/verify-email      → подтверждение email

↓ после логина (cookies: access_token + refresh_token)

АВТОРИЗОВАННЫЙ:
/analysis          → POST /api/analyze → Vertex AI → Analysis → decrement balance
/companies         → список отчетов
/report/[id]       → просмотр отчета
  ├─ PDF           → GET /api/export/pdf?id=...
  └─ DOCX          → GET /api/export/word?id=...
/profile           → профиль, баланс, тариф
/pricing           → POST /api/payment/create → ЮKassa

↓ если role === admin

АДМИНИСТРАТОР:
/admin             → хаб админки
/admin/dashboard   → metrics + users distribution + ai health
/admin/users       → список пользователей + редактирование

АВТОПРОЦЕССЫ:
ЮKassa webhook
  → POST /api/payment/webhook
  → Payment.status = succeeded
  → User.plan update
  → User.analysesRemaining += analysesCount

Создание анализа
  → POST /api/analyze
  → limit check
  → prompt
  → Vertex AI
  → save Analysis
  → analysesRemaining -= 1
```

---

## 9. Где реально находится "центр управления"

### `middleware.ts`

Решает:

- есть ли токен
- пропускать ли запрос
- редиректить ли на `/login`
- пробовать ли refresh

Но **не** решает admin role.

### `app/context/AuthContext.tsx`

Решает:

- кто сейчас залогинен
- какой у него `role`
- какой `plan`
- сколько осталось анализов
- можно ли показывать admin UI

### `app/components/Header.tsx`

Решает:

- какие кнопки видны
- куда ведут ссылки
- показывать ли `Админ-панель`

### `app/api/admin/lib/verifyAdmin.ts`

Реальный backend gatekeeper для админских API:

- читает `access_token` из cookie
- валидирует JWT
- достает user из БД
- проверяет `role === 'admin'`

---

## 10. Ключевые выводы

1. Архитектура смешанная: часть auth контролируется middleware, часть — client state, часть — API guards.
2. Admin-доступ проверяется не middleware, а `AuthContext` + `verifyAdmin`.
3. Бизнес-ядро проекта — это:
   - `POST /api/analyze`
   - `POST /api/payment/create`
   - `POST /api/payment/webhook`
   - `GET /api/auth/status`
   - `verifyAdmin()`
4. Основные сущности всего три: `User`, `Analysis`, `Payment`.
5. Главная бизнес-механика:
   - регистрация дает trial
   - анализ уменьшает баланс
   - оплата пополняет баланс и меняет план
   - админка может вручную менять лимиты

---

## 11. Карта frontend-страниц по ответственности

### `app/analysis/page.tsx`

Отвечает за:

- переключение режима `company | product`
- валидацию URL/ИНН
- показ progress bar
- проверку локального остатка анализов перед отправкой
- вызов:
  - `/api/analyze`
  - `/api/product-analyze`

Фактический flow:

1. пользователь вводит URL/ИНН или товар
2. фронт валидирует input
3. если company-mode и `analysesRemaining <= 0` на клиенте, открывает modal
4. отправляет POST в API
5. после успеха делает `router.push('/companies')`

Важно:

- страница использует `getToken()` и шлет `Authorization: Bearer ...`
- это legacy-подход, хотя новая auth-модель уже на cookie

### `app/companies/page.tsx`

Отвечает за:

- загрузку списка отчетов
- фильтрацию `company / product`
- поиск
- soft delete отчета
- actions: открыть, экспорт, копировать, share

Используемые API:

- `GET /api/analysis/manage?isDeleted=false`
- `GET /api/analysis/report/[id]`
- `PATCH /api/analysis/manage`

### `app/report/[id]/page.tsx`

Отвечает за:

- загрузку одного отчета
- markdown render
- TOC
- print layout
- export buttons
- delete action

Используемые API:

- `GET /api/analysis/report/[id]`
- `PATCH /api/analysis/manage`
- `GET /api/export/pdf?id=...`
- `GET /api/export/word?id=...`

### `app/profile/page.tsx`

Отвечает за:

- показ профиля
- историю платежей
- смену пароля
- показ баланса и прогресса

Используемые API:

- `GET /api/auth/status`
- `GET /api/payments/history`
- `GET /api/user/analyses-count`
- `POST /api/auth/change-password`

Важно:

- здесь до сих пор старая формула прогресса:
  - `totalBalance = remaining + totalAnalyses`
  - `used = totalAnalyses`
- это тот же legacy-подход, который уже был исправлен в админке

### `components/PricingContent.tsx`

Отвечает за:

- показ тарифов
- старт оплаты
- редирект на ЮKassa

Используемый API:

- `POST /api/payment/create`

Важно:

- компонент определяет `isLoggedIn` через `getToken()`
- если в localStorage пусто, а cookie есть, UI может считать пользователя "разлогиненным"
- это одна из причин auth-рассинхрона в проекте

### `components/LoginForm.tsx`

Это уже новая auth-логика:

- вход делает через `useAuth().login()`
- регистрация идет напрямую в `/api/auth/register`
- после login идет `router.push('/analysis')`

То есть login flow уже cookie-based, а несколько старых страниц еще живут в token/localStorage-модели.

---

## 12. Главная скрытая проблема архитектуры

В проекте сейчас одновременно живут **две auth-модели**.

### Новая модель

- `httpOnly cookies`
- `AuthContext`
- `middleware.ts`
- `getAccessToken(request)` на сервере

### Legacy модель

- `getToken()`
- `localStorage.authToken`
- ручная передача `Authorization: Bearer ...` с клиента

Критичный факт:

```ts
export const getToken = (): string | null => {
  console.warn('getToken() is deprecated. Tokens are now stored in httpOnly cookies.');
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};
```

Из-за этого часть проекта уже работает по cookie-сессии, а часть UI все еще пытается жить через localStorage token.

### Где это видно

- `app/analysis/page.tsx`
- `app/profile/page.tsx`
- `app/companies/page.tsx`
- `app/report/[id]/page.tsx`
- `components/PricingContent.tsx`

### Следствие

Это объясняет странности уровня:

- "залогинен, но кнопка/страница думает что нет"
- "админка/профиль просит логин повторно"
- "middleware пускает, а клиентский fetch ломается"
- "cookie есть, а фронт ищет localStorage token"

### Правильная цель

Нужно свести проект к одной модели:

1. клиент не читает токен вообще
2. fetch ходит с `credentials: 'include'`
3. сервер читает только cookies
4. `getToken()` удаляется полностью

