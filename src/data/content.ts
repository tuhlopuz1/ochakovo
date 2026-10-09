/*
 * All game copy lives here so the team can fact-check it in one place.
 * Verified (public sources): founded 1978 as the Moscow beer & soft-drinks plant
 * built for the 1980 Olympics; privatized in 1993; brand ranked 2nd by market share
 * in 2018 (Wikipedia). Everything marked "VERIFY" should be confirmed with
 * Ochakovo HR before the demo: career tracks, programs, numbers.
 */

export type TrackId = "tech" | "eng" | "lab" | "log" | "mkt" | "sales" | "data";

export interface Track {
  id: TrackId;
  title: string;
  short: string;
  color: string; // css var name
  colorD: string;
  pitch: string;
  day: string[];
  skills: string[];
  start: string; // VERIFY
}

export const TRACKS: Record<TrackId, Track> = {
  tech: {
    id: "tech",
    title: "Технолог производства",
    short: "Технолог",
    color: "var(--amber)",
    colorD: "var(--amber-d)",
    pitch: "Отвечаешь за то, чтобы каждая партия кваса получалась такой, какой её любят миллионы.",
    day: ["Контроль брожения и рецептуры", "Запуск новых вкусов", "Разбор отклонений на варке"],
    skills: ["Химия и биотехнология", "Внимание к деталям", "Любовь к процессу"],
    start: "Производственная практика в цехе, затем позиция технолога-стажёра.",
  },
  eng: {
    id: "eng",
    title: "Инженер линий и автоматики",
    short: "Инженер",
    color: "var(--blue)",
    colorD: "var(--blue-d)",
    pitch: "Скоростные линии розлива, насосы, датчики, контроллеры. Ты делаешь так, чтобы всё крутилось.",
    day: ["Настройка оборудования", "Поиск причин простоев", "Проекты модернизации"],
    skills: ["Механика и электрика", "Системное мышление", "Спокойствие в аврал"],
    start: "Стажировка в службе главного инженера, наставник из опытной смены.",
  },
  lab: {
    id: "lab",
    title: "Специалист по качеству",
    short: "Качество",
    color: "var(--purple)",
    colorD: "var(--purple-d)",
    pitch: "Микробиология, органолептика, анализы. Последнее слово перед тем, как продукт уйдёт на полку.",
    day: ["Лабораторные анализы", "Аудит линий", "Работа с сырьём и поставщиками"],
    skills: ["Микробиология", "Аккуратность", "Умение говорить «нет»"],
    start: "Практика в лаборатории ОТК, обучение стандартам качества.",
  },
  log: {
    id: "log",
    title: "Логист и цепи поставок",
    short: "Логистика",
    color: "var(--green)",
    colorD: "var(--green-d)",
    pitch: "Сырьё на завод, продукт в магазины от Калининграда до Владивостока. Ты дирижёр этого потока.",
    day: ["Планирование отгрузок", "Оптимизация маршрутов", "Работа со складом"],
    skills: ["Аналитика", "Планирование", "Переговоры"],
    start: "Стажировка в отделе логистики, ротация через склад.",
  },
  mkt: {
    id: "mkt",
    title: "Маркетолог и бренд-менеджер",
    short: "Маркетинг",
    color: "var(--red)",
    colorD: "var(--red-d)",
    pitch: "Придумываешь, как бренды с историей звучат для нового поколения. Новинки, упаковка, кампании.",
    day: ["Исследования потребителей", "Запуск новинок", "Работа с агентствами"],
    skills: ["Креатив", "Аналитика рынка", "Насмотренность"],
    start: "Стажировка в бренд-команде, участие в реальном запуске.",
  },
  sales: {
    id: "sales",
    title: "Продажи и развитие клиентов",
    short: "Продажи",
    color: "var(--yellow)",
    colorD: "var(--yellow-d)",
    pitch: "Сети, дистрибьюторы, полки магазинов. Ты превращаешь классный продукт в выбор покупателя.",
    day: ["Встречи с партнёрами", "Анализ полки и цен", "Промо-активности"],
    skills: ["Коммуникация", "Цифры", "Драйв"],
    start: "Программа для молодых специалистов в коммерческой службе.",
  },
  data: {
    id: "data",
    title: "Аналитик данных и IT",
    short: "IT и данные",
    color: "var(--pink)",
    colorD: "#e05fb0",
    pitch: "Цифровизация производства, прогноз спроса, дашборды. Данные завода работают на тебя.",
    day: ["Дашборды для производства", "Автоматизация процессов", "Прогнозирование"],
    skills: ["SQL и Python", "Логика", "Любопытство"],
    start: "Стажировка в IT-департаменте с реальными задачами завода.",
  },
};

