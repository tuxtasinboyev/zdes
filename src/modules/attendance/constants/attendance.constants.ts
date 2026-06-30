export const ATTENDANCE_KPI_SETTING_KEY = 'attendance_kpi_template';

export const DEFAULT_ATTENDANCE_KPI_TEMPLATE = {
  latePenaltyPerMinute: 0,
  earlyLeavePenaltyPerMinute: 0,
  overtimeBonusPerMinute: 0,
  faceSimilarityThreshold: 90,
} as const;

export const AUTO_ATTENDANCE_REASON_PREFIX = 'AUTO_ATTENDANCE';
