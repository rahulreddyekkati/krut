import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("Querying db...");
    try {
        const recaps = await (prisma as any).recap.findMany({
            include: {
                job: {
                    include: {
                        store: {
                            include: { market: { select: { name: true } } }
                        },
                        assignments: {
                            include: {
                                worker: { select: { id: true, name: true, email: true } }
                            }
                        }
                    }
                },
                skus: true
            },
            orderBy: { createdAt: "desc" }
        });
        console.log("Found", recaps.length, "recaps.");
        
        const data = recaps.map((r: any) => {
            const assignmentWithTimes = r.job.assignments?.find((a: any) => a.clockIn || a.clockOut) || r.job.assignments?.[0];
            const worker = assignmentWithTimes?.worker;

            return {
                id: r.id,
                jobId: r.jobId,
                workerName: worker?.name || "Unknown",
                workerEmail: worker?.email,
                storeName: r.job.store.name,
                marketName: r.job.store.market?.name || "—",
                status: r.status,
                createdAt: r.createdAt,
            };
        });
        console.log(data);
    } catch(e) {
        console.error("Crash:", e);
    }
}
main().catch(console.error).finally(() => prisma.$disconnect());