/* ---------- Time machine (history) ---------- */
export interface HistoryEvent {
  year: number;
  label: string; // shown as year text
  title: string;
  fact: string;
}
export const HISTORY: HistoryEvent[] = [
  {
    year: 1978,
    label: "1978",
    title: "Строим комбинат",
    fact: "В Москве начинают строить пиво-безалкогольный комбинат. Так появляется «Очаково».",
  },
  {
    year: 1980,
    label: "1980",
    title: "Напитки для Олимпиады",
    fact: "Комбинат создавали к Олимпийским играм в Москве: напитки для спортсменов и гостей со всего мира.",
  },
  {
    year: 1991,
    label: "1991",
    title: "Новая страна, новые рынки",
    fact: "После распада СССР компания удерживает позиции и начинает выходить на зарубежные рынки.",
  },
  {
    year: 1993,
    label: "1993",
    title: "Своё акционерное общество",
    fact: "Завод приватизирован и становится акционерным обществом. Начинается современная история бренда.",
  },
  {
    year: 2018,
    label: "2018",
    title: "В лидерах рынка",
    fact: "Бренд занимает второе место по доле рынка. Квас «Очаково» знают по всей стране.",
  },
  {
    year: 2026,
    label: "Сейчас",
    title: "Твоя глава",
    fact: "Следующую страницу истории пишет новое поколение. Возможно, именно ты.",
  },
];

/* ---------- Brew game steps ---------- */
export const BREW_INGREDIENTS = [
  { id: "water", name: "Вода", good: true, color: "var(--blue)", tint: "#7fd3ff", nope: "" },
  { id: "pepper", name: "Перец чили", good: false, color: "var(--red)", tint: "", nope: "Острый квас? Покупатели не оценят." },
  { id: "malt", name: "Ржаной солод", good: true, color: "var(--kvass)", tint: "#9c5a1c", nope: "" },
  { id: "fish", name: "Селёдка", good: false, color: "var(--purple)", tint: "", nope: "Селёдка хороша к столу, но не в квас." },
  { id: "sugar", name: "Сахар", good: true, color: "var(--yellow-d)", tint: "#ffffff", nope: "" },
] as const;

export const BREW_ROLES = [
  { step: "Сусло", who: "Аппаратчик варки", note: "Готовит сусло из воды и ржаного солода по рецептуре." },
  { step: "Нагрев", who: "Оператор и технолог", note: "Держат температуру в узком коридоре. Пара градусов решает вкус." },
  { step: "Брожение", who: "Технолог и микробиолог", note: "Живые дрожжи и молочнокислые бактерии работают при тёплой температуре." },
  { step: "Охлаждение", who: "Инженер КИПиА", note: "Автоматика охлаждает квас и передаёт его на фильтрацию и розлив." },
];

/* ---------- Bottling defects ---------- */
export type BottleKind = "ok" | "nocap" | "low" | "label" | "crack";
export const BOTTLE_INFO: Record<BottleKind, { name: string; bad: boolean }> = {
  ok: { name: "Норма", bad: false },
  nocap: { name: "Без крышки", bad: true },
  low: { name: "Недолив", bad: true },
  label: { name: "Кривая этикетка", bad: true },
  crack: { name: "Трещина", bad: true },
};

