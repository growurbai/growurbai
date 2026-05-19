export type DashboardCreditSnapshot = {
  used: number;
  total: number;
  remaining: number;
  unlimited: boolean;
};

export function buildDashboardCreditSnapshot(params: {
  total: number;
  remaining: number;
  unlimited: boolean;
}): DashboardCreditSnapshot {
  const remaining = Math.max(0, params.remaining);
  const total = Math.max(params.total, remaining);
  return {
    used: params.unlimited ? 0 : Math.max(0, total - remaining),
    total,
    remaining,
    unlimited: params.unlimited,
  };
}
