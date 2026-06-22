import type { Service } from "@/shared/types/api";

export function sortServicesForDisplay(services: Service[]): Service[] {
  return [...services].sort((first, second) => {
    if (first.sortOrder !== second.sortOrder) {
      return first.sortOrder - second.sortOrder;
    }

    return first.name.localeCompare(second.name);
  });
}
