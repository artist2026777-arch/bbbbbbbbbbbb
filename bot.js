Создание Telegram-бота для клининговой компании с использованием Node.js и `node-fetch` может быть выполнено следующим образом. Этот бот будет поддерживать команды, inline кнопки, callback_query и состояния пользователей, а также хранить данные в формате JSON.

### Шаг 1: Установка Node.js и необходимых пакетов

Убедитесь, что у вас установлен Node.js. Затем создайте новый проект и установите `node-fetch`:

```bash
mkdir cleaning_bot
cd cleaning_bot
npm init -y
npm install node-fetch
```

### Шаг 2: Создание бота

Создайте файл `bot.js` и добавьте следующий код:

```javascript
const fetch = require('node-fetch');
const fs = require('fs');

const TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN';
const URL = `https://api.telegram.org/bot${TOKEN}`;
const STORAGE_FILE = 'data.json';

// Инициализация данных пользователей
let usersData = {};

if (fs.existsSync(STORAGE_FILE)) {
    usersData = JSON.parse(fs.readFileSync(STORAGE_FILE));
}

// Функция для сохранения данных пользователей
const saveData = () => {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(usersData));
};

// Функция для отправки сообщений
const sendMessage = async (chatId, text, replyMarkup) => {
    await fetch(`${URL}/sendMessage`, {
        method: 'POST',
        body: JSON.stringify({
            chat_id: chatId,
            text: text,
            reply_markup: replyMarkup,
            parse_mode: 'HTML'
        }),
        headers: { 'Content-Type': 'application/json' }
    });
};

// Обработка команд
const handleCommand = async (chatId, command) => {
    switch (command) {
        case '/start':
            usersData[chatId] = { state: 'start' };
            await sendMessage(chatId, 'Добро пожаловать в клининговую компанию "Клининговые Услуги Уфа"! Нажмите кнопку ниже для получения информации.', {
                inline_keyboard: [[{ text: 'Узнать больше', callback_data: 'info' }]]
            });
            break;
        case '/help':
            await sendMessage(chatId, 'Доступные команды:\n/start - Начать\n/help - Помощь');
            break;
        default:
            await sendMessage(chatId, 'Неизвестная команда. Используйте /help для получения списка команд.');
    }
};

// Обработка callback_query
const handleCallbackQuery = async (chatId, data) => {
    if (data === 'info') {
        await sendMessage(chatId, 'Мы предоставляем услуги по уборке. Позвоните нам по телефону: 89196165789.');
    }
};

// Основная функция для обработки обновлений
const processUpdate = async (update) => {
    const chatId = update.message?.chat.id || update.callback_query?.message.chat.id;
    const command = update.message?.text || update.callback_query?.data;

    if (update.message) {
        await handleCommand(chatId, command);
    } else if (update.callback_query) {
        await handleCallbackQuery(chatId, command);
    }

    // Удаление callback_query
    if (update.callback_query) {
        await fetch(`${URL}/answerCallbackQuery`, {
            method: 'POST',
            body: JSON.stringify({ callback_query_id: update.callback_query.id }),
            headers: { 'Content-Type': 'application/json' }
        });
    }

    saveData();
};

// Функция для получения обновлений
const getUpdates = async (offset) => {
    const response = await fetch(`${URL}/getUpdates?offset=${offset}&timeout=60`);
    const data = await response.json();
    return data.result;
};

// Основная функция бота
const startBot = async () => {
    let offset = 0;

    while (true) {
        const updates = await getUpdates(offset);
        for (const update of updates) {
            await processUpdate(update);
            offset = update.update_id + 1;
        }
    }
};

startBot();
```

### Шаг 3: Запуск бота

1. Замените `YOUR_TELEGRAM_BOT_TOKEN` на токен вашего бота, который вы получили от BotFather.
2. Запустите бота:

```bash
node bot.js
```

### Заключение

Теперь у вас есть простой Telegram-бот для клининговой компании, который поддерживает команды, inline кнопки и callback_query. Вы можете расширить функциональность бота, добавляя новые команды и состояния пользователей по мере необходимости. Не забудьте протестировать бота и убедиться, что все работает корректно.