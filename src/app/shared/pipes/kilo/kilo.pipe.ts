import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "kilo" })
export class KiloPipe implements PipeTransform {
  transform(value: number): string {
    if (value === null) {
      return "";
    }

    if (value < 1000) {
      return value.toString();
    }

    if (value >= 1000 && value < 1_000_000) {
      return (value / 1000).toFixed(1) + "K";
    }

    if (value >= 1_000_000 && value < 1_000_000_000) {
      return (value / 1_000_000).toFixed(1) + "M";
    }

    return (value / 1_000_000_000).toFixed(1) + "B";
  }
}
