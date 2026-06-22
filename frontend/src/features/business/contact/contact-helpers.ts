import type { ResolvedBusinessConfig } from "@/config/business-config.schema";

export function getVisibleContactItems(config: ResolvedBusinessConfig) {
  const items: Array<{ label: string; value: string }> = [];

  if (config.contact.showPhone && config.resolved.phone) {
    items.push({ label: "Phone", value: config.resolved.phone });
  }

  if (config.contact.showEmail && config.resolved.email) {
    items.push({ label: "Email", value: config.resolved.email });
  }

  if (config.contact.showAddress && config.resolved.address) {
    items.push({ label: "Address", value: config.resolved.address });
  }

  if (config.contact.showWebsite && config.resolved.website) {
    items.push({ label: "Website", value: config.resolved.website });
  }

  return items;
}