/* ---------- Career compass ---------- */
export interface CompassCard {
  text: string;
  hint: string;
  w: Partial<Record<TrackId, number>>;
  color: string;
}
export const COMPASS: CompassCard[] = [
  { text: "Разбираю технику, чтобы понять, как она работает", hint: "механика", w: { eng: 3, data: 1 }, color: "var(--blue)" },
  { text: "Химия и биология в школе были в радость", hint: "наука", w: { tech: 3, lab: 2 }, color: "var(--amber)" },
  { text: "Замечаю опечатку на вывеске с другого конца улицы", hint: "детали", w: { lab: 3, data: 1 }, color: "var(--purple)" },
  { text: "Люблю составлять планы и таблицы", hint: "порядок", w: { log: 3, data: 2 }, color: "var(--green)" },
  { text: "Сразу вижу, какая реклама зайдёт, а какая нет", hint: "креатив", w: { mkt: 3, sales: 1 }, color: "var(--red)" },
  { text: "Легко договариваюсь с незнакомыми людьми", hint: "общение", w: { sales: 3, mkt: 1, log: 1 }, color: "var(--yellow)" },
  { text: "Пишу код или хочу научиться", hint: "IT", w: { data: 3, eng: 1 }, color: "var(--pink)" },
  { text: "Хочу видеть результат своей работы руками", hint: "производство", w: { tech: 2, eng: 2 }, color: "var(--amber)" },
  { text: "Мне нравится решать задачи на скорость", hint: "драйв", w: { log: 2, sales: 2, eng: 1 }, color: "var(--blue)" },
  { text: "Интересно, почему люди выбирают один вкус, а не другой", hint: "люди", w: { mkt: 2, tech: 1, sales: 1 }, color: "var(--purple)" },
];

/* ---------- First year simulator (VERIFY program details) ---------- */
export interface YearChoice {
  text: string;
  result: string;
  stats: { skill: number; team: number; drive: number };
}
export interface YearScene {
  month: string;
  title: string;
  story: string;
  choices: YearChoice[];
}
export const FIRST_YEAR: YearScene[] = [
  {
    month: "Месяц 1",
    title: "Первый день",
    story: "Пропуск получен, каска выдана. За тобой закрепили наставника. С чего начнёшь?",
    choices: [
      { text: "Пройду весь цех с наставником и всё запишу", result: "Наставник впечатлён: ты знаешь путь кваса от солода до паллеты.", stats: { skill: 2, team: 1, drive: 0 } },
      { text: "Познакомлюсь с каждой сменой", result: "Через неделю тебя узнают по имени. Это бесценно на производстве.", stats: { skill: 0, team: 3, drive: 0 } },
      { text: "Найду, что можно улучшить", result: "Смело! Наставник предлагает сначала разобраться, но идею записывает.", stats: { skill: 0, team: 0, drive: 3 } },
    ],
  },
  {
    month: "Месяц 3",
    title: "Линия встала",
    story: "Ночная смена, линия розлива остановилась. Мастер смены просит помочь.",
    choices: [
      { text: "Разберусь в причине по датчикам", result: "Ты нашёл сбой датчика уровня. Простой сократился вдвое.", stats: { skill: 3, team: 0, drive: 1 } },
      { text: "Соберу команду и распределю задачи", result: "Пока одни меняли деталь, другие готовили перезапуск. Слаженно.", stats: { skill: 0, team: 3, drive: 1 } },
      { text: "Запишу всё и предложу защиту от повтора", result: "Твой чек-лист теперь висит у пульта. Так рождаются стандарты.", stats: { skill: 1, team: 0, drive: 3 } },
    ],
  },
  {
    month: "Месяц 6",
    title: "Время учиться",
    story: "Компания предлагает обучение. Что выберешь?",
    choices: [
      { text: "Технический курс по оборудованию", result: "Теперь ты понимаешь линию глубже, чем её инструкция.", stats: { skill: 3, team: 0, drive: 0 } },
      { text: "Тренинг по управлению людьми", result: "Первые навыки лидера. Скоро пригодятся.", stats: { skill: 0, team: 3, drive: 1 } },
      { text: "Ротация в соседний отдел", result: "Логистика, качество, маркетинг. Теперь ты видишь завод целиком.", stats: { skill: 1, team: 1, drive: 2 } },
    ],
  },
  {
    month: "Месяц 9",
    title: "Свой проект",
    story: "Руководитель предлагает взять собственный проект улучшения.",
    choices: [
      { text: "Сократить расход воды на мойке", result: "Экономия ресурсов и плюс для экологии. Проект заметили.", stats: { skill: 2, team: 0, drive: 2 } },
      { text: "Дашборд простоев для смен", result: "Мастера смен теперь видят проблемы в реальном времени.", stats: { skill: 2, team: 1, drive: 1 } },
      { text: "Программа адаптации для новичков", result: "Следующие стажёры скажут тебе спасибо.", stats: { skill: 0, team: 3, drive: 1 } },
    ],
  },
];

