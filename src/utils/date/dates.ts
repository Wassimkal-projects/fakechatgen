import {format, parse} from "date-fns";

export const DATE_US_FORMAT = "yyyy-MM-dd"
export const HUMAN_FORMAT = "d MMMM yyyy"

export const toDateInUsFormat = (date: Date): string => {
  return format(date, DATE_US_FORMAT);
}

export const toDateInHumanFormat = (date: Date): string => {
  return format(date, HUMAN_FORMAT);
}

export const fromHumanToUsFormat = (dateString: string): string => {
  const parsedDate = parse(dateString, HUMAN_FORMAT, new Date());
  return format(parsedDate, DATE_US_FORMAT);
};