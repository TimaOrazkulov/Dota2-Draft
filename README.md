# Dota 2 Draft Helper

Веб-трекер драфта Dota 2 с подсказками контрпиков, синергии, баланса
команды и мета-винрейта (Divine+), плюс кратким гайдом на выбранного
героя. Три режима: **All Pick** (свободный ввод пиков), **Captains Mode**
(пошаговый ввод банов/пиков вручную) и **GSI · авто из игры** (баны/пики
считываются прямо из Dota 2 через официальный Game State Integration).

## Быстрый старт

```bash
npm install
npm run dev
```

Открой `http://localhost:5173`.

Другие команды:
- `npm run build` — прод-сборка (включает проверку типов)
- `npm run test` — прогнать тесты (Vitest)
- `npm run lint` — Oxlint

## Как это работает

- Данные о героях (роли, тип атаки, картинки, живой винрейт по
  скилл-бракетам) — из OpenDota API (`heroStats`), кэшируются в
  `localStorage` на сутки.
- Структурные теги героев (hardDisable, spellImmunity, invisibility,
  detection, mobility и т.д.) — куратор-таблица + эвристика по ролям
  OpenDota, не привязана к цифрам конкретного патча.
- Контрпики и синергия считаются таблицей правил "тег атакующего vs тег
  цели" (`src/data/counterRules.ts`, `src/data/synergyRules.ts`), плюс
  бонус за живой винрейт (Divine+/Immortal, с откатом на общую выборку)
  и бонус за баланс команды (контроль/тимфайт/сустейн/детект/фронтлайн/
  фарм-керри — `src/data/teamAspects.ts`).
- Позиции героев (1-5) — куратор-таблица + фолбэк по ролям
  (`src/data/heroPositions.ts`).

## Режим GSI: считываем драфт прямо из игры

Работает через официальный механизм Valve Game State Integration — сама
игра шлёт локальному серверу свой стейт по HTTP, без чтения памяти и без
инъекций.

- **Разбор безопасности** (в т.ч. чем это отличается от реально
  забаненного в 2024 "Overplus") и обычная установка — `gsi-server/README.md`.
- **Полный гайд с нуля на Windows** (Node.js → Claude Code → перенос
  проекта → запуск gsi-server) — `gsi-server/WINDOWS_SETUP.md`.

## Проект

```
src/
  components/   — экраны и UI-компоненты трёх режимов
  hooks/        — useDraft (Captains Mode), useAllPick, useGsiDraft, useHeroes
  lib/          — recommend (движок подсказок), guide, heroData, positions
  data/         — куратор-таблицы: теги героев, позиции, правила контры/синергии,
                  аспекты баланса команды, гайды на керри, последовательность Captains Mode
gsi-server/     — отдельный Node-проект (свой package.json, без внешних
                  зависимостей) — сервер для режима GSI, см. его README
```

Тесты лежат рядом с тем, что они проверяют (`*.test.ts` / `*.test.js`),
отдельно для основного приложения (`npm run test`) и для `gsi-server`
(`cd gsi-server && npm run test`) — это два независимых проекта со своими
`package.json`, поэтому и тесты у них не смешиваются.
