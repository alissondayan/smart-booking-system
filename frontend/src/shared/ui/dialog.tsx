import type { ReactNode } from "react";
import { Card } from "./card";

interface DialogProps {
  title: string;
  children: ReactNode;
}

export function Dialog({ title, children }: DialogProps) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
      <Card className="w-full max-w-lg">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="mt-4">{children}</div>
      </Card>
    </div>
  );
}
