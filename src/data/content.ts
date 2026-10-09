/*
 * All game copy lives here so the team can fact-check it in one place.
 *
 * Sourced (ru.wikipedia.org/wiki/Очаково_(компания), ochakovo.ru «Как делают настоящий квас»):
 *  18.12.1978 launch for Olympics-80 · 1979 Pepsi & Fanta bottled at the same plant ·
 *  1993 JSC · 1996 industrial double-fermentation kvass in bottles (shelf life 20-30 days) ·
 *  1998 dark kvass «Очаковский» · 2000 Krasnodar branch · 2003 Lipetsk malthouse + Penza ·
 *  2007 Tyumen plant (Urals, Siberia, Far East) · 2013 white kvass «Семейный секрет» ·
 *  2015 juices «ДжусТим» · 2019 multigrain INICE without added sugar · 2022 CoolCola, Fancy, Street ·
 *  10 enterprises, 4 plants (Moscow, Krasnodar, Penza, Tyumen), 19 000 ha of fields, export to 30+ countries ·
 *  65 000 l mash tuns, 700 000 l CCT "as tall as an 8-storey building", 1000 bottles per minute,
 *  own grain + own malt + own starter, acids form naturally, «Очаковский» filtered, «Семейный секрет» not.
 *
 * Mentors are composite characters (labelled in UI). Career programs and vacancies are
 * examples marked VERIFY: confirm with Ochakovo HR before the demo.
 */

/* ---------------- Mentors ---------------- */
export type MentorId = "guide" | "brand" | "tech" | "eng" | "qa" | "sales";
export interface Mentor {
  id: MentorId;
  name: string;
  role: string;
  path: string; // career story
  look: { skin: string; hair: string; hairStyle: "bob" | "short" | "bun" | "curly" | "buzz"; shirt: string; extra?: "helmet" | "glasses" | "headset" | "coat" };
}
export const MENTORS: Record<MentorId, Mentor> = {
  guide: {
    id: "guide",
    name: "Вера",
    role: "Экскурсовод музея завода",
    path: "Пришла на завод студенткой-практиканткой, теперь водит экскурсии и знает историю каждого цеха.",
    look: { skin: "#f6c9a6", hair: "#6b3b1f", hairStyle: "bun", shirt: "var(--green)", extra: "glasses" },
  },
  brand: {
    id: "brand",
    name: "Аня",
    role: "Бренд-менеджер",
    path: "На 4 курсе пришла стажёром в маркетинг. Через три года ведёт собственный бренд.",
    look: { skin: "#f3c19d", hair: "#2b1a12", hairStyle: "bob", shirt: "var(--red)" },
  },
  tech: {
    id: "tech",
    name: "Марина",
    role: "Технолог кваса",
    path: "Начинала лаборантом после пищевого вуза. Сейчас отвечает за рецептуры кваса.",
    look: { skin: "#e8b48f", hair: "#b5532a", hairStyle: "curly", shirt: "#ffffff", extra: "coat" },
  },
  eng: {
    id: "eng",
    name: "Тимур",
    role: "Начальник смены варочного цеха",
    path: "Пришёл стажёром в службу главного инженера. За четыре года вырос до начальника смены.",
    look: { skin: "#d9a07a", hair: "#1f1a17", hairStyle: "short", shirt: "var(--blue)", extra: "helmet" },
  },
  qa: {
    id: "qa",
    name: "Ольга",
    role: "Инженер по качеству",
    path: "Работала в лаборатории ОТК, теперь проводит аудиты линий розлива.",
    look: { skin: "#f6d0b1", hair: "#d9a441", hairStyle: "short", shirt: "var(--purple)", extra: "glasses" },
  },
  sales: {
    id: "sales",
    name: "Кирилл",
    role: "Менеджер по ключевым клиентам",
    path: "Начинал торговым представителем в Пензе. Теперь ведёт переговоры с федеральными сетями.",
    look: { skin: "#eab48c", hair: "#4a2c19", hairStyle: "buzz", shirt: "var(--yellow-d)", extra: "headset" },
  },
};

