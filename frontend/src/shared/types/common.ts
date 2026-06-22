export interface NavigationItem {
  label: string;
  href: string;
  future?: boolean;
}

export type AsyncStatus = "idle" | "loading" | "success" | "error";
