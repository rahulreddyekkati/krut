// Row builders for the admin "jobs" listing (GET /api/admin/dashboard-details?type=jobs).
// Pure — no prisma — so the row rules can be unit tested.

type AssignedByName = (assignment: any) => string | null;

// Job.date and JobAssignment.date are calendar markers (UTC midnight of the local date).
// Compare them by day key, never by timestamp: some old assignment rows are stored as
// T05:00:00Z and would not equal a T00:00:00Z job date.
const dayKey = (d: Date | string) => new Date(d).toISOString().slice(0, 10);

export function unassignedRow(job: any) {
    return {
        id: job.id,
        assignmentId: null,
        workerId: null,
        status: null,
        requestedWorkerId: null,
        storeName: job.store.name,
        startTime: job.startTimeStr || "--",
        endTime: job.endTimeStr || "--",
        marketName: job.store.market?.name || "—",
        assignedWorker: "Unassigned",
        assignedByName: null,
        hasCustomTimes: false,
        // No shift yet — the job's own brand is what an assignment would default to.
        brandAllocation: job.brand ?? null,
        jobBrand: job.brand ?? null,
        breakTimeMinutes: 0,
        marketId: job.store.market?.id || null,
        storeId: job.storeId,
        jobId: job.id,
        date: job.date ? new Date(job.date).toISOString() : null,
    };
}

export function assignmentRow(job: any, a: any, assignedByName?: AssignedByName) {
    return {
        id: job.id,
        assignmentId: a.id,
        workerId: a.workerId,
        status: a.status,
        requestedWorkerId: a.requestedWorkerId,
        storeName: job.store.name,
        startTime: a.customStartTimeStr || job.startTimeStr || "--",
        endTime: a.customEndTimeStr || job.endTimeStr || "--",
        marketName: job.store.market?.name || "—",
        assignedWorker: a.worker?.name || "Unassigned",
        assignedByName: assignedByName ? assignedByName(a) : null,
        hasCustomTimes: !!(a.customStartTimeStr || a.customEndTimeStr),
        brandAllocation: a.brandAllocation ?? null,
        jobBrand: job.brand ?? null,
        breakTimeMinutes: a.breakTimeMinutes ?? 0,
        marketId: job.store.market?.id || null,
        storeId: job.storeId,
        jobId: job.id,
        date: a.date ? new Date(a.date).toISOString() : null,
    };
}

// "By Date" tab rows for one specific-date job (Job.date set, today or later).
//
// The job always gets a row on its own date: its assignments for that day, or an
// Unassigned row when there are none. Users → Assign Shifts lets an admin put a worker on
// a dated job for a different day; such an assignment must not stand in for the job's own
// date (that hid the real shift entirely). A different-day assignment that is still
// upcoming is listed under its own date and flagged offDate; one in the past is history,
// not an upcoming shift, and is left out.
export function upcomingRowsForJob(job: any, todayKey: string, assignedByName?: AssignedByName) {
    const jobKey = dayKey(job.date);
    const dated = (job.assignments as any[]).filter(a => a.date);

    const onDate = dated.filter(a => dayKey(a.date) === jobKey);
    const otherUpcoming = dated.filter(a => dayKey(a.date) !== jobKey && dayKey(a.date) >= todayKey);

    return [
        ...(onDate.length > 0 ? onDate.map(a => assignmentRow(job, a, assignedByName)) : [unassignedRow(job)]),
        ...otherUpcoming.map(a => ({ ...assignmentRow(job, a, assignedByName), offDate: true })),
    ];
}