/* ---------------- Museum artifacts ---------------- */
export type ArtifactArt = "switch" | "bottles" | "flask" | "label" | "map" | "shelf" | "survey" | "tube" | "tank" | "medal" | "globe";
export interface Artifact {
  id: string;
  year: string;
  title: string;
  story: string;
  art: ArtifactArt;
  color: string;
}
export const ARTIFACTS: Artifact[] = [
  { id: "a1978", year: "1978", title: "Рубильник запуска", story: "18 декабря 1978 года запустили Московский пиво-безалкогольный комбинат. Его строили, чтобы поить участников и гостей Олимпиады-80.", art: "switch", color: "var(--green)" },
  { id: "a1979", year: "1979", title: "Две бутылки-соперницы", story: "В 1979 году на заводе поставили линии и для собственных марок, и для Pepsi и Fanta. Продукты конкурентов на одном заводе: редкий случай в мире.", art: "bottles", color: "var(--blue)" },
  { id: "a1996", year: "1996", title: "Колба с закваской", story: "В 1996 году технологию двойного брожения кваса впервые воспроизвели в промышленном масштабе и разлили квас в бутылки. Срок хранения вырос до 20-30 суток.", art: "flask", color: "var(--amber)" },
  { id: "a1998", year: "1998", title: "Этикетка «Очаковского»", story: "В 1998 году вышел тёмный квас «Очаковский». Сегодня это один из самых узнаваемых квасов страны.", art: "label", color: "var(--red)" },
  { id: "a2007", year: "2000-2007", title: "Карта заводов", story: "Филиал в Краснодаре (2000), солодовня в Липецкой области и завод в Пензе (2003), завод в Тюмени (2007). Сегодня в компании 10 предприятий.", art: "map", color: "var(--purple)" },
  { id: "a2022", year: "2013-2022", title: "Полка новинок", story: "Белый квас «Семейный секрет» (2013), соки «ДжусТим» (2015), мультизлаковый INICE без сахара (2019), CoolCola, Fancy и Street (2022).", art: "shelf", color: "var(--pink)" },
  { id: "aMkt", year: "Смена 1", title: "Анкета покупателя", story: "Любой продукт начинается с исследования: что люди пьют, когда и почему. Этим занимаются маркетологи и бренд-менеджеры.", art: "survey", color: "var(--red)" },
  { id: "aLab", year: "Смена 2", title: "Пробирка закваски", story: "Фирменная закваска «Очаково»: смесь чистых культур дрожжей и молочнокислых бактерий. Её смешивают на заводе сами.", art: "tube", color: "var(--purple)" },
  { id: "aProd", year: "Смена 3", title: "Модель танка", story: "Цилиндро-конический танк для брожения вмещает 700 000 литров и высотой с восьмиэтажный дом.", art: "tank", color: "var(--amber)" },
  { id: "aQa", year: "Смена 4", title: "Медаль ОТК", story: "Линия разливает до 1000 бутылок или банок в минуту. Контроль качества следит, чтобы ни одна с браком не ушла на полку.", art: "medal", color: "var(--blue)" },
  { id: "aSales", year: "Смена 5", title: "Глобус экспорта", story: "Напитки «Очаково» продаются в России и экспортируются более чем в 30 стран.", art: "globe", color: "var(--green)" },
];

/* ---------------- History excursion ---------------- */
export type SceneKind = "launch" | "rivals" | "ferment" | "label" | "map" | "shelf";
export interface HistoryScene {
  kind: SceneKind;
  year: string;
  title: string;
  task: string; // what the player does
  fact: string;
  artifact: string;
}
export const HISTORY_SCENES: HistoryScene[] = [
  { kind: "launch", year: "1978", title: "Москва готовится к Олимпиаде", task: "Дёрни рубильник и запусти новый комбинат", fact: "18 декабря 1978 года заработал Московский пиво-безалкогольный комбинат. Напитки для Олимпиады-80 делали здесь.", artifact: "a1978" },
  { kind: "rivals", year: "1979", title: "Соперники на одной линии", task: "Запусти линии розлива: нажми на каждую бутылку", fact: "С 1979 года здесь разливали не только свои напитки, но и Pepsi с Fanta. Конкуренты на одном заводе: почти уникальная история.", artifact: "a1979" },
  { kind: "ferment", year: "1996", title: "Квас как дома, но в бутылке", task: "Добавь закваску и посмотри, что происходит в танке", fact: "Закваска запускает двойное брожение: спиртовое и молочнокислое. В 1996 году «Очаково» первым воспроизвело его в промышленном масштабе.", artifact: "a1996" },
  { kind: "label", year: "1998", title: "Рождение «Очаковского»", task: "Наклей этикетку на новый квас", fact: "В 1998 году вышел тёмный квас «Очаковский». Солод для него обжаривают: отсюда цвет и хлебный вкус.", artifact: "a1998" },
  { kind: "map", year: "2000-2007", title: "Завод становится компанией", task: "Зажги все точки на карте", fact: "Свои заводы в Москве, Краснодаре, Пензе и Тюмени, солодовня в Липецкой области и 19 000 гектаров полей: компания сама выращивает зерно и делает солод.", artifact: "a2007" },
  { kind: "shelf", year: "2013-2022", title: "Новые вкусы", task: "Распакуй все новинки на полке", fact: "Технологи воссоздали белый квас, запустили соки, напиток без сахара и свою колу. Новые продукты появляются каждый год.", artifact: "a2022" },
];

