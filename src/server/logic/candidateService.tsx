import { PrismaClient } from "~prisma/client";
import { PrismaPg } from '@prisma/adapter-pg'
import { getDatabaseUrl } from "../db/database-url";

const adapter = new PrismaPg({ connectionString: getDatabaseUrl() })
const prisma = new PrismaClient({ adapter })

export async function listCandidates(/*{input contiene filtros}*/){
    await new Promise((resolve) => setTimeout(resolve, 3000));
    /*
    try {
        //dato de prueba basura
        const newCandidate = await prisma.applicant.create({
            data: {
                id: '1',
                name: 'martin',
                lastName: "fossatti",
                role: {
                    connect: {
                        id: "cmtroqosn0000l5y6ppaym3pq",
                    }
                }
            }
        });
    } catch (error) { console.log(error); }
    */
    const candidates = await prisma.applicant.findMany({
        include: { 
            role: { 
                select: {
                    name: true,
                }
            },
            tags: {
                select: {
                    name: true,
                    color: true,
                }
            },
            seniority: {
                select: {
                    name: true,
                    color: true,
                }
            },
            applications: {
                include: {
                    jobOpening : {
                        select: {
                            name: true,
                        }
                    }
                }
            },
            area: {
                select: {
                    name: true,
                }
            },
        },
        //agregar filtros a la consulta
    })
    return candidates;
}