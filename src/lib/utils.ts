import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type { TaggedItem } from "./types";

export type DateFormat = "short" | "long" | "time" | "medium" | "full";

export const cn = (...classes: ClassValue[]) => twMerge(clsx(...classes));

export function formatDate(date: Date, format: DateFormat = "short"): string {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();

  const months = [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
  ];

  // Pad single digits with leading zero
  const pad = (n: number) => n.toString().padStart(2, "0");

  switch (format) {
    case "short": // mm.dd.yyyy
      return `${pad(month)}.${pad(day)}.${year.toString()}`;

    case "medium": // mon yyyy
      return `${months[month - 1]} ${year}`;

    case "long": {
      // mon dd, yyyy
      return `${months[month - 1]} ${day}, ${year}`;
    }

    case "time": // hh:mm
      return `${pad(hours)}:${pad(minutes)}`;

    case "full": // mm.dd.yyyy hh:mm
      return `${pad(month)}.${pad(day)}.${year} ${pad(hours)}:${pad(minutes)}`;

    default:
      return date.toLocaleDateString();
  }
}

export function groupFeaturedItems<T extends TaggedItem>(
  items: Array<T>,
  n?: number,
): [Array<T>, Array<T>] {
  const sorted = [...items].sort(
    (a: T, b: T) => b.date.getTime() - a.date.getTime(),
  );

  const featured = sorted.filter((item) => item.featured);
  const archived = sorted.filter((item) => !item.featured);

  return [
    n ? featured.slice(0, n) : featured,
    n ? archived.slice(0, n) : archived,
  ];
}