export const MAP_POINTS = [
  { id: "msk", name: "Москва", year: "1978", what: "Головной завод", x: 104, y: 100, dy: -14 },
  { id: "krd", name: "Краснодар", year: "2000", what: "Первый филиал", x: 92, y: 196, dy: -14 },
  { id: "lip", name: "Липецкая обл.", year: "2003", what: "Своя солодовня", x: 112, y: 146, dy: 24 },
  { id: "pnz", name: "Пенза", year: "2003", what: "Завод напитков", x: 162, y: 124, dy: -14 },
  { id: "tmn", name: "Тюмень", year: "2007", what: "Для Урала, Сибири и Дальнего Востока", x: 250, y: 104, dy: -14 },
];
export const SHELF_ITEMS = [
  { name: "Семейный секрет", year: "2013", what: "Белый нефильтрованный квас", color: "#e9d7a8" },
  { name: "ДжусТим", year: "2015", what: "Соки и нектары", color: "var(--amber)" },
  { name: "INICE", year: "2019", what: "Мультизлаковый, без добавленного сахара", color: "var(--blue)" },
  { name: "CoolCola", year: "2022", what: "Своя кола", color: "var(--red)" },
];

/* ---------------- Shift 1: marketing ---------------- */
export type Tag = "classic" | "novel" | "health" | "natural";
export const INSIGHTS: { text: string; tag: Tag }[] = [
  { text: "Всё больше людей читают состав и хотят меньше сахара", tag: "health" },
  { text: "Хочется попробовать необычный вкус, а не «как у всех»", tag: "novel" },
  { text: "Квас для многих это вкус лета и детства", tag: "classic" },
  { text: "Покупатели ценят «настоящее»: живое брожение, без химии", tag: "natural" },
  { text: "Многие берут напиток спортом и учёбой: важна польза", tag: "health" },
  { text: "Нравится, когда у продукта есть история", tag: "classic" },
];
export type ConceptId = "dark" | "white" | "borodino" | "grain";
export interface Concept {
  id: ConceptId;
  name: string;
  desc: string;
  tags: Tag[];
  color: string;
  liquid: string;
  analog: string; // how Ochakovo does it
  target: { sweet: [number, number]; sour: [number, number]; body: [number, number]; gas: [number, number]; roast: boolean };
  filtered: boolean;
}
export const CONCEPTS: Concept[] = [
  {
    id: "dark",
    name: "Тёмный хлебный квас",
    desc: "Классика на обжаренном ржаном солоде",
    tags: ["classic", "natural"],
    color: "var(--kvass)",
    liquid: "#8a4508",
    analog: "Так устроен «Очаковский» (1998): ржаной солод обжаривают, квас фильтруют. Классика, которую знает вся страна.",
    target: { sweet: [3, 4], sour: [2, 3], body: [4, 5], gas: [3, 4], roast: true },
    filtered: true,
  },
  {
    id: "white",
    name: "Белый квас со смородиной и мятой",
    desc: "Светлый, кисловатый, нефильтрованный",
    tags: ["novel", "natural"],
    color: "#c9a95a",
    liquid: "#d8b86a",
    analog: "Похож на «Семейный секрет. Смородина-мята»: рожь и пшеница, солод не обжаривают, квас не фильтруют, поэтому в нём есть осадок.",
    target: { sweet: [2, 3], sour: [3, 5], body: [2, 3], gas: [2, 3], roast: false },
    filtered: false,
  },
  {
    id: "borodino",
    name: "Бородинский на трёх злаках",
    desc: "Рожь, пшеница и ячмень, плотный вкус",
    tags: ["classic", "novel"],
    color: "#6b3410",
    liquid: "#6b3410",
    analog: "Как «Семейный секрет. Бородинский»: рожь, пшеница и ячмень дают плотный, «хлебный» вкус.",
    target: { sweet: [2, 3], sour: [2, 4], body: [4, 5], gas: [2, 3], roast: true },
    filtered: false,
  },
  {
    id: "grain",
    name: "Мультизлаковый без сахара",
    desc: "Лёгкий напиток для тех, кто следит за составом",
    tags: ["health", "novel"],
    color: "var(--blue)",
    liquid: "#e4c98a",
    analog: "В 2019 году «Очаково» выпустило мультизлаковый INICE без добавленного сахара. Солод для таких напитков делают на своей солодовне.",
    target: { sweet: [1, 2], sour: [2, 3], body: [2, 4], gas: [3, 4], roast: false },
    filtered: true,
  },
];
export const NAME_IDEAS: Record<ConceptId, string[]> = {
  dark: ["Хлебный ветер", "Тёмная горбушка", "Очень квас"],
  white: ["Мятный рассвет", "Белая ночь", "Смородинка"],
  borodino: ["Три злака", "Бородино", "Горбушка"],
  grain: ["Зерно+", "Лёгкий колос", "Злаковый старт"],
};
export const LABEL_COLORS = ["#58cc02", "#1cb0f6", "#ff4b4b", "#ce82ff", "#ff9600", "#2b2b2b"];

