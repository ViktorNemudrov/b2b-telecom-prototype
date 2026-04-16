import { expect, test, type Page } from "@playwright/test";

type ScenarioCase = {
  prompt: string;
  expectedText: string;
  expectedWidgetTitle?: string;
  exactWidgetTitle?: boolean;
};

const specialScenarios: ScenarioCase[] = [
  { prompt: "ты чмо", expectedText: "Вроде бы взрослый человек, предприниматель, а такой некультурный!" },
  { prompt: "что ты умеешь", expectedText: "Я знаю ваши продукты и помогаю управлять ими" },
  { prompt: "привет", expectedText: "И вам здравствуйте, желаю вам хорошего дня" },
  { prompt: "добрый вечер", expectedText: "И вам здравствуйте, желаю вам хорошего дня" },
  { prompt: "как дела", expectedText: "Все хорошо, работаю на благо B2B в Билайне." }
];

const deterministicScenarios: ScenarioCase[] = [
  { prompt: "покажи неоплаченные счета", expectedText: "Показываю неоплаченные счета в чате.", expectedWidgetTitle: "Неоплаченные счета", exactWidgetTitle: true },
  { prompt: "счета за март", expectedText: "Показываю счета за март в чате.", expectedWidgetTitle: "Счета за март", exactWidgetTitle: true },
  { prompt: "счета за февраль", expectedText: "Показываю счета за февраль в чате.", expectedWidgetTitle: "Счета за февраль", exactWidgetTitle: true },
  { prompt: "какие у меня счета", expectedText: "Открываю счета и оплату" },
  { prompt: "сколько пропущенных звонков", expectedText: "По текущим данным: всего звонков", expectedWidgetTitle: "Пропущенные в чате", exactWidgetTitle: true },
  { prompt: "звонки за неделю", expectedText: "Открываю дашборд со сводкой звонков за неделю" },
  { prompt: "Секретарь", expectedText: "Открываю сценарий «Секретарь»" },
  { prompt: "Увеличить срок хранения звонков", expectedText: "увеличение срока хранения" },
  { prompt: "дай совет от ассистента", expectedText: "Совет от ассистента:" },
  { prompt: "открыть список счетов", expectedText: "Открываю полный список счетов." },
  { prompt: "позови оператора", expectedText: "Я в демо режиме и не могу звать людей" },
  { prompt: "да, создать обращение", expectedText: "Открываю создание обращения" },
  { prompt: "Статистика по времени суток", expectedText: "Открываю дашборд со сводкой звонков за неделю" },
  { prompt: "Причины пропусков звонков", expectedText: "Открываю дашборд со сводкой звонков за неделю" },
  { prompt: "Сравнение звонков с предыдущей неделей", expectedText: "Открываю дашборд со сводкой звонков за неделю" },
  { prompt: "Средняя конвертация в лид", expectedText: "Открываю дашборд со сводкой звонков за неделю" },
  { prompt: "обращения", expectedText: "На данный момент у вас 3 активных обращения", expectedWidgetTitle: "Активные обращения", exactWidgetTitle: true },
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
  { prompt: "какая погода в москве", expectedText: "Сейчас не удалось получить надежный live-ответ" },
  { prompt: "какой курс доллара сегодня", expectedText: "Сейчас не удалось получить надежный live-ответ" },
  { prompt: "последние новости", expectedText: "Сейчас не удалось получить надежный live-ответ" },
  { prompt: "расскажи про квантовый отжиг", expectedText: "Сейчас не удалось получить надежный live-ответ" },
  { prompt: "напиши стих про космос", expectedText: "Сейчас не удалось получить надежный live-ответ" }
];

async function openAssistant(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("b2b_pwa_install_dismissed_v1", "1");
  });
  await page.goto("/assistant/");
}

async function sendMessage(page: Page, message: string) {
  const input = page.getByLabel("Поле ввода");
  await input.fill(message);
  await input.press("Enter");
}

async function assertScenario(page: Page, scenario: ScenarioCase, options?: { liveFlexible?: boolean }) {
  await sendMessage(page, scenario.prompt);
  if (options?.liveFlexible) {
    // Primary: safe fallback text. If live succeeds without fallback, accept an "ответ от …" line instead.
    // Use .first() so we never hit strict-mode issues when fallback and source footer both mention providers.
    const fallbackLoc = page.getByText(scenario.expectedText, { exact: false }).first();
    const liveLoc = page.getByText(/ответ от (Grok\/xAI|OpenRouter|Groq)(?!.*ошибка)/).first();
    await expect(fallbackLoc.or(liveLoc).first()).toBeVisible({ timeout: 15_000 });
  } else {
    // User bubble can contain the same substring as the assistant reply (case/words); target the last match.
    await expect(page.getByText(scenario.expectedText, { exact: false }).last()).toBeVisible({ timeout: 10_000 });
  }
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
      await assertScenario(page, scenario, { liveFlexible: true });
    });
  }
});
