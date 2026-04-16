import { expect, test, type Page } from "@playwright/test";

type ScenarioCase = {
  prompt: string;
  expectedText: string;
  expectedWidgetTitle?: string;
  exactWidgetTitle?: boolean;
};

const specialScenarios: ScenarioCase[] = [
  { prompt: "ты чмо", expectedText: "Вроде бы взрослый человек, предприниматель, а такой некультурный!" },
  { prompt: "что ты умеешь", expectedText: "Сейчас в приложении я умею:" },
  { prompt: "привет", expectedText: "И вам здравствуйте, желаю вам хорошего дня" },
  { prompt: "добрый вечер", expectedText: "И вам здравствуйте, желаю вам хорошего дня" },
  { prompt: "как дела", expectedText: "Все хорошо, работаю на благо B2B в Билайне." }
];

const deterministicScenarios: ScenarioCase[] = [
  { prompt: "покажи неоплаченные счета", expectedText: "Показываю неоплаченные счета в чате.", expectedWidgetTitle: "Неоплаченные счета", exactWidgetTitle: true },
  { prompt: "счета за март", expectedText: "Показываю счета за март в чате.", expectedWidgetTitle: "Счета за март", exactWidgetTitle: true },
  { prompt: "счета за февраль", expectedText: "Показываю счета за февраль в чате.", expectedWidgetTitle: "Счета за февраль", exactWidgetTitle: true },
  { prompt: "какие у меня счета", expectedText: "По счетам: всего" },
  { prompt: "сколько пропущенных звонков", expectedText: "По текущим данным: всего звонков", expectedWidgetTitle: "Пропущенные в чате", exactWidgetTitle: true },
  { prompt: "звонки за неделю", expectedText: "За неделю: 126 звонков" },
  { prompt: "Секретарь", expectedText: "Открываю сценарий «Секретарь»" },
  { prompt: "Увеличить срок хранения звонков", expectedText: "увеличение срока хранения" },
  { prompt: "дай совет от ассистента", expectedText: "Совет от ассистента:" },
  { prompt: "открыть список счетов", expectedText: "Открываю полный список счетов." },
  { prompt: "позови оператора", expectedText: "Я в демо режиме и не могу звать людей" },
  { prompt: "да, создать обращение", expectedText: "Открываю создание обращения" },
  { prompt: "Статистика по времени суток", expectedText: "Показываю расширенную сводку звонков за неделю" },
  { prompt: "Причины пропусков звонков", expectedText: "Показываю расширенную сводку звонков за неделю" },
  { prompt: "Сравнение звонков с предыдущей неделей", expectedText: "Показываю расширенную сводку звонков за неделю" },
  { prompt: "Средняя конвертация в лид", expectedText: "Показываю расширенную сводку звонков за неделю" },
  { prompt: "обращения", expectedText: "По обращениям могу показать активные" },
  { prompt: "какая разница между суммой счетов в феврале и марте", expectedText: "Сравнение счетов" },
  { prompt: "какая доля неоплаченных счетов", expectedText: "Доля неоплаченных счетов" },
  { prompt: "дай динамику счетов февраль к марту", expectedText: "Динамика" },
  { prompt: "покажи топ-3 крупных счета", expectedText: "Топ-3 крупных счета" },
  { prompt: "сколько счетов за февраль", expectedText: "За февраль найдено" },
  { prompt: "в каком месяце я больше всего потратил на оплату счетов?", expectedText: "Больше всего потратили в месяце" },
  { prompt: "сколько времени", expectedText: "Сейчас" },
  { prompt: "какая дата", expectedText: "Сегодня" },
  { prompt: "1250 + 340", expectedText: "Результат: 1590" },
  { prompt: "144 / 0", expectedText: "не определен" },
  { prompt: "посчитай", expectedText: "Напишите в формате" },
  { prompt: "15 км в м", expectedText: "15 км = 15 000 м." },
  { prompt: "15 км в кг", expectedText: "Не могу конвертировать эти единицы" },
  { prompt: "конвертируй", expectedText: "Введите запрос в формате" }
];

const liveRequiredScenarios: ScenarioCase[] = [
  { prompt: "какая погода в москве", expectedText: "Для этого запроса нужен live AI-ответ" },
  { prompt: "какой курс доллара сегодня", expectedText: "Для этого запроса нужен live AI-ответ" },
  { prompt: "последние новости", expectedText: "Для этого запроса нужен live AI-ответ" },
  { prompt: "расскажи про квантовый отжиг", expectedText: "Для этого запроса нужен live AI-ответ" },
  { prompt: "напиши стих про космос", expectedText: "Для этого запроса нужен live AI-ответ" }
];

async function openAssistant(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("pwa-install-dismissed", "1");
  });
  await page.goto("/assistant/");
}

async function sendMessage(page: Page, message: string) {
  const input = page.getByLabel("Поле ввода");
  await input.fill(message);
  await input.press("Enter");
}

async function assertScenario(page: Page, scenario: ScenarioCase) {
  await sendMessage(page, scenario.prompt);
  await expect(page.getByText(scenario.expectedText, { exact: false })).toBeVisible({ timeout: 10_000 });
  if (scenario.prompt === "открыть список счетов") {
    await expect(page).toHaveURL(/\/invoices\/?$/);
  }
  if (scenario.prompt === "да, создать обращение") {
    await expect(page).toHaveURL(/\/appeals\/?$/);
  }
  if (scenario.expectedWidgetTitle) {
    await expect(page.getByText(scenario.expectedWidgetTitle, { exact: scenario.exactWidgetTitle ?? false })).toBeVisible({
      timeout: 10_000
    });
  }
}

test.describe("chat release gate scenarios", () => {
  for (const scenario of specialScenarios) {
    test(`special: ${scenario.prompt}`, async ({ page }) => {
      await openAssistant(page);
      await assertScenario(page, scenario);
    });
  }

  for (const scenario of deterministicScenarios) {
    test(`deterministic: ${scenario.prompt}`, async ({ page }) => {
      await openAssistant(page);
      await assertScenario(page, scenario);
    });
  }

  for (const scenario of liveRequiredScenarios) {
    test(`live-required fallback: ${scenario.prompt}`, async ({ page }) => {
      await openAssistant(page);
      await assertScenario(page, scenario);
    });
  }
});