/* ---------------- Shift 5: sales & logistics ---------------- */
export const PLANTS = [
  { id: "msk", name: "Москва", lat: 55.75, lon: 37.62 },
  { id: "pnz", name: "Пенза", lat: 53.2, lon: 45.0 },
  { id: "krd", name: "Краснодар", lat: 45.04, lon: 38.98 },
  { id: "tmn", name: "Тюмень", lat: 57.15, lon: 65.53 },
];
export const ORDERS = [
  { id: "spb", name: "Санкт-Петербург", lat: 59.94, lon: 30.31 },
  { id: "rnd", name: "Ростов-на-Дону", lat: 47.24, lon: 39.71 },
  { id: "kzn", name: "Казань", lat: 55.79, lon: 49.12 },
  { id: "nsk", name: "Новосибирск", lat: 55.03, lon: 82.92 },
  { id: "ekb", name: "Екатеринбург", lat: 56.84, lon: 60.6 },
];

export interface NegotiationRound {
  buyer: string;
  options: { text: string; trust: number; reply: string; uses?: "qa" | "fit" | "lab" }[];
}
export const NEGOTIATION: NegotiationRound[] = [
  {
    buyer: "У нас на полке уже десяток квасов. Зачем нам ещё один?",
    options: [
      { text: "Покажу исследование: мы делали продукт под запрос покупателей", trust: 2, reply: "Хм, аргумент. Покажите цифры.", uses: "fit" },
      { text: "Он просто вкусный, попробуйте!", trust: 0, reply: "Все так говорят.", },
      { text: "Дадим вам самую низкую цену на рынке", trust: 1, reply: "Цена важна, но маржа тоже. Посмотрим." },
    ],
  },
  {
    buyer: "А если пойдёт брак? Нам возвраты не нужны.",
    options: [
      { text: "У нас многоступенчатый контроль качества, вот результаты проверки линии", trust: 2, reply: "Вижу, у вас серьёзный ОТК.", uses: "qa" },
      { text: "Брака не бывает", trust: -1, reply: "Так не бывает. Это настораживает." },
      { text: "Заменим любую партию за наш счёт", trust: 1, reply: "Хорошая гарантия." },
    ],
  },
  {
    buyer: "Хорошо. А кто его будет покупать?",
    options: [
      { text: "Наша аудитория и почему она это выберет", trust: 2, reply: "Понятная целевая аудитория. Это я могу защитить.", uses: "fit" },
      { text: "Все! Квас пьют все", trust: 0, reply: "«Все» это никто." },
      { text: "Запустим промо: дегустации в магазинах летом", trust: 1, reply: "Промо помогает, договорились." },
    ],
  },
];

