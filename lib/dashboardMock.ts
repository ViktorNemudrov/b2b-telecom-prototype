/** Моки для главного экрана (дашборд) в стиле референса */

export type DashboardLine = {
  id: string;
  phone: string;
  name: string;
  gb: number;
  gbMax: number;
  min: number;
  minMax: number;
  sms: number;
  smsMax: number;
};

export const dashboardLines: DashboardLine[] = [
  {
    id: "l1",
    phone: "+7 (901) 123-45-67",
    name: "Иванов Алексей",
    gb: 490,
    gbMax: 500,
    min: 800,
    minMax: 1000,
    sms: 0,
    smsMax: 100
  },
  {
    id: "l2",
    phone: "+7 (902) 234-56-78",
    name: "Петрова Мария",
    gb: 120,
    gbMax: 500,
    min: 200,
    minMax: 1000,
    sms: 12,
    smsMax: 100
  },
  {
    id: "l3",
    phone: "+7 (903) 345-67-89",
    name: "ООО «Север»",
    gb: 400,
    gbMax: 500,
    min: 950,
    minMax: 1000,
    sms: 500,
    smsMax: 1000
  }
];

export type CommLogRow = {
  id: string;
  dateGroup: string;
  title: string;
  subtitle: string;
  duration: string;
  time: string;
  variant: "default" | "waiting" | "secretary";
  hasRecordingDot?: boolean;
  callId?: string;
};

export const communicationLogMock: CommLogRow[] = [
  {
    id: "r1",
    dateGroup: "25 марта, пн",
    title: "Доставка офисной техники",
    subtitle: "Входящий: Филатов",
    duration: "42 сек",
    time: "12:32",
    variant: "default",
    hasRecordingDot: true,
    callId: "c1"
  },
  {
    id: "r2",
    dateGroup: "25 марта, пн",
    title: "Флорист",
    subtitle: "Обработан: Филатов",
    duration: "1:32 мин",
    time: "11:05",
    variant: "default",
    hasRecordingDot: true
  },
  {
    id: "r3",
    dateGroup: "24 марта, вс",
    title: "+7 (906) 062 60-26",
    subtitle: "Ожидает ответа",
    duration: "—",
    time: "09:15",
    variant: "waiting"
  },
  {
    id: "r4",
    dateGroup: "24 марта, вс",
    title: "ООО Технологии",
    subtitle: "Принял секретарь",
    duration: "18 сек",
    time: "08:40",
    variant: "secretary",
    hasRecordingDot: true
  }
];
