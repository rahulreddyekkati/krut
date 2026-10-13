// Value for JobAssignment.assignedById: the admin / market manager making an assignment.
// Returns null for anyone else — a worker session (clock-in materializes recurring shifts
// under the worker's own session) or no session at all (cron) — so a worker's id can never
// be recorded as the assigner. Code that clones an existing assignment must copy the
// source row's assignedById instead of calling this.
const ASSIGNER_ROLES = ["ADMIN", "MARKET_MANAGER"];

export function assignerId(user: { id: string; role: string } | null | undefined): string | null {
    return user && ASSIGNER_ROLES.includes(user.role) ? user.id : null;
}
