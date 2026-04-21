import type { LucideIcon } from "lucide-react";
import { BarChart3, CreditCard, FileText, Layers, MessageCircle, Users } from "lucide-react";

/** Плитки экрана «Документы»: маршруты Classic-приложения. */
export const CLASSIC_DOCUMENT_TILES: Array<{
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: number;
  mockHint?: string;
}> = [
  { id: "fin", label: "Финансы", icon: CreditCard, href: "/documents/finance/" },
  {
    id: "contracts",
    label: "Договоры",
    icon: FileText,
    href: "/documents/",
    mockHint: "Договоры"
  },
  {
    id: "products",
    label: "Продукты",
    icon: Layers,
    href: "/documents/",
    mockHint: "Продукты"
  },
  {
    id: "reports",
    label: "Отчеты",
    icon: BarChart3,
    href: "/documents/",
    mockHint: "Отчеты"
  },
  {
    id: "users",
    label: "Пользователи",
    icon: Users,
    href: "/documents/",
    mockHint: "Пользователи"
  },
  { id: "support", label: "Поддержка", icon: MessageCircle, href: "/support/", badge: 1 }
];
