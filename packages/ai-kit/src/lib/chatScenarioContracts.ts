export type SpecialScenarioCase = {
  prompt: string;
  contains: string;
};

export type DeterministicScenarioCase = {
  prompt: string;
  expectWidget?: string;
  expectNavigateTo?: string;
  contains: string;
};

export const specialScenarioCases: SpecialScenarioCase[] = [
  { prompt: "ты чмо", contains: "Вроде бы взрослый человек" },
  { prompt: "что ты умеешь", contains: "Я знаю ваши продукты" },
  { prompt: "привет", contains: "здравствуйте" },
  { prompt: "добрый вечер", contains: "здравствуйте" },
  { prompt: "как дела", contains: "Все хорошо, работаю на благо B2B в Билайне." }
];

export const deterministicScenarioCases: DeterministicScenarioCase[] = [
  { prompt: "покажи неоплаченные счета", expectWidget: "invoices-unpaid-inline", contains: "Показываю неоплаченные счета" },
  { prompt: "Мои сервисы", contains: "По сервисам могу показать" },
  { prompt: "Мои продукты", contains: "Ваши подключенные продукты" },
  { prompt: "Покажи мои продукты", contains: "Ваши подключенные продукты" },
  { prompt: "Инсайты", contains: "Ключевые инсайты" },
  { prompt: "Открытые обращения", expectWidget: "appeals-summary", contains: "На данный момент у вас 3 активных обращения" },
  { prompt: "Создать платеж", expectNavigateTo: "/invoices/", contains: "Открываю счета и оплату" },
  { prompt: "Запустить смс рассылку", contains: "Подготовил черновик SMS-рассылки" },
  { prompt: "Записи звонков", expectWidget: "missed-calls-inline", contains: "Показываю записи и сводку" },
  { prompt: "Баланс", expectWidget: "subscription-balance-inline", contains: "Связь для бизнеса" },
  { prompt: "Мои номера", expectWidget: "my-numbers-inline", contains: "3 номера" },
  { prompt: "Изменить настройки секретаря", contains: "пока в разработке" },
  { prompt: "Настроить запись звонков", contains: "пока в разработке" },
  { prompt: "счета за март", expectWidget: "invoices-month", contains: "Показываю счета за март" },
  { prompt: "счета за февраль", expectWidget: "invoices-month", contains: "Показываю счета за февраль" },
  { prompt: "Мои счета", contains: "Открываю счета и оплату" },
  { prompt: "какие у меня счета", contains: "По счетам: всего" },
  { prompt: "Счета за март 2026", expectWidget: "invoices-month", contains: "Показываю счета за март" },
  { prompt: "сколько пропущенных звонков", expectWidget: "missed-calls-inline", contains: "пропущенных" },
  { prompt: "Список звонков", expectNavigateTo: "/home/", contains: "Открываю дашборд" },
  { prompt: "Причины пропусков звонков", expectNavigateTo: "/home/", contains: "Открываю дашборд" },
  { prompt: "Статистика по времени суток", expectNavigateTo: "/home/", contains: "Открываю дашборд" },
  { prompt: "Сравнение звонков с предыдущей неделей", expectNavigateTo: "/home/", contains: "Открываю дашборд" },
  { prompt: "Средняя конвертация в лид", expectNavigateTo: "/home/", contains: "Открываю дашборд" },
  { prompt: "звонки за неделю", expectNavigateTo: "/home/", contains: "Открываю дашборд" },
  { prompt: "Статистика звонков за неделю", expectNavigateTo: "/home/", contains: "Открываю дашборд" },
  { prompt: "Секретарь", contains: "сценарий «Секретарь»" },
  { prompt: "Увеличить срок хранения звонков", contains: "увеличение срока хранения" },
  { prompt: "дай совет от ассистента", contains: "Совет от ассистента:" },
  { prompt: "открыть список счетов", expectNavigateTo: "/invoices/", contains: "Открываю полный список счетов." },
  { prompt: "да, создать обращение", expectNavigateTo: "/appeals/", contains: "Открываю создание обращения" },
  { prompt: "позови оператора", contains: "Я в демо режиме и не могу звать людей" },
  { prompt: "Сводка дня", contains: "Сводка дня:" },
  { prompt: "Запусти рассылку", contains: "Подготовил сценарий рассылки" },
  { prompt: "обращения", expectWidget: "appeals-summary", contains: "На данный момент у вас 3 активных обращения" },
  { prompt: "активные обращения", expectWidget: "appeals-summary", contains: "На данный момент у вас 3 активных обращения" },
  { prompt: "какая разница между суммой счетов в феврале и марте", contains: "Сравнение счетов" },
  { prompt: "какая доля неоплаченных счетов", contains: "Доля неоплаченных счетов" },
  { prompt: "дай динамику счетов февраль к марту", contains: "Динамика" },
  { prompt: "покажи топ-3 крупных счета", contains: "Топ-3" },
  { prompt: "сколько счетов за февраль", contains: "За февраль найдено" },
  { prompt: "в каком месяце я больше всего потратил на оплату счетов?", contains: "Больше всего потратили" },
  { prompt: "сколько времени", contains: "Сейчас" },
  { prompt: "какая дата", contains: "Сегодня" },
  { prompt: "1250 + 340", contains: "Результат:" },
  { prompt: "144 / 0", contains: "не определен" },
  { prompt: "посчитай", contains: "Напишите в формате" },
  { prompt: "15 км в м", contains: "15" },
  { prompt: "15 км в кг", contains: "Не могу конвертировать" },
  { prompt: "конвертируй", contains: "Введите запрос в формате" }
];

export const liveRequiredScenarioPrompts: string[] = [
  "какая погода в москве",
  "какой курс доллара сегодня",
  "последние новости",
  "расскажи про квантовый отжиг",
  "напиши стих про космос"
];
