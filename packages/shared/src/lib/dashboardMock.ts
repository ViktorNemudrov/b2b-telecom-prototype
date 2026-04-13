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
    dateGroup: "18 мая, вт",
    title: "+7 (946) 525 00-24",
    subtitle: "Принял секретарь",
    duration: "2:42 сек",
    time: "16:02",
    variant: "secretary",
    hasRecordingDot: true,
    callId: "c2"
  },
  {
    id: "r2",
    dateGroup: "18 мая, вт",
    title: "Доставка офисной техники",
    subtitle: "Принял секретарь",
    duration: "54 сек",
    time: "16:02",
    variant: "secretary",
    hasRecordingDot: true,
    callId: "c1"
  },
  {
    id: "r3",
    dateGroup: "18 мая, вт",
    title: "+7 (906) 062 60-26",
    subtitle: "Принял секретарь",
    duration: "25 сек",
    time: "14:15",
    variant: "secretary",
    hasRecordingDot: true,
    callId: "c3"
  },
  {
    id: "r4",
    dateGroup: "19 мая, ср",
    title: "+7 (904) 023 53-21",
    subtitle: "Принял секретарь",
    duration: "48 сек",
    time: "11:04",
    variant: "secretary",
    hasRecordingDot: true,
    callId: "c4"
  },
  {
    id: "r5",
    dateGroup: "19 мая, ср",
    title: "Вода офис",
    subtitle: "Принял секретарь",
    duration: "32 сек",
    time: "09:02",
    variant: "secretary",
    hasRecordingDot: true,
    callId: "c5"
  },
  {
    id: "r6",
    dateGroup: "19 мая, ср",
    title: "Канцелярия",
    subtitle: "Принял секретарь",
    duration: "12 сек",
    time: "09:01",
    variant: "secretary",
    hasRecordingDot: true,
    callId: "c6"
  }
];