/* ---------------- Careers ---------------- */
export type SkillId = "creative" | "precision" | "engineering" | "attention" | "communication";
export const SKILLS: Record<SkillId, { name: string; color: string; shift: string }> = {
  creative: { name: "Креатив", color: "var(--red)", shift: "Маркетинг" },
  precision: { name: "Точность", color: "var(--purple)", shift: "Лаборатория" },
  engineering: { name: "Инженерия", color: "var(--amber)", shift: "Варочный цех" },
  attention: { name: "Внимательность", color: "var(--blue)", shift: "Контроль качества" },
  communication: { name: "Коммуникация", color: "var(--green)", shift: "Продажи" },
};

export interface Track {
  skill: SkillId;
  title: string;
  short: string;
  color: string;
  colorD: string;
  pitch: string;
  ladder: string[]; // VERIFY
  programs: { title: string; text: string }[]; // VERIFY
}
export const TRACKS: Record<SkillId, Track> = {
  creative: {
    skill: "creative",
    title: "Маркетинг и бренды",
    short: "Маркетинг",
    color: "var(--red)",
    colorD: "var(--red-d)",
    pitch: "Ты чувствуешь аудиторию и умеешь превращать инсайт в продукт. Тебе в бренд-команду.",
    ladder: ["Стажёр отдела маркетинга", "Ассистент бренд-менеджера", "Бренд-менеджер", "Руководитель группы брендов"],
    programs: [
      { title: "Стажировка в бренд-команде", text: "Исследования, запуск новинок, работа с агентствами." },
      { title: "Трейд-маркетинг", text: "Промо, выкладка, работа с сетями." },
    ],
  },
  precision: {
    skill: "precision",
    title: "Технолог производства",
    short: "Технолог",
    color: "var(--purple)",
    colorD: "var(--purple-d)",
    pitch: "Ты доводишь рецептуру до идеала и любишь, когда всё сходится. Тебе в технологи.",
    ladder: ["Лаборант / стажёр-технолог", "Технолог", "Ведущий технолог", "Главный технолог направления"],
    programs: [
      { title: "Производственная практика", text: "Варочный цех, лаборатория, участие в разработке рецептур." },
      { title: "Стажировка в лаборатории", text: "Микробиология, органолептика, контроль сырья." },
    ],
  },
  engineering: {
    skill: "engineering",
    title: "Инженер производства",
    short: "Инженер",
    color: "var(--amber)",
    colorD: "var(--amber-d)",
    pitch: "Ты быстро находишь, где сломалось, и держишь процесс под контролем. Тебе в цех.",
    ladder: ["Стажёр службы главного инженера", "Инженер КИПиА / механик", "Мастер смены", "Начальник цеха"],
    programs: [
      { title: "Инженерная стажировка", text: "Линии розлива, автоматика, модернизация оборудования." },
      { title: "Практика для технических вузов", text: "Наставник из смены, реальные задачи цеха." },
    ],
  },
  attention: {
    skill: "attention",
    title: "Контроль качества",
    short: "Качество",
    color: "var(--blue)",
    colorD: "var(--blue-d)",
    pitch: "От тебя не ускользнёт ни одна мелочь. Последнее слово перед полкой за тобой.",
    ladder: ["Лаборант ОТК", "Инженер по качеству", "Ведущий специалист по качеству", "Руководитель службы качества"],
    programs: [
      { title: "Стажировка в ОТК", text: "Анализы, аудит линий, работа с сырьём." },
      { title: "Практика в микробиологии", text: "Чистые культуры, закваска, лабораторный контроль." },
    ],
  },
  communication: {
    skill: "communication",
    title: "Продажи и логистика",
    short: "Продажи",
    color: "var(--green)",
    colorD: "var(--green-d)",
    pitch: "Ты умеешь договариваться и думать маршрутами. Тебе в коммерческую службу.",
    ladder: ["Торговый представитель / стажёр", "Менеджер по продажам", "Менеджер по ключевым клиентам", "Руководитель региона"],
    programs: [
      { title: "Программа в коммерческой службе", text: "Работа с сетями и дистрибьюторами." },
      { title: "Стажировка в логистике", text: "Планирование отгрузок между четырьмя заводами." },
    ],
  },
};

