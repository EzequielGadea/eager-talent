import { z } from "zod";

import { EnglishLevel, Source } from "~/generated/prisma/enums";
import { protectedProcedure } from "~/server/api/trpc";

export const createApplicant = protectedProcedure
  .input(
    z.object({
        fullName: z.string().min(1),
        email: z.string().optional(), 
        phone: z.string().optional(),
        photo: z.string().optional(),
        country: z.string().optional(),
        linkedin: z.string().optional(),
        
        englishLevel: z.enum([
            EnglishLevel.Basic,
            EnglishLevel.Intermediate,
            EnglishLevel.Advanced,
            EnglishLevel.Native
        ]).optional(),

        source: z
            .enum([
            Source.LinkedIn,
            Source.Website,
            Source.Outbound,
            Source.Referral,
            Source.JobBoard,
            ])
            .optional(),

        hearAboutUs: z.string().optional(),
        title: z.string().optional(),
        academicInstitution: z.string().optional(),
        careerStartYear: z.number().optional(),
        careerEndYear: z.number().optional(),
        education: z.string().optional(),
        resume: z.string().optional(),

        roleId: z.string().optional(),
        areaId: z.string().optional(),
        seniorityId: z.string().optional(),
        tagIds: z.array(z.string()).default([])
        }),
    )
    .mutation(({ ctx, input }) => {
        return ctx.db.applicant.create({
            data: {
                name: input.fullName,
                lastName: input.fullName,
                email: input.email,
                phone: input.phone,
                photo: input.photo,
                country: input.country,
                linkedin: input.linkedin,
                englishLevel: input.englishLevel,
                source: input.source,
                hearAboutUs: input.hearAboutUs,
                title: input.title,
                academicInstitution: input.academicInstitution,
                careerStartYear: input.careerStartYear,
                careerEndYear: input.careerEndYear,
                education: input.education,
                resume: input.resume,
                
                role: {
                connect: {
                    id: input.roleId,
                },
                },

                area: input.areaId
                ? {
                    connect: {
                        id: input.areaId,
                    },
                    }
                : undefined,

                seniority: input.seniorityId
                ? {
                    connect: {
                        id: input.seniorityId,
                    },
                    }
                : undefined,

                tags: {
                connect: input.tagIds.map((id) => ({ id })),
                },




            }
        });
    });

/*

  model Applicant {
  id                  String        @id @default(cuid())
  name                String
  lastName            String        @map("last_name")
  email               String?       @unique
  phone               String?
  photo               String?
  country             String?
  linkedin            String?
  englishLevel        EnglishLevel? @map("english_level")
  source              Source?
  hearAboutUs         String?       @map("hear_about_us")
  title               String?
  academicInstitution String?       @map("academic_institution")
  careerStartYear     Int?          @map("career_start_year")
  careerEndYear       Int?          @map("career_end_year")
  education           String?
  resume              String?
  roleId              String        @map("role_id")
  areaId              String?       @map("area_id")
  seniorityId         String?       @map("seniority_id")

  role           Role           @relation(fields: [roleId], references: [id], onDelete: Restrict)
  area           Area?          @relation(fields: [areaId], references: [id], onDelete: Restrict)
  seniority      Seniority?     @relation(fields: [seniorityId], references: [id], onDelete: Restrict)
  tags           Tag[]
  hiringManagers User[]         @relation("ApplicantHiringManagers")
  applications   Application[]
  interviews     Interview[]
  activities     Activity[]
  note           ApplicantNote?

  @@index([roleId]) 
  @@index([areaId])
  @@index([seniorityId])
  @@index([source])
  @@map("applicant")
}

*/