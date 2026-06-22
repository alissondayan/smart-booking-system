import { Card } from "./card";

interface ErrorStateProps {
  title?: string;
  description?: string;
}

export function ErrorState({ title = "Something went wrong", description = "Please try again." }: ErrorStateProps) {
  return (
    <Card className="border-red-200 bg-red-50 text-red-950">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm">{description}</p>
    </Card>
  );
}