/* ---------------- Path ---------------- */
export type LessonKind = "history" | "marketing" | "lab" | "production" | "qc" | "sales" | "chest" | "final";
export interface Lesson {
  id: string;
  kind: LessonKind;
  title: string;
  hook: string;
  sub: string;
  mentor?: MentorId;
  brief?: string; // mentor's first line
  xp: number;
  caps: number;
  artifact?: string;
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
    title: "Узнать",
    sub: "Экскурсия по истории завода",
    color: "var(--green)",
    colorD: "var(--green-d)",
    lessons: [
      { id: "history", kind: "history", title: "Экскурсия", hook: "Добро пожаловать на завод!", sub: "Шесть эпох, шесть экспонатов в музей", mentor: "guide", brief: "Привет! Я покажу тебе, как завод для Олимпиады стал компанией с десятью предприятиями. Ничего заучивать не надо: просто делай то, что делали тогда.", xp: 30, caps: 15 },
    ],
  },
  {
    id: "u2",
    title: "Придумать",
    sub: "Маркетинг и лаборатория",
    color: "var(--red)",
    colorD: "var(--red-d)",
    lessons: [
      { id: "marketing", kind: "marketing", title: "Смена 1. Маркетинг", hook: "Придумай свой напиток!", sub: "Исследуй аудиторию и выбери концепт", mentor: "brand", brief: "Любой продукт начинается не с рецепта, а с людей. Разберём, что важно покупателям, и придумаем концепт твоей первой партии.", xp: 35, caps: 15, artifact: "aMkt" },
      { id: "chest1", kind: "chest", title: "Сундук", hook: "", sub: "", xp: 0, caps: 0 },
      { id: "lab", kind: "lab", title: "Смена 2. Лаборатория", hook: "Колдуем над рецептом!", sub: "Подбери рецептуру под вкус дегустаторов", mentor: "tech", brief: "Теперь твоя идея должна стать вкусом. Подбирай рецепт, а дегустаторы подскажут, куда двигаться. Подсказка: кислоту мы не добавляем, она рождается при брожении.", xp: 40, caps: 20, artifact: "aLab" },
    ],
  },
  {
    id: "u3",
    title: "Произвести",
    sub: "Варочный цех и контроль качества",
    color: "var(--amber)",
    colorD: "var(--amber-d)",
    lessons: [
      { id: "production", kind: "production", title: "Смена 3. Варочный цех", hook: "Запускаем варку!", sub: "Собери трубы, затор и брожение", mentor: "eng", brief: "Здесь рецепт превращается в тысячи литров. Сначала собери линию от водоподготовки, потом проведём затор и брожение в танке на 700 000 литров.", xp: 40, caps: 20, artifact: "aProd" },
      { id: "qc", kind: "qc", title: "Смена 4. Контроль качества", hook: "Линия запущена!", sub: "Снимай брак, пропускай норму", mentor: "qa", brief: "Линия разливает до тысячи бутылок в минуту. Твоя задача: снять с неё всё, что не должно попасть на полку.", xp: 40, caps: 25, artifact: "aQa" },
      { id: "chest2", kind: "chest", title: "Сундук", hook: "", sub: "", xp: 0, caps: 0 },
    ],
  },
  {
    id: "u4",
    title: "Продать",
    sub: "Логистика, переговоры и финал",
    color: "var(--blue)",
    colorD: "var(--blue-d)",
    lessons: [
      { id: "sales", kind: "sales", title: "Смена 5. Продажи", hook: "Везём партию на полку!", sub: "Распредели заказы и договорись с сетью", mentor: "sales", brief: "У нас четыре завода по всей стране. Сначала отправим заказы с ближайших, а потом убедим федеральную сеть поставить твой квас на полку.", xp: 45, caps: 25, artifact: "aSales" },
      { id: "final", kind: "final", title: "Первая партия", hook: "", sub: "", xp: 0, caps: 0 },
    ],
  },
];

export const ALL_LESSONS = UNITS.flatMap((u) => u.lessons.map((l) => ({ ...l, unit: u })));