export const YEAR_OUTCOMES = {
  skill: { title: "Эксперт в деле", text: "Ты растёшь в сторону сильного специалиста. Следующая ступень: ведущий специалист и эксперт направления." },
  team: { title: "Будущий руководитель", text: "Люди тянутся к тебе. Следующая ступень: мастер смены или руководитель группы." },
  drive: { title: "Двигатель перемен", text: "Ты меняешь процессы. Следующая ступень: проектная роль и программы развития." },
};

/* ---------- Encyclopedia cards unlocked by lessons ---------- */
export const FACTS: Record<string, { title: string; text: string; color: string }> = {
  time: { title: "Олимпийские корни", text: "«Очаково» строили к Олимпиаде-80. С тех пор компания прошла путь от госкомбината до одного из лидеров рынка.", color: "var(--green)" },
  brew: { title: "Живое брожение", text: "Настоящий квас бродит: дрожжи и молочнокислые бактерии создают вкус, который не повторить сиропом.", color: "var(--amber)" },
  bottle: { title: "Контроль качества", text: "Каждая бутылка проходит проверку. Лаборатории и автоматика отсекают брак до того, как он попадёт на полку.", color: "var(--blue)" },
  compass: { title: "Много профессий", text: "На заводе работают технологи, инженеры, лаборанты, логисты, маркетологи, айтишники. Место найдётся разным талантам.", color: "var(--purple)" },
  year: { title: "Рост внутри", text: "Наставничество, обучение и ротации помогают вырасти от стажёра до руководителя внутри компании.", color: "var(--pink)" },
};

/* ---------- Path ---------- */
export type LessonKind = "time" | "brew" | "bottle" | "compass" | "year" | "chest" | "pass";
export interface Lesson {
  id: string;
  kind: LessonKind;
  title: string;
  hook: string; // big kinetic text on the intro card
  sub: string;
  xp: number;
  caps: number;
}
export interface Unit {
  id: string;
  title: string;
  sub: string;
  color: string;
  colorD: string;
  lessons: Lesson[];
}

export const UNITS: Unit[] = [
  {
    id: "u1",
    title: "Раздел 1. Знакомство",
    sub: "Откуда взялось «Очаково»",
    color: "var(--green)",
    colorD: "var(--green-d)",
    lessons: [
      { id: "time", kind: "time", title: "Машина времени", hook: "Отправляемся в 1978-й!", sub: "Расставь события на ленте времени", xp: 30, caps: 15 },
      { id: "chest1", kind: "chest", title: "Сундук", hook: "", sub: "", xp: 0, caps: 0 },
    ],
  },
  {
    id: "u2",
    title: "Раздел 2. Цех варки",
    sub: "Как рождается квас",
    color: "var(--amber)",
    colorD: "var(--amber-d)",
    lessons: [{ id: "brew", kind: "brew", title: "Сварим квас", hook: "Включаем варочный цех!", sub: "Собери сусло и запусти брожение", xp: 40, caps: 20 }],
  },
  {
    id: "u3",
    title: "Раздел 3. Линия розлива",
    sub: "Скорость и качество",
    color: "var(--blue)",
    colorD: "var(--blue-d)",
    lessons: [
      { id: "bottle", kind: "bottle", title: "Зоркий глаз", hook: "Линия запущена!", sub: "Убирай брак, пропускай норму", xp: 40, caps: 25 },
      { id: "chest2", kind: "chest", title: "Сундук", hook: "", sub: "", xp: 0, caps: 0 },
    ],
  },
  {
    id: "u4",
    title: "Раздел 4. Твой путь",
    sub: "Кем ты будешь в «Очаково»",
    color: "var(--purple)",
    colorD: "var(--purple-d)",
    lessons: [
      { id: "compass", kind: "compass", title: "Карьерный компас", hook: "Кто ты на заводе?", sub: "Свайпай карточки и найди своё", xp: 30, caps: 15 },
      { id: "year", kind: "year", title: "Первый год", hook: "Твой первый год начинается!", sub: "Принимай решения и расти", xp: 50, caps: 25 },
      { id: "pass", kind: "pass", title: "Пропуск", hook: "", sub: "", xp: 0, caps: 0 },
    ],
  },
];

