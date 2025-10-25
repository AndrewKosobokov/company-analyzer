# Target Proposal Prompt Updated ✅

## Changes Applied

**File:** `app/api/analysis/generate-proposal/route.ts`

### What Was Changed

Replaced the **entire system prompt** with a new, more conversational and human-friendly version.

---

## Old vs New Prompt Style

### Before (Formal/Technical):
```
РОЛЬ И КОНТЕКСТ
Твоя Роль: Ты — Бизнес-аналитик и Консультант по оптимизации B2B-закупок.
Твоя Задача: Проанализировать приложенный аналитический отчет...
СТРУКТУРА ВЫХОДА (Обязательные Секции)
Секция 1: ПОЗИЦИОНИРОВАНИЕ (Как Себя Представить)
...
```

### After (Conversational/Human):
```
КТО ТЫ И ЧТО ДЕЛАТЬ
* Твоя роль: Ты — опытный бизнес-аналитик, который помогает компаниям наладить B2B-закупки.
* Твоя задача: Посмотри на этот аналитический отчет о заводе...
* Что нужно сделать (результат): Напиши для менеджера по продажам (сейлза) понятную и полезную "шпаргалку".
...
```

---

## Key Differences

### Tone & Language

**Before:**
- Formal, business-like
- Technical terminology
- "Секция", "Задача", "Формат"

**After:**
- Conversational, friendly
- Human language
- "Раздел", "Придумай", "Суть"

### Section Names

| Before | After |
|--------|-------|
| ПОЗИЦИОНИРОВАНИЕ (Как Себя Представить) | КАК ПРЕДСТАВИТЬСЯ |
| КАРТА БОЛЕВЫХ ТОЧЕК (Общие Проблемы Снабжения) | "БОЛЬНЫЕ МЕСТА" (На что "надавить" в разговоре) |
| МАКСИМАЛЬНАЯ ПОЛЬЗА (Что Предложить) | ЧТО КОНКРЕТНО ПРЕДЛОЖИТЬ (Главная польза) |

### Explanations

**Before:**
- "Позиционирование должно быть широким, но экспертным"
- "Формат: Сформулируй точную, но гибкую роль"

**After:**
- "Название должно быть экспертным, но широким, с фокусом на процессе снабжения"
- "Дай точную, но не слишком узкую формулировку"

### Examples Style

**Before:**
```
Вместо: "Я предполагаю, у вас сложности..."
Используй: "Руководители снабжения на предприятиях, подобных вашему..."
```

**After:**
```
* Плохо: "Я вижу, у вас проблемы..."
* Хорошо: "Руководители снабжения на похожих заводах часто жалуются..."
```

---

## Full New Prompt Structure

### КТО ТЫ И ЧТО ДЕЛАТЬ
- Defines AI role as "опытный бизнес-аналитик"
- Explains the task in simple terms
- Uses colloquial expressions like "шпаргалка", "сейлз", "закупщик"
- Sets clear goal: help manager be expert, not "продаван"

### ПЛАН ТВОЕГО ОТВЕТА

#### Раздел 1: КАК ПРЕДСТАВИТЬСЯ
- More casual instructions: "Придумай, как менеджеру лучше всего себя назвать"
- Uses quotes: "продаванов" (salespeople slang)
- Adds humor: "100500 поставщиков" (internet meme for "too many")
- Examples more conversational

#### Раздел 2: "БОЛЬНЫЕ МЕСТА"
- Uses quotes for colloquial term "Больные места" (pain points)
- More direct language: "надавить" (push on), "внутреннюю кухню" (inside workings)
- Explicitly contrasts bad vs good with:
  - "Плохо: ..." 
  - "Хорошо: ..."
- More casual examples: "уйма времени уходит на возню" (lots of time wasted on hassle)

#### Раздел 3: ЧТО КОНКРЕТНО ПРЕДЛОЖИТЬ
- Uses casual terms: "головная боль" (headache), "впариватель" (pushy salesperson)
- Three benefits renamed:
  - Польза 1: "Решение большой проблемы" (solving big problem)
  - Польза 2: "Снижение рисков и рутины" (reducing risks and routine)
  - Польза 3: "Все в одном окне" (one-stop-shop)
- More conversational examples: "мелочевка" (small stuff), "от перчаток до расходников"

### ВАЖНЫЕ ПРАВИЛА
- Same rules (no emojis, structured text, clear headers)
- Added: "Пиши по делу, профессионально, но человеческим языком" (write to the point, professionally, but in human language)

---