/* After-shift fact cards for the results screen */
export const FACTS: Record<string, { title: string; text: string; color: string }> = {
  history: { title: "10 предприятий", text: "От комбината к Олимпиаде-80 до 4 заводов, солодовни, виноградников и 19 000 гектаров полей.", color: "var(--green)" },
  marketing: { title: "Портфель брендов", text: "Квас, лимонады, вода, соки, мультизлаковые напитки и многое другое. За каждым брендом стоит команда маркетинга.", color: "var(--red)" },
  lab: { title: "Свой полный цикл", text: "«Очаково» само выращивает зерно, сушит солод и смешивает закваску. Кислоты в квасе образуются естественно.", color: "var(--purple)" },
  production: { title: "Масштаб цеха", text: "Заторные чаны по 65 000 литров, танки брожения по 700 000 литров. Квас как дома, только объёмы другие.", color: "var(--amber)" },
  qc: { title: "1000 бутылок в минуту", text: "На такой скорости качество держат автоматика, лаборатория и люди из ОТК.", color: "var(--blue)" },
  sales: { title: "30+ стран", text: "Четыре завода закрывают всю страну, а напитки экспортируются более чем в 30 стран.", color: "var(--green)" },
};

/* ---------------- Levels, shop, achievements, league ---------------- */
export const LEVELS = [
  { xp: 0, name: "Гость завода" },
  { xp: 40, name: "Стажёр" },
  { xp: 100, name: "Практикант" },
  { xp: 170, name: "Специалист" },
  { xp: 240, name: "Мастер цеха" },
  { xp: 320, name: "Легенда Очаково" },
];

export type Accessory = "helmet" | "goggles" | "cap" | "headphones" | "bowtie" | "crown";
export const SHOP: { id: Accessory; name: string; price: number; desc: string }[] = [
  { id: "helmet", name: "Каска", price: 20, desc: "Обязательна в цехе" },
  { id: "goggles", name: "Защитные очки", price: 25, desc: "Для лаборатории" },
  { id: "cap", name: "Кепка", price: 30, desc: "Стиль логиста" },
  { id: "bowtie", name: "Бабочка", price: 35, desc: "Для переговоров" },
  { id: "headphones", name: "Наушники", price: 45, desc: "Режим фокуса" },
  { id: "crown", name: "Корона", price: 90, desc: "Для легенд" },
];

export const ACHIEVEMENTS = [
  { id: "first", name: "Первый шаг", desc: "Пройди первый уровень", color: "var(--green)" },
  { id: "curator", name: "Хранитель", desc: "Собери все экспонаты музея", color: "var(--green)" },
  { id: "insight", name: "В точку", desc: "Концепт попал в аудиторию на 100%", color: "var(--red)" },
  { id: "chemist", name: "Химик", desc: "Рецепт с первой попытки", color: "var(--purple)" },
  { id: "engineer", name: "Без перегрева", desc: "Варка без единой ошибки", color: "var(--amber)" },
  { id: "eagle", name: "Орлиный глаз", desc: "Контроль качества с точностью 90%+", color: "var(--blue)" },
  { id: "negotiator", name: "Переговорщик", desc: "Максимальное доверие сети", color: "var(--green)" },
  { id: "stylist", name: "Модник", desc: "Купи вещь в магазине", color: "var(--pink)" },
  { id: "pass", name: "Свой человек", desc: "Отправь заявку на стажировку", color: "var(--yellow)" },
] as const;
export type AchievementId = (typeof ACHIEVEMENTS)[number]["id"];

/* Demo university cup, clearly labelled as demo in UI */
export const UNIVERSITIES = [
  { name: "Росбиотех (МГУПП)", xp: 4120 },
  { name: "МГТУ им. Баумана", xp: 3870 },
  { name: "РЭУ им. Плеханова", xp: 3310 },
  { name: "НИУ ВШЭ", xp: 2950 },
  { name: "МГУ", xp: 2480 },
  { name: "РТУ МИРЭА", xp: 1990 },
  { name: "Финансовый университет", xp: 1540 },
];

/* ---------------- Shift 4: quality control ---------------- */
export type BottleKind = "ok" | "nocap" | "low" | "label" | "crack";
export const BOTTLE_INFO: Record<BottleKind, { name: string; bad: boolean }> = {
  ok: { name: "Норма", bad: false },
  nocap: { name: "Без крышки", bad: true },
  low: { name: "Недолив", bad: true },
  label: { name: "Кривая этикетка", bad: true },
  crack: { name: "Трещина", bad: true },
};
