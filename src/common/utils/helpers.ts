export function trimToNull(value?: string | null): string | null {
  const trimmedValue = value?.trim();

  return trimmedValue ? trimmedValue : null;
}

export function isDateExpired(value: Date): boolean {
  return value.getTime() <= Date.now();
}

export function toUtcDateOnly(value: Date): Date {
  return new Date(
    Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()),
  );
}

export function calculateMinutesDifference(
  start: Date | null,
  end: Date | null,
): number {
  if (!start || !end) {
    return 0;
  }

  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 60000));
}

export function getMonthKey(value: Date): string {
  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, '0');

  return `${year}-${month}`;
}

export function parseTimeToUtcDate(baseDate: Date, time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);

  return new Date(
    Date.UTC(
      baseDate.getUTCFullYear(),
      baseDate.getUTCMonth(),
      baseDate.getUTCDate(),
      hours,
      minutes,
      0,
      0,
    ),
  );
}

export function getWorkDayNumber(value: Date): number {
  const day = value.getUTCDay();

  return day === 0 ? 7 : day;
}

export function decodeBase64Image(value: string): {
  buffer: Buffer;
  contentType: string | null;
} {
  const trimmedValue = value.trim();
  const dataUriMatch = /^data:(.+);base64,(.+)$/.exec(trimmedValue);

  if (dataUriMatch) {
    return {
      contentType: dataUriMatch[1] ?? null,
      buffer: Buffer.from(dataUriMatch[2] ?? '', 'base64'),
    };
  }

  return {
    contentType: null,
    buffer: Buffer.from(trimmedValue, 'base64'),
  };
}
