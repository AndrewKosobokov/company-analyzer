# 🚀 Инструкции по деплою исправления Prisma Engine

## Проблема
"Engine is not yet connected" - Prisma Engine отключается через ~1 минуту после старта.

## Решение
Добавлен keep-alive механизм и connection pooling.

## Процедура деплоя на сервере

### 1. Подключитесь к серверу
```bash
ssh ubuntu@62.84.118.6
cd ~/company-analyzer
```

### 2. Подтяните изменения
```bash
git fetch origin
git checkout claude/stable-improvements-01Q8qvBn76zZFvKY4HeRVsdB
git pull origin claude/stable-improvements-01Q8qvBn76zZFvKY4HeRVsdB
```

### 3. Установите зависимости и пересоберите
```bash
npm install
npm run build
```

### 4. Исправьте prerender-manifest.json
```bash
cat > .next/prerender-manifest.json << 'EOF'
{"version":4,"routes":{"/":{" initialRevalidateSeconds":false,"srcRoute":null,"dataRoute":null}},"dynamicRoutes":{},"preview":{"previewModeId":"production-id","previewModeSigningKey":"production-key","previewModeEncryptionKey":"production-encryption-key"},"notFoundRoutes":[]}
EOF
```

### 5. Создайте BUILD_ID
```bash
echo "production-$(date +%s)" > .next/BUILD_ID
```

### 6. Перезапустите PM2
```bash
pm2 restart metalvector
pm2 logs metalvector --lines 30
```

## Проверка успешного деплоя

### Ожидаемые логи при старте:
```
✅ Prisma Client initialized with keep-alive
```

### Команды для тестирования:

1. **Проверка БД подключения:**
```bash
PGPASSWORD=postgres psql -U postgres -d company_analyzer -h localhost -c "SELECT COUNT(*) FROM \"Analysis\";"
```

2. **Проверка логов на ошибки:**
```bash
pm2 logs metalvector --lines 50 --nostream | grep -i "error"
```

3. **Мониторинг в реальном времени:**
```bash
pm2 logs metalvector
```

4. **Проверка keep-alive (должен появляться каждые 30 сек):**
```bash
pm2 logs metalvector | grep -i "keep-alive"
```

## Критерии успеха

- ✅ Сайт загружается сразу после деплоя
- ✅ Страница `/companies` показывает список отчетов
- ✅ Отчеты остаются доступны через 2+ минуты после старта
- ✅ В логах нет ошибок "Engine is not yet connected"
- ✅ Логин работает стабильно
- ✅ В логах видно сообщение "Prisma Client initialized with keep-alive"

## Откат при проблемах

Если что-то пойдёт не так:
```bash
git checkout v1.4.9-stable-optimized
npm install
npm run build
# ... повторить шаги 4-6
```

## Что изменено

### 1. app/lib/prisma.ts
- Добавлен явный `$connect()` в production
- Добавлен keep-alive запрос `SELECT 1` каждые 30 секунд
- При ошибке keep-alive автоматическое переподключение
- Логирование ошибок подключения

### 2. ecosystem.config.js
- `script: 'npm'` вместо `'node_modules/.bin/next'`
- Добавлено: `instances: 1`, `exec_mode: 'fork'`
- Добавлено: `autorestart: true`, `max_memory_restart: '1G'`
- DATABASE_URL обновлён с параметрами connection pooling:
  - `connection_limit=5`
  - `pool_timeout=15`
  - `connect_timeout=10`

## Мониторинг после деплоя

Следите за логами первые 5 минут:
```bash
pm2 logs metalvector --lines 100
```

Если видите ошибки "Engine is not yet connected" - свяжитесь со мной.