## Impact on Generated Content

The new prompt should produce:
- ✅ **More natural language** (less formal, more conversational)
- ✅ **Better relatability** (uses terms sales managers actually use)
- ✅ **Clearer instructions** (simpler explanations)
- ✅ **More engaging examples** (uses colloquialisms, humor)
- ✅ **Same structure** (still 3 sections with clear formatting)

---

## What Was NOT Changed

✅ **API Structure:**
- Authentication logic
- Request validation
- Gemini API call
- Error handling
- Response format

✅ **Functionality:**
- Still returns plain text (not JSON)
- Same endpoint URL
- Same request/response format
- Same token usage

✅ **Technical Config:**
- Model: `gemini-2.0-flash-thinking-exp-01-21`
- Temperature: 0.7
- Max tokens: 8000
- No changes to generation config

---

## Language Changes Breakdown

### Formal → Casual Expressions

| Before | After | Translation |
|--------|-------|-------------|
| менеджер по продажам | сейлз | sales manager → salesperson |
| закупщик | начальник отдела снабжения | buyer → head of procurement |
| Специалист по... | Помогаю снизить... | Specialist in... → I help reduce... |
| позиционирование | как представиться | positioning → how to introduce yourself |
| карта болевых точек | "больные места" | pain point map → "pain points" (quoted) |
| номенклатура | болты | nomenclature → bolts |
| контрагент | один договор | counterparty → one contract |

### Colloquial Additions

- **"продаваны"** - slang for pushy salespeople
- **"100500 поставщиков"** - internet meme meaning "way too many"
- **"впариватель"** - slang for pushy seller who "pushes" products
- **"мелочевка"** - colloquial for "small stuff"
- **"уйма времени"** - "tons of time"
- **"возня"** - "hassle" or "fussing around"
- **"внутреннюю кухню"** - "inside workings" (idiom)
- **"головная боль"** - "headache" (idiom for problem)

---

## Testing

To verify the new prompt works:

1. **Generate a proposal:**
   ```bash
   # Start dev server
   npm run dev
   
   # Open a report
   http://localhost:3000/report/{id}
   
   # Click "Целевое предложение"
   ```

2. **Check the output for:**
   - ✅ More conversational tone
   - ✅ Clearer section headers
   - ✅ Natural Russian language
   - ✅ Practical, down-to-earth examples
   - ✅ Same 3-section structure

3. **Verify sections:**
   - КАК ПРЕДСТАВИТЬСЯ (How to introduce yourself)
   - "БОЛЬНЫЕ МЕСТА" (Pain points)
   - ЧТО КОНКРЕТНО ПРЕДЛОЖИТЬ (What to offer)

---

## Before/After Example Output

### Before (Expected Output):
```
ПОЗИЦИОНИРОВАНИЕ

Специалист по оптимизации цепочек поставок промышленных предприятий.

КАРТА БОЛЕВЫХ ТОЧЕК

1. Руководители снабжения на предприятиях, подобных вашему, часто сталкиваются...
```

### After (Expected Output):
```
КАК ПРЕДСТАВИТЬСЯ

Я специалист по налаживанию поставок на промышленных предприятиях.

"БОЛЬНЫЕ МЕСТА"

Руководители снабжения на похожих заводах часто жалуются...
```

---

## Why This Change?

### Benefits:

1. **More relatable** - Uses language that sales managers actually speak
2. **Easier to understand** - Simpler, more direct instructions
3. **Better AI compliance** - Clearer examples and structure
4. **More engaging** - Less robotic, more human tone
5. **Same effectiveness** - Still professional and structured

### Trade-offs:

- Slightly less formal (but more practical)
- Uses slang (but relatable to target audience)
- Longer explanations (but clearer)

---

## Rollback Instructions

If you need to revert to the old prompt:

```bash
git diff app/api/analysis/generate-proposal/route.ts
git checkout HEAD -- app/api/analysis/generate-proposal/route.ts
```

Or manually replace with old prompt from git history.

---

## Summary

✅ Prompt replaced with more conversational version  
✅ Same 3-section structure maintained  
✅ More relatable language and examples  
✅ Uses sales/procurement slang and idioms  
✅ Clearer, simpler instructions for AI  
✅ All API code unchanged  
✅ No linter errors  
✅ Ready for testing  

---

**File modified:** `app/api/analysis/generate-proposal/route.ts`  
**Lines changed:** 4-53 (prompt only)  
**API functionality:** Unchanged  
**Expected behavior:** More natural, conversational proposal output  

