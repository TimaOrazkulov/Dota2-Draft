# Настройка на чистой Windows: от Claude Code до запуска gsi-server

Полный путь от пустой Windows-машины до работающего `gsi-server`, который
читает драфт прямо из Dota 2.

## 1. Node.js

Нужен и для Claude Code, и для самого проекта.

1. Открой https://nodejs.org, скачай **LTS**-версию установщика для Windows.
2. Запусти установщик, везде жми Next/Install (галку "Add to PATH" не
   трогать — она включена по умолчанию).
3. Открой **новое** окно PowerShell (важно открыть новое, чтобы PATH
   обновился) и проверь:

   ```powershell
   node -v
   npm -v
   ```

   Должны напечататься версии (например `v20.x.x` и `10.x.x`), а не ошибка
   "не является внутренней или внешней командой".

## 2. Claude Code

1. В том же PowerShell:

   ```powershell
   npm install -g @anthropic-ai/claude-code
   ```

2. Запусти:

   ```powershell
   claude
   ```

3. Откроется браузер — войди тем же аккаунтом (claude.ai или Anthropic
   Console), которым пользуешься на Маке. После входа терминал подтвердит
   подключение, и можно писать Claude прямо в этом окне.

   Если что-то не заработало нативно (редкий случай, зависит от версии
   Windows) — запасной вариант: включить **WSL2** (`wsl --install` в
   PowerShell от администратора, один раз перезагрузиться) и повторить шаги
   1-2 уже внутри WSL-терминала (там Node/Claude Code ведут себя как на
   Linux/Mac, без каких-либо расхождений).

## 3. Перенос проекта на Windows

У проекта уже есть GitHub-репозиторий (`origin` настроен на
`github.com/TimaOrazkulov/Dota2-Draft`), но большая часть кода в нём ещё
не закоммичена/не запушена — так что выбери один из вариантов:

**Вариант А — через GitHub (удобнее, если будешь продолжать работу с двух
машин):**

На Маке — закоммитить и запушить текущее состояние:
```bash
git add -A
git commit -m "..."
git push -u origin main
```

На Windows:
```powershell
git clone https://github.com/TimaOrazkulov/Dota2-Draft.git
cd Dota2-Draft
```
(Git для Windows, если его нет: https://git-scm.com/download/win)

**Вариант B — просто скопировать папку** (USB-флешка, облако вроде
Google Drive/OneDrive, WeTransfer):

На Маке заархивируй проект **без** `node_modules` и `dist` (они лишние,
пересоздадутся сами):
```bash
cd /Users/temirlanorazkulov/Documents/dota2
zip -r Dota2-Draft.zip Dota2-Draft -x "Dota2-Draft/node_modules/*" -x "Dota2-Draft/dist/*"
```
Перенеси `Dota2-Draft.zip` любым способом и распакуй на Windows, например в
`C:\Projects\Dota2-Draft`.

## 4. Установка зависимостей проекта

В PowerShell, в корне проекта:

```powershell
cd C:\Projects\Dota2-Draft
npm install
```

Это ставит зависимости веб-приложения (React/Vite). Сам `gsi-server`
(`server.js`, `install-config.js`) для **запуска** не требует ни одной
внешней зависимости — только встроенные модули Node, `npm install` там не
нужен. Vitest в его `devDependencies` нужен только для `npm run test`;
если тесты gsi-server не запускаешь — `cd gsi-server && npm install`
можно не делать вовсе.

Проверить, что веб-часть собирается:
```powershell
npm run build
```

(Не обязательно перед запуском gsi-server, просто быстрая проверка, что
всё встало нормально.)

## 5. Настройка GSI-конфига для Dota 2

```powershell
cd gsi-server
npm run install-config
```

Скрипт сам поищет папку Dota 2 в стандартных местах (`C:\Program Files
(x86)\Steam\...`, `D:\SteamLibrary\...` и т.д.). Если не нашёл — он это
скажет, и тогда запусти с явным путём до папки `dota 2 beta`:

```powershell
node install-config.js "D:\SteamLibrary\steamapps\common\dota 2 beta"
```

(Путь до папки Dota 2 можно посмотреть в Steam: ПКМ по Dota 2 →
Управление → Обзор локальных файлов.)

## 6. Launch option в Steam

Steam → Библиотека → Dota 2 → шестерёнка/ПКМ → Свойства → **Launch
Options** → впиши:

```
-gamestateintegration
```

## 7. Запуск gsi-server

```powershell
npm start
```

Если увидишь:
```
Dota 2 GSI server listening on http://127.0.0.1:53000
```
— сервер работает. Оставь это окно PowerShell открытым на всё время игры
(закрыть — `Ctrl+C`).

Windows Defender Firewall может один раз спросить разрешение для Node.js —
жми **"Разрешить доступ"** (сервер слушает только `127.0.0.1`, то есть
только эту же машину, наружу он не торчит).

### Проверка без реальной игры

Windows 10/11 уже включает `curl.exe`, так что прямо в PowerShell:

```powershell
curl.exe http://127.0.0.1:53000/health
curl.exe http://127.0.0.1:53000/state
```

Первая должна вернуть `ok`, вторая — `{"draft":null,"lastUpdated":0}` до
начала реального драфта.

### Проверка с реальной игрой

Зайди в Captains Mode (можно в боте/лобби с друзьями, не обязательно
рейтинг) — как только начнутся баны, `curl.exe
http://127.0.0.1:53000/state` должен начать показывать реальные ID
героев в течение пары секунд после каждого действия.

Дальше открывай веб-приложение (`npm run dev` в корне проекта, отдельное
окно PowerShell) и выбирай режим **"GSI · авто из игры"**.