export const ALL_LESSONS = UNITS.flatMap((u) => u.lessons.map((l) => ({ ...l, unit: u })));

/* ---------- Levels ---------- */
export const LEVELS = [
  { xp: 0, name: "Гость завода" },
  { xp: 40, name: "Стажёр" },
  { xp: 100, name: "Практикант" },
  { xp: 170, name: "Специалист" },
  { xp: 240, name: "Мастер цеха" },
  { xp: 320, name: "Легенда Очаково" },
];

/* ---------- Shop ---------- */
export type Accessory = "helmet" | "goggles" | "cap" | "headphones" | "bowtie" | "crown";
export const SHOP: { id: Accessory; name: string; price: number; desc: string }[] = [
  { id: "helmet", name: "Каска", price: 20, desc: "Обязательна в цехе" },
  { id: "goggles", name: "Защитные очки", price: 25, desc: "Для лаборатории" },
  { id: "cap", name: "Кепка", price: 30, desc: "Стиль логиста" },
  { id: "bowtie", name: "Бабочка", price: 35, desc: "Для презентаций" },
  { id: "headphones", name: "Наушники", price: 45, desc: "Режим фокуса" },
  { id: "crown", name: "Корона", price: 90, desc: "Для легенд" },
];

/* ---------- Achievements ---------- */
export const ACHIEVEMENTS = [
  { id: "first", name: "Первый шаг", desc: "Пройди первую игру", color: "var(--green)" },
  { id: "historian", name: "Историк", desc: "Машина времени без ошибок", color: "var(--green)" },
  { id: "brewer", name: "Квасовар", desc: "Свари идеальный квас", color: "var(--amber)" },
  { id: "eagle", name: "Орлиный глаз", desc: "Линия розлива с точностью 90%+", color: "var(--blue)" },
  { id: "combo", name: "Комбо x8", desc: "8 верных действий подряд на линии", color: "var(--blue)" },
  { id: "found", name: "Нашёл себя", desc: "Пройди карьерный компас", color: "var(--purple)" },
  { id: "stylist", name: "Модник", desc: "Купи вещь в магазине", color: "var(--pink)" },
  { id: "pass", name: "Свой человек", desc: "Получи пропуск на завод", color: "var(--yellow)" },
] as const;
export type AchievementId = (typeof ACHIEVEMENTS)[number]["id"];

/* Demo league, clearly labeled in UI as demo */
export const LEAGUE_BOTS = [
  { name: "Алина Ш.", xp: 265, color: "var(--pink)" },
  { name: "Тимур Б.", xp: 210, color: "var(--blue)" },
  { name: "Ксения Р.", xp: 174, color: "var(--purple)" },
  { name: "Артём Г.", xp: 138, color: "var(--amber)" },
  { name: "Даша Л.", xp: 96, color: "var(--green)" },
  { name: "Ильдар М.", xp: 61, color: "var(--red)" },
  { name: "Полина В.", xp: 27, color: "var(--yellow)" },
];
