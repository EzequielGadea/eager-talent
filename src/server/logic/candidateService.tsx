import { PrismaClient } from "~prisma/client";
import { PrismaPg } from '@prisma/adapter-pg'
import { getDatabaseUrl } from "../db/database-url";

const adapter = new PrismaPg({ connectionString: getDatabaseUrl() })
const prisma = new PrismaClient({ adapter })

export async function listCandidates(/*{input contiene filtros}*/){
    console.log("antes de crear");
    console.log("DATABASE_URL:", getDatabaseUrl());
    try {
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
<<<<<<< HEAD
    */
  const candidates = await prisma.applicant.findMany({
    include: {
      role: {
        select: {
          name: true,
        },
      },
      tags: {
        select: {
          name: true,
          color: true,
        },
      },
      seniority: {
        select: {
          name: true,
          color: true,
        },
      },
      applications: {
        include: {
          jobOpening: {
            select: {
              name: true,
            },
          },
        },
      },
      area: {
        select: {
          name: true,
        },
      },
    },
    //agregar filtros a la consulta
  });
  return candidates;
}
=======
    console.log("antes de query");
    const candidates = await prisma.applicant.findMany({
        //agregar filtros a la consulta
    })
    return candidates;
}
>>>>>>> 9a3846b (prueba de agregar querie a DB y llamado trpc para consumir data)
