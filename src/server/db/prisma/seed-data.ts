import { randomBytes } from "node:crypto";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { faker } from "@faker-js/faker";
import type {
  PrismaClient,
  EnglishLevel,
  Source,
  JobOpeningStatus,
  InterviewStatus,
  InterviewType,
  UserRole,
  UserStatus,
} from "~/generated/prisma/client";

const ADMIN_EMAIL = "admin@example.com";

function randomSubset<T>(arr: T[], min: number, max: number): T[] {
  const count = faker.number.int({ min, max: Math.min(max, arr.length) });
  return faker.helpers.arrayElements(arr, count);
}

export async function seedDatabase(prisma: PrismaClient): Promise<void> {

  // TEST ADMIN USER
  const existingAdmin = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  if (existingAdmin) {
    if (existingAdmin.role !== "Recruiter") {
      throw new Error(
        `Ya existe ${ADMIN_EMAIL} con otro rol.`,
      );
    }
    console.log(`El usuario de prueba ${ADMIN_EMAIL} ya existe; se conserva.`);
  } else {
    const seedAuth = betterAuth({
      baseURL: "http://localhost:3000",
      secret: randomBytes(32).toString("hex"),
      database: prismaAdapter(prisma, {
        provider: "postgresql",
        transaction: true,
      }),
      emailAndPassword: { enabled: true, autoSignIn: false },
      user: {
        additionalFields: {
          role: {
            type: ["Recruiter", "HiringManager"],
            defaultValue: "Recruiter",
            input: false,
          },
        },
      },
    });

    await seedAuth.api.signUpEmail({
      body: {
        name: "Admin de prueba",
        email: ADMIN_EMAIL,
        password: "admin123",
      },
    });
    console.log(`Usuario de prueba creado: ${ADMIN_EMAIL} (Recruiter).`);
  }


  //A PARTIR DE AQUI SE PUEDEN AGREGAR DATOS DE PRUEBA

  // ---------- LOOKUP TABLES ----------
  const roleNames = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "DevOps Engineer",
    "Data Scientist",
    "Product Manager",
    "QA Engineer",
    "UI/UX Designer",
  ];
  const roles = await Promise.all(
    roleNames.map((name) => prisma.role.create({ data: { name } })),
  );

  const areaNames = ["Engineering", "Product", "Design", "Data", "Sales", "Marketing"];
  const areas = await Promise.all(
    areaNames.map((name) => prisma.area.create({ data: { name } })),
  );

  const seniorityDefs = [
    { name: "Junior", order: 1, color: "#60A5FA" },
    { name: "Mid", order: 2, color: "#34D399" },
    { name: "Senior", order: 3, color: "#FBBF24" },
    { name: "Staff", order: 4, color: "#F87171" },
    { name: "Lead", order: 5, color: "#A78BFA" },
  ];
  const seniorities = await Promise.all(
    seniorityDefs.map((s) => prisma.seniority.create({ data: s })),
  );

  const skillTagNames = [
    "React", "Node.js", "TypeScript", "Python", "AWS",
    "Docker", "Kubernetes", "SQL", "GraphQL", "Figma",
  ];
  const otherTagNames = ["Remote", "Urgente", "Referido", "Top Candidate", "Follow Up"];
  const tags = await Promise.all([
    ...skillTagNames.map((name) =>
      prisma.tag.create({
        data: { name, isSkill: true, color: faker.color.rgb({ format: "hex" }) },
      }),
    ),
    ...otherTagNames.map((name) =>
      prisma.tag.create({
        data: { name, isSkill: false, color: faker.color.rgb({ format: "hex" }) },
      }),
    ),
  ]);

  // ---------- USERS (Recruiters / Hiring Managers) ----------
  const additionalUsersCount = 8;
  const users = [];
  for (let i = 0; i < additionalUsersCount; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const user = await prisma.user.create({
      data: {
        id: faker.string.uuid(),
        name: firstName,
        lastName,
        email: `${firstName}.${lastName}.${i}@example.com`.toLowerCase(),
        emailVerified: faker.datatype.boolean(),
        role: faker.helpers.arrayElement<UserRole>(["Recruiter", "HiringManager"]),
        status: faker.helpers.arrayElement<UserStatus>([
          "Active", "PendingInvitation", "Inactive",
        ]),
        lastAccess: faker.date.recent({ days: 30 }),
      },
    });
    users.push(user);
  }

  // ---------- APPLICANTS ----------
  const englishLevels: EnglishLevel[] = ["Basic", "Intermediate", "Advanced", "Native"];
  const sources: Source[] = ["Inbound", "Outbound", "Referido"];
  const applicantsCount = 40;
  const applicants = [];

  for (let i = 0; i < applicantsCount; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const role = faker.helpers.arrayElement(roles);
    const area = faker.helpers.arrayElement(areas);
    const seniority = faker.helpers.arrayElement(seniorities);
    const applicantTags = randomSubset(tags, 0, 4);
    const applicantHiringManagers = randomSubset(users, 0, 2);

    const applicant = await prisma.applicant.create({
      data: {
        name: firstName,
        lastName,
        email: faker.datatype.boolean({ probability: 0.85 })
          ? `${firstName}.${lastName}.${i}@applicant-example.com`.toLowerCase()
          : null,
        phone: faker.phone.number(),
        photo: faker.datatype.boolean({ probability: 0.5 }) ? faker.image.avatar() : null,
        country: faker.location.country(),
        linkedin: faker.datatype.boolean({ probability: 0.7 })
          ? `https://linkedin.com/in/${firstName}-${lastName}-${i}`.toLowerCase()
          : null,
        englishLevel: faker.helpers.arrayElement(englishLevels),
        source: faker.helpers.arrayElement(sources),
        hearAboutUs: faker.lorem.sentence(),
        title: faker.person.jobTitle(),
        academicInstitution: `${faker.company.name()} University`,
        careerStartYear: faker.number.int({ min: 2005, max: 2020 }),
        careerEndYear: faker.datatype.boolean({ probability: 0.2 })
          ? faker.number.int({ min: 2021, max: 2024 })
          : null,
        education: faker.lorem.sentence(),
        resume: faker.internet.url(),
        roleId: role.id,
        areaId: area.id,
        seniorityId: seniority.id,
        tags: { connect: applicantTags.map((t) => ({ id: t.id })) },
        hiringManagers: { connect: applicantHiringManagers.map((u) => ({ id: u.id })) },
      },
    });
    applicants.push(applicant);
  }

  // ---------- JOB OPENINGS ----------
  const jobOpeningStatuses: JobOpeningStatus[] = ["Open", "Paused", "Closed", "Cancelled"];
  const jobOpeningsCount = 12;
  const jobOpenings = [];

  for (let i = 0; i < jobOpeningsCount; i++) {
    const area = faker.helpers.arrayElement(areas);
    const openingDate = faker.date.past({ years: 1 });
    const targetClosingDate = faker.date.soon({ days: 60, refDate: openingDate });
    const status = faker.helpers.arrayElement(jobOpeningStatuses);
    const jobSeniorities = randomSubset(seniorities, 1, 3);
    const jobHiringManagers = randomSubset(users, 1, 3);

    const jobOpening = await prisma.jobOpening.create({
      data: {
        name: `${faker.person.jobTitle()} - ${area.name}`,
        status,
        stages: [{ name: "Screening" }, { name: "Interview" }, { name: "Offer" }],
        location: `${faker.location.city()}, ${faker.location.country()}`,
        openingDate,
        targetClosingDate,
        closingDate:
          status === "Closed"
            ? faker.date.between({ from: targetClosingDate, to: new Date() })
            : null,
        areaId: area.id,
        seniorities: { connect: jobSeniorities.map((s) => ({ id: s.id })) },
        hiringManagers: { connect: jobHiringManagers.map((u) => ({ id: u.id })) },
      },
    });
    jobOpenings.push(jobOpening);
  }

  // ---------- APPLICATIONS ----------
  const stagesPool = ["Screening", "Phone Interview", "Technical Interview", "Onsite", "Offer", "Hired"];
  const applications = [];

  for (const applicant of applicants) {
    const numApplications = faker.number.int({ min: 0, max: 3 });
    const chosenJobOpenings = randomSubset(jobOpenings, numApplications, numApplications);

    for (const jobOpening of chosenJobOpenings) {
      const active = faker.datatype.boolean({ probability: 0.7 });

      const applicationDate = faker.date.recent({ days: 90 });
      const stageEntryDate = faker.date.between({
        from: applicationDate,
        to: new Date(),
      });
      const disqualificationDate = active
        ? null
        : faker.date.between({ from: stageEntryDate, to: new Date() });

      const application = await prisma.application.create({
        data: {
          applicantId: applicant.id,
          jobOpeningId: jobOpening.id,
          applicationDate,
          active,
          currentStage: faker.helpers.arrayElement(stagesPool),
          stageEntryDate,
          disqualificationDate,
          disqualificationReason: active ? null : faker.lorem.sentence(),
          desiredSalary: `$${faker.number.int({ min: 2000, max: 8000 })}`,
          availability: faker.helpers.arrayElement([
            "Inmediata", "2 semanas de aviso", "1 mes de aviso",
          ]),
        },
      });
      applications.push(application);
    }
  }

  // ---------- INTERVIEWS ----------
  const interviewTypes: InterviewType[] = ["VideoCall", "InPerson"];
  const interviewStatuses: InterviewStatus[] = ["Completed", "Scheduled", "Pending"];
  const interviews = [];

  for (const application of applications) {
    const numInterviews = faker.number.int({ min: 0, max: 2 });
    for (let i = 0; i < numInterviews; i++) {
      const status = faker.helpers.arrayElement(interviewStatuses);
      const interviewers = randomSubset(users, 1, 2);

      const interview = await prisma.interview.create({
        data: {
          name: faker.helpers.arrayElement([
            "Technical Screening", "Culture Fit", "System Design", "HR Interview",
          ]),
          duration: faker.helpers.arrayElement([30, 45, 60, 90]),
          modality: faker.helpers.arrayElement(interviewTypes),
          date: status === "Pending" ? null : faker.date.soon({ days: 20 }),
          status,
          summary: status === "Completed" ? faker.lorem.paragraph() : null,
          applicantId: application.applicantId,
          jobOpeningId: application.jobOpeningId,
          interviewers: { connect: interviewers.map((u) => ({ id: u.id })) },
        },
      });
      interviews.push(interview);
    }
  }

  // Entrevistas exploratorias, sin job opening asociado
  const exploratoryCount = 5;
  for (let i = 0; i < exploratoryCount; i++) {
    const applicant = faker.helpers.arrayElement(applicants);
    const interviewers = randomSubset(users, 1, 2);

    const interview = await prisma.interview.create({
      data: {
        name: "Exploratory Interview",
        duration: 30,
        modality: faker.helpers.arrayElement(interviewTypes),
        date: faker.date.recent({ days: 10 }),
        status: "Completed",
        summary: faker.lorem.paragraph(),
        applicantId: applicant.id,
        jobOpeningId: null,
        interviewers: { connect: interviewers.map((u) => ({ id: u.id })) },
      },
    });
    interviews.push(interview);
  }

  // ---------- NOTES ----------
  for (const applicant of applicants) {
    if (faker.datatype.boolean({ probability: 0.6 })) {
      const author = faker.helpers.arrayElement(users);
      await prisma.applicantNote.create({
        data: {
          content: faker.lorem.paragraph(),
          applicantId: applicant.id,
          lastModifiedById: author.id,
        },
      });
    }
  }

  for (const interview of interviews) {
    if (faker.datatype.boolean({ probability: 0.5 })) {
      const author = faker.helpers.arrayElement(users);
      await prisma.interviewNote.create({
        data: {
          content: faker.lorem.paragraph(),
          interviewId: interview.id,
          lastModifiedById: author.id,
        },
      });
    }
  }

  // ---------- ACTIVITIES ----------
  const activityDescriptions = [
    "Aplicación recibida",
    "CV revisado",
    "Entrevista programada",
    "Feedback enviado",
    "Oferta enviada",
    "Llamada de seguimiento realizada",
  ];

  for (const applicant of applicants) {
    const applicantApplications = applications.filter((a) => a.applicantId === applicant.id);
    const numActivities = faker.number.int({ min: 1, max: 4 });

    for (let i = 0; i < numActivities; i++) {
      const linkedApplication =
        applicantApplications.length > 0 && faker.datatype.boolean({ probability: 0.7 })
          ? faker.helpers.arrayElement(applicantApplications)
          : null;

      await prisma.activity.create({
        data: {
          description: faker.helpers.arrayElement(activityDescriptions),
          date: faker.date.recent({ days: 60 }),
          applicantId: applicant.id,
          jobOpeningId: linkedApplication ? linkedApplication.jobOpeningId : null,
        },
      });
    }
  }

  // ---------- INVITATIONS ----------
  const invitationCount = 5;
  for (let i = 0; i < invitationCount; i++) {
    const sender = faker.helpers.arrayElement(users);
    let recipient = faker.helpers.arrayElement(users);
    while (recipient.id === sender.id) {
      recipient = faker.helpers.arrayElement(users);
    }
    const sentDate = faker.date.recent({ days: 20 });

    await prisma.invitation.create({
      data: {
        token: faker.string.uuid(),
        sentDate,
        expirationDate: faker.date.soon({ days: 7, refDate: sentDate }),
        senderId: sender.id,
        recipientId: recipient.id,
      },
    });
  }

  // ---------- PUBLIC LINKS ----------
  const publicLinkTarget = Math.min(8, applications.length);
  const applicationsForLinks = randomSubset(applications, publicLinkTarget, publicLinkTarget);

  for (const application of applicationsForLinks) {
    const creator = faker.helpers.arrayElement(users);
    await prisma.publicLink.create({
      data: {
        name: `Link público - ${faker.lorem.words(2)}`,
        token: faker.string.uuid(),
        includeSalary: faker.datatype.boolean({ probability: 0.3 }),
        creationDate: faker.date.recent({ days: 10 }),
        expirationDate: faker.date.soon({ days: 15 }),
        createdById: creator.id,
        applicantId: application.applicantId,
        jobOpeningId: application.jobOpeningId,
      },
    });
  }

  console.log(
    `Seed completo: ${roles.length} roles, ${areas.length} áreas, ${seniorities.length} senioridades, ${tags.length} tags, ${users.length} usuarios, ${applicants.length} applicants, ${jobOpenings.length} job openings, ${applications.length} applications, ${interviews.length} entrevistas.`,
  );
}
