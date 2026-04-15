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
  { prompt: "что ты умеешь", contains: "умею" },
  { prompt: "привет", contains: "здравствуйте" },
  { prompt: "добрый вечер", contains: "здравствуйте" },
  { prompt: "как дела", contains: "Работаю" }
];

export const deterministicScenarioCases: DeterministicScenarioCase[] = [
  { prompt: "покажи неоплаченные счета", expectWidget: "invoices-unpaid-inline", contains: "Показываю неоплаченные счета" },
  { prompt: "Мои сервисы", contains: "По сервисам могу показать" },
  { prompt: "счета за март", expectWidget: "invoices-month", contains: "Показываю счета за март" },
  { prompt: "счета за февраль", expectWidget: "invoices-month", contains: "Показываю счета за февраль" },
  { prompt: "Мои счета", contains: "По счетам: всего" },
  { prompt: "какие у меня счета", contains: "По счетам: всего" },
  { prompt: "Счета за март 2026", expectWidget: "invoices-month", contains: "Показываю счета за март" },
  { prompt: "сколько пропущенных звонков", expectWidget: "missed-calls-inline", contains: "пропущенных" },
  { prompt: "Список звонков", expectWidget: "weekly-stats-expanded", contains: "расширенную сводку звонков за неделю" },
  { prompt: "Причины пропусков звонков", expectWidget: "weekly-stats-expanded", contains: "расширенную сводку звонков за неделю" },
  { prompt: "Статистика по времени суток", expectWidget: "weekly-stats-expanded", contains: "расширенную сводку звонков за неделю" },
  { prompt: "Сравнение звонков с предыдущей неделей", expectWidget: "weekly-stats-expanded", contains: "расширенную сводку звонков за неделю" },
  { prompt: "Средняя конвертация в лид", expectWidget: "weekly-stats-expanded", contains: "расширенную сводку звонков за неделю" },
  { prompt: "звонки за неделю", expectWidget: "weekly-stats-expanded", contains: "За неделю:" },
  { prompt: "Секретарь", contains: "сценарий «Секретарь»" },
  { prompt: "Увеличить срок хранения звонков", contains: "увеличение срока хранения" },
  { prompt: "Сводка дня", contains: "Сводка дня:" },
  { prompt: "Запусти рассылку", contains: "Подготовил сценарий рассылки" },
  { prompt: "обращения", contains: "По обращениям" },
  { prompt: "активные обращения", expectNavigateTo: "/appeals/", contains: "Открываю раздел" },
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
