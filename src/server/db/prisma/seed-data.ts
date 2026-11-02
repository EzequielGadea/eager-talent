import { randomBytes } from "node:crypto";
import { betterAuth } from "better-auth";
import { admin, organization } from "better-auth/plugins";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { faker } from "@faker-js/faker";
import { TZDate } from "@date-fns/tz";
import {
  addDays,
  format,
  startOfMonth,
  startOfQuarter,
  startOfYear,
  subDays,
} from "date-fns";
import { getTagColor } from "~/lib/tags/get-tag-color";
import type {
  PrismaClient,
  EnglishLevel,
  Source,
  HearAboutUs,
  JobOpeningStatus,
  InterviewStatus,
  InterviewType,
} from "~/generated/prisma/client";

const ORGANIZATION_NAME = "EagerWorks";
const ORGANIZATION_SLUG = "eagerworks";

// ============================================================================
// Seed accounts: 3 recruiters and 5 hiring managers.
// ============================================================================
export const SEED_USERS = [
  // 3 Recruiters (Contraseña: admin123)
  {
    name: "Marcelo",
    lastName: "Bielsa",
    email: "admin@example.com",
    password: "admin123",
    orgRole: "owner",
  },
  {
    name: "Diego",
    lastName: "Aguirre",
    email: "admin2@example.com",
    password: "admin123",
    orgRole: "recruiter",
  },
  {
    name: "Óscar",
    lastName: "Tabárez",
    email: "admin3@example.com",
    password: "admin123",
    orgRole: "recruiter",
  },
  // 3 Hiring Managers / HR (Contraseña: hiring.manager)
  {
    name: "Mauricio",
    lastName: "Larriera",
    email: "hiring.manager@example.com",
    password: "hiring.manager",
    orgRole: "hiringManager",
  },
  {
    name: "Diego",
    lastName: "Alonso",
    email: "hiring.manager2@example.com",
    password: "hiring.manager",
    orgRole: "hiringManager",
  },
  {
    name: "Jorge",
    lastName: "Bava",
    email: "hiring.manager3@example.com",
    password: "hiring.manager",
    orgRole: "hiringManager",
  },
  {
    name: "Pep",
    lastName: "Guardiola",
    email: "hiring.manager4@example.com",
    password: "hiring.manager",
    orgRole: "hiringManager",
  },
  {
    name: "Hansi",
    lastName: "Flick",
    email: "hiring.manager5@example.com",
    password: "hiring.manager",
    orgRole: "hiringManager",
  },
];

function getSeedAuth(prisma: PrismaClient) {
  return betterAuth({
    baseURL: "http://localhost:3000",
    secret: randomBytes(32).toString("hex"),
    database: prismaAdapter(prisma, {
      provider: "postgresql",
      transaction: true,
    }),
    emailAndPassword: { enabled: true, autoSignIn: false },
    plugins: [organization(), admin()],
  });
}

export async function seedDatabase(prisma: PrismaClient): Promise<void> {
  const seedNow = new Date();
  const auth = getSeedAuth(prisma);
  // ==========================================================================
  // GESTIÓN DE USUARIOS CON BETTER-AUTH (IDEMPOTENCIA)
  // ==========================================================================
  const seedEmails = SEED_USERS.map((u) => u.email);

  for (const userDef of SEED_USERS) {
    const existing = await prisma.user.findUnique({
      where: { email: userDef.email },
    });

    if (!existing) {
      await auth.api.createUser({
        body: {
          name: `${userDef.name} ${userDef.lastName}`,
          email: userDef.email,
          password: userDef.password,
          role:
            userDef.orgRole === "owner" || userDef.orgRole === "recruiter"
              ? "admin"
              : "user",
        },
      });

      await prisma.user.update({
        where: { email: userDef.email },
        data: {
          name: userDef.name,
          lastName: userDef.lastName,
          emailVerified: true,
        },
      });

      console.log(
        `Usuario creado: ${userDef.email} (${userDef.name} ${userDef.lastName})`,
      );
    } else {
      await prisma.user.update({
        where: { email: userDef.email },
        data: {
          name: userDef.name,
          lastName: userDef.lastName,
          emailVerified: true,
        },
      });
      console.log(
        `Usuario conservado/actualizado: ${userDef.email} (${userDef.name} ${userDef.lastName})`,
      );
    }
  }

  // ==========================================================================
  // ORGANIZACIÓN EAGERWORKS Y MEMBRESÍAS
  // ==========================================================================
  let eagerWorks = await prisma.organization.findUnique({
    where: { slug: ORGANIZATION_SLUG },
  });
  if (!eagerWorks) {
    const admin = await prisma.user.findUniqueOrThrow({
      where: { email: "admin@example.com" },
    });

    await auth.api.createOrganization({
      body: {
        name: ORGANIZATION_NAME,
        slug: ORGANIZATION_SLUG,
        userId: admin.id,
      },
    });
    console.log(`Organización creada: ${ORGANIZATION_NAME}.`);
    eagerWorks = await prisma.organization.findUniqueOrThrow({
      where: { slug: ORGANIZATION_SLUG },
    });
  } else {
    console.log(`La organización ${ORGANIZATION_NAME} ya existe; se conserva.`);
  }

  for (const userDef of SEED_USERS) {
    const user = await prisma.user.findUniqueOrThrow({
      where: { email: userDef.email },
    });
    const existingMember = await prisma.member.findUnique({
      where: {
        organizationId_userId: {
          organizationId: eagerWorks.id,
          userId: user.id,
        },
      },
    });

    if (existingMember) {
      await prisma.member.update({
        where: { id: existingMember.id },
        data: { role: userDef.orgRole },
      });
    } else {
      await prisma.member.create({
        data: {
          id: faker.string.uuid(),
          organizationId: eagerWorks.id,
          userId: user.id,
          role: userDef.orgRole,
          createdAt: new Date(),
        },
      });
    }
  }

  // ==========================================================================
  // Replace application data, preserving the eight seed accounts.
  // ==========================================================================
  await prisma.$transaction([
    prisma.publicLink.deleteMany(),
    prisma.invitation.deleteMany(),
    prisma.activity.deleteMany(),
    prisma.interviewNote.deleteMany(),
    prisma.interviewAssignment.deleteMany(),
    prisma.applicantNote.deleteMany(),
    prisma.interview.deleteMany(),
    prisma.application.deleteMany(),
    prisma.disqualificationMotive.deleteMany(),
    prisma.applicantHiringManager.deleteMany(),
    prisma.applicant.deleteMany(),
    prisma.jobOpening.deleteMany(),
    prisma.tag.deleteMany(),
    prisma.seniority.deleteMany(),
    prisma.area.deleteMany(),
    prisma.jobRole.deleteMany(),
    prisma.stageTemplate.deleteMany(),
    prisma.user.deleteMany({
      where: {
        email: { notIn: seedEmails },
      },
    }),
  ]);

  // Recuperar entidades de usuarios autenticados
  const dbUsers = await prisma.user.findMany({
    where: { email: { in: seedEmails } },
  });

  const admin1 = dbUsers.find((u) => u.email === "admin@example.com")!;
  const admin2 = dbUsers.find((u) => u.email === "admin2@example.com")!;
  dbUsers.find((u) => u.email === "admin3@example.com")!;
  const hm1 = dbUsers.find((u) => u.email === "hiring.manager@example.com")!;
  const hm2 = dbUsers.find((u) => u.email === "hiring.manager2@example.com")!;
  const hm3 = dbUsers.find((u) => u.email === "hiring.manager3@example.com")!;
  const hm4 = dbUsers.find((u) => u.email === "hiring.manager4@example.com")!;
  const hm5 = dbUsers.find((u) => u.email === "hiring.manager5@example.com")!;

  // ==========================================================================
  // TABLAS MAESTRAS (CONTEXTO REAL EAGERWORKS MONTEVIDEO)
  // ==========================================================================

  // ÁREAS DE EAGERWORKS
  const areaDefs = [
    "Ingeniería Web & Mobile",
    "AI Studio & Data",
    "Infraestructura Cloud & DevOps",
    "Quality Assurance & Testing",
    "Diseño de Producto & UX",
  ];
  const areas: Record<string, { id: string; name: string }> = {};
  for (const name of areaDefs) {
    const a = await prisma.area.create({ data: { name } });
    areas[name] = a;
  }

  // ROLES DE IT EN EAGERWORKS
  const roleDefs = [
    "Full Stack Developer (Ruby on Rails & React)",
    "Backend Developer (Ruby on Rails)",
    "Frontend Developer (React / Next.js)",
    "Mobile Developer (React Native)",
    "AI / Machine Learning Engineer",
    "DevOps & Cloud Engineer (AWS)",
    "QA Automation Engineer",
    "Tech Lead / Solutions Architect",
    "Product Designer (UI/UX)",
  ];
  const roles: Record<string, { id: string; name: string }> = {};
  for (const name of roleDefs) {
    const r = await prisma.jobRole.create({ data: { name } });
    roles[name] = r;
  }

  // SENIORITIES
  const seniorityDefs = [
    { name: "Junior", order: 1, color: "#60A5FA" },
    { name: "Semi Senior", order: 2, color: "#34D399" },
    { name: "Senior", order: 3, color: "#FBBF24" },
    { name: "Staff / Lead", order: 4, color: "#F87171" },
  ];
  const seniorities: Record<string, { id: string; name: string }> = {};
  for (const s of seniorityDefs) {
    const rec = await prisma.seniority.create({ data: s });
    seniorities[s.name] = rec;
  }

  // ETIQUETAS TÉCNICAS (STACK EAGERWORKS) Y DE GESTIÓN
  const skillTagDefs = [
    { name: "Ruby on Rails", color: getTagColor("Ruby on Rails") },
    { name: "React", color: getTagColor("React") },
    { name: "Next.js", color: getTagColor("Next.js") },
    { name: "TypeScript", color: getTagColor("TypeScript") },
    { name: "React Native", color: getTagColor("React Native") },
    { name: "Node.js", color: getTagColor("Node.js") },
    { name: "Python", color: getTagColor("Python") },
    { name: "PostgreSQL", color: getTagColor("PostgreSQL") },
    { name: "Docker", color: getTagColor("Docker") },
    { name: "AWS", color: getTagColor("AWS") },
    { name: "Redis", color: getTagColor("Redis") },
    { name: "GraphQL", color: getTagColor("GraphQL") },
    { name: "Tailwind CSS", color: getTagColor("Tailwind CSS") },
  ];
  const otherTagDefs = [
    {
      name: "Híbrido Montevideo (Cordón)",
      color: getTagColor("Híbrido Montevideo (Cordón)"),
    },
    { name: "Remoto Uruguay", color: getTagColor("Remoto Uruguay") },
    { name: "Inglés C1 / Fluido", color: getTagColor("Inglés C1 / Fluido") },
    {
      name: "Inglés C2 / Bilingüe",
      color: getTagColor("Inglés C2 / Bilingüe"),
    },
    { name: "Top Talent", color: getTagColor("Top Talent") },
    { name: "Referido Eagerworks", color: getTagColor("Referido Eagerworks") },
    {
      name: "Disponible Inmediato",
      color: getTagColor("Disponible Inmediato"),
    },
  ];

  const tags: Record<string, { id: string; name: string }> = {};
  for (const t of skillTagDefs) {
    const created = await prisma.tag.create({
      data: { name: t.name, isSkill: true, color: t.color },
    });
    tags[t.name] = created;
  }
  for (const t of otherTagDefs) {
    const created = await prisma.tag.create({
      data: { name: t.name, isSkill: false, color: t.color },
    });
    tags[t.name] = created;
  }

  const disqualificationMotiveDefs = [
    "Falta de experiencia",
    "Expectativa salarial",
    "Inglés insuficiente",
    "Perfil no alineado con la vacante",
    "No responde",
    "Rechazó la propuesta",
  ];

  const disqualificationMotives = [];
  for (const name of disqualificationMotiveDefs) {
    const motive = await prisma.disqualificationMotive.create({
      data: { name },
    });
    disqualificationMotives.push(motive);
  }

  // ==========================================================================
  // VACANTES / JOB OPENINGS DE EAGERWORKS
  // ==========================================================================
  const defaultStages = [
    {
      key: "24534",
      name: "Aplicado",
      type: "Ninguna",
      color: "#94a3b8",
      label: "Aplicó",
    },
    {
      key: "55678",
      name: "Entrevista HR",
      type: "Entrevista",
      color: "#3c73ed",
      label: "Entrevista HR",
    },
    {
      key: "61245",
      name: "Psicotécnico",
      type: "Entrevista",
      color: "#f59e0b",
      label: "Psicotécnico",
    },
    {
      key: "75365",
      name: "Revisión de perfil",
      type: "Ninguna",
      color: "#8b5cf6",
      label: "En revisión",
    },
    {
      key: "83412",
      name: "Entrevista técnica",
      type: "Entrevista",
      color: "#0284c7",
      label: "Entrevista técnica",
    },
    {
      key: "92156",
      name: "Oferta",
      type: "Oferta",
      color: "#10b981",
      label: "Ofertado",
    },
    {
      key: "98721",
      name: "Contratado/a",
      type: "Contratado",
      color: "#059669",
      label: "Contratado",
    },
  ];

  const stageKey = (name: string) => {
    const stage = defaultStages.find((candidate) => candidate.name === name);

    if (!stage) {
      throw new Error(`Seed stage not found: ${name}`);
    }

    return stage.key;
  };

  await prisma.stageTemplate.create({
    data: {
      stages: defaultStages,
      lastModified: new Date(),
    },
  });

  const nowInUruguay = new TZDate(seedNow, "America/Montevideo");
  // Vacancy dates represent calendar days in UTC; interviews are local instants.
  const seedDateFromToday = (daysOffset: number) =>
    new Date(
      Date.UTC(
        nowInUruguay.getFullYear(),
        nowInUruguay.getMonth(),
        nowInUruguay.getDate() + daysOffset,
      ),
    );

  const jobOpening1 = await prisma.jobOpening.create({
    data: {
      name: "Senior Full Stack Developer (Rails & React) - US Partner",
      status: "Open" as JobOpeningStatus,
      hasBeenOpened: true,
      stages: defaultStages,
      location: "Montevideo, Uruguay (Híbrido Cordón / Remoto)",
      openingDate: seedDateFromToday(-45),
      targetClosingDate: seedDateFromToday(-7),
      areaId: areas["Ingeniería Web & Mobile"].id,
      seniorities: { connect: [{ id: seniorities["Senior"].id }] },
      hiringManagers: { connect: [{ id: hm1.id }, { id: hm2.id }] },
    },
  });

  const jobOpening2 = await prisma.jobOpening.create({
    data: {
      name: "Backend Developer (Ruby on Rails) - Fintech Startup",
      status: "Open" as JobOpeningStatus,
      hasBeenOpened: true,
      stages: defaultStages,
      location: "Remoto (Uruguay)",
      openingDate: seedDateFromToday(-20),
      targetClosingDate: seedDateFromToday(0),
      areaId: areas["Ingeniería Web & Mobile"].id,
      seniorities: {
        connect: [
          { id: seniorities["Semi Senior"].id },
          { id: seniorities["Senior"].id },
        ],
      },
      hiringManagers: { connect: [{ id: hm1.id }] },
    },
  });

  const jobOpening3 = await prisma.jobOpening.create({
    data: {
      name: "QA Automation Engineer - HealthTech Platform",
      status: "Open" as JobOpeningStatus,
      hasBeenOpened: true,
      stages: defaultStages,
      location: "Montevideo, Uruguay (Híbrido)",
      openingDate: seedDateFromToday(-15),
      targetClosingDate: seedDateFromToday(45),
      areaId: areas["Quality Assurance & Testing"].id,
      seniorities: { connect: [{ id: seniorities["Semi Senior"].id }] },
      hiringManagers: { connect: [{ id: hm2.id }] },
    },
  });

  const jobOpening4 = await prisma.jobOpening.create({
    data: {
      name: "DevOps & Cloud Engineer (AWS) - Cloud Infrastructure",
      status: "Open" as JobOpeningStatus,
      hasBeenOpened: true,
      stages: defaultStages,
      location: "Remoto (Uruguay)",
      openingDate: seedDateFromToday(-10),
      targetClosingDate: seedDateFromToday(-2),
      areaId: areas["Infraestructura Cloud & DevOps"].id,
      seniorities: { connect: [{ id: seniorities["Senior"].id }] },
      hiringManagers: { connect: [{ id: hm3.id }, { id: hm5.id }] },
    },
  });

  const jobOpening5 = await prisma.jobOpening.create({
    data: {
      name: "Frontend Developer (React / Next.js) - E-Commerce Platform",
      status: "Open" as JobOpeningStatus,
      hasBeenOpened: true,
      stages: defaultStages,
      location: "Montevideo, Uruguay (Híbrido Cordón)",
      openingDate: seedDateFromToday(-18),
      targetClosingDate: seedDateFromToday(35),
      areaId: areas["Ingeniería Web & Mobile"].id,
      seniorities: { connect: [{ id: seniorities["Semi Senior"].id }] },
      hiringManagers: { connect: [{ id: hm1.id }, { id: hm4.id }] },
    },
  });

  const jobOpening6 = await prisma.jobOpening.create({
    data: {
      name: "AI Solutions & Full Stack Engineer (Python & React) - GenAI Studio",
      status: "Open" as JobOpeningStatus,
      hasBeenOpened: true,
      stages: defaultStages,
      location: "Montevideo, Uruguay (Híbrido Cordón / Remoto)",
      openingDate: seedDateFromToday(-5),
      targetClosingDate: seedDateFromToday(40),
      areaId: areas["AI Studio & Data"].id,
      seniorities: {
        connect: [
          { id: seniorities["Semi Senior"].id },
          { id: seniorities["Senior"].id },
        ],
      },
      hiringManagers: { connect: [{ id: hm4.id }, { id: hm5.id }] },
    },
  });

  const jobOpening7 = await prisma.jobOpening.create({
    data: {
      name: "Mobile Developer (React Native) - EagerWorks Delivery",
      status: "Open",
      hasBeenOpened: true,
      stages: defaultStages,
      location: "Montevideo, Uruguay (Híbrido Cordón)",
      openingDate: seedDateFromToday(0),
      targetClosingDate: seedDateFromToday(21),
      areaId: areas["Ingeniería Web & Mobile"].id,
      seniorities: { connect: [{ id: seniorities["Semi Senior"].id }] },
      hiringManagers: { connect: [{ id: hm1.id }, { id: hm4.id }] },
    },
  });

  const today = new TZDate(seedDateFromToday(0), "UTC");
  const previousMonthEnd = subDays(startOfMonth(today), 1);
  const previousQuarterEnd = subDays(startOfQuarter(today), 1);
  const previousSemesterEnd = new Date(
    Date.UTC(today.getFullYear(), today.getMonth() < 6 ? 0 : 6, 0),
  );
  const previousYearEnd = subDays(startOfYear(today), 1);
  // Seven closures today keep the default month populated even on its first day.
  // Extra closures cover every previous period without scheduling future closes.
  const closedOpeningDefs = [
    {
      name: "Senior Node.js Developer",
      area: areaDefs[0],
      duration: 24,
      deviation: 10,
      closing: today,
    },
    {
      name: "Product Manager",
      area: areaDefs[4],
      duration: 30,
      deviation: 6,
      closing: today,
    },
    {
      name: "UX Designer Senior",
      area: areaDefs[4],
      duration: 18,
      deviation: 4,
      closing: today,
    },
    {
      name: "QA Engineer",
      area: areaDefs[3],
      duration: 21,
      deviation: -5,
      closing: today,
    },
    {
      name: "AI Developer",
      area: areaDefs[1],
      duration: 35,
      deviation: -5,
      closing: today,
    },
    {
      name: "Cloud Security Engineer",
      area: areaDefs[2],
      duration: 28,
      deviation: 0,
      closing: today,
    },
    {
      name: "Data Analyst",
      area: areaDefs[1],
      duration: 40,
      deviation: 5,
      closing: today,
    },
    {
      name: "React Native Developer - Delivery anterior",
      area: areaDefs[0],
      duration: 33,
      deviation: -3,
      closing: previousMonthEnd,
    },
    {
      name: "QA Automation Engineer - Partner anterior",
      area: areaDefs[3],
      duration: 40,
      deviation: 8,
      closing: previousQuarterEnd,
    },
    {
      name: "Data Engineer - Analytics anterior",
      area: areaDefs[1],
      duration: 36,
      deviation: -4,
      closing: previousSemesterEnd,
    },
    {
      name: "Product Designer - Discovery anterior",
      area: areaDefs[4],
      duration: 25,
      deviation: 0,
      closing: previousYearEnd,
    },
  ];
  const closedOpenings = [];
  for (const definition of closedOpeningDefs) {
    const opening = await prisma.jobOpening.create({
      data: {
        name: definition.name,
        status: "Closed",
        hasBeenOpened: true,
        stages: defaultStages,
        location: "Montevideo, Uruguay (Híbrido / Remoto)",
        openingDate: subDays(definition.closing, definition.duration),
        targetClosingDate: subDays(definition.closing, definition.deviation),
        closingDate: definition.closing,
        areaId: areas[definition.area].id,
        seniorities: { connect: [{ id: seniorities["Senior"].id }] },
        hiringManagers: { connect: [{ id: hm1.id }] },
      },
    });
    closedOpenings.push(opening);
  }

  for (const status of ["Paused", "Cancelled"] as const) {
    await prisma.jobOpening.create({
      data: {
        name:
          status === "Paused"
            ? "QA Automation Engineer - Proyecto en pausa"
            : "Product Designer - Proyecto cancelado",
        status,
        hasBeenOpened: true,
        stages: defaultStages,
        location: "Remoto (Uruguay)",
        openingDate: seedDateFromToday(-14),
        targetClosingDate: seedDateFromToday(14),
        areaId: areas[status === "Paused" ? areaDefs[3] : areaDefs[4]].id,
        hiringManagers: { connect: [{ id: hm2.id }] },
      },
    });
  }

  // ==========================================================================
  // CANDIDATOS FIJOS (SELECCIÓN URUGUAYA USA 2026 CON FOTOS Y PDFS REALES)
  // ==========================================================================

  // --- CANDIDATO 1: FEDERICO VALVERDE ---
  // Casos de prueba: CP-001 (datos completos), CP-002 (filtro postulaciones), CP-008 (paginación 14 actividades)
  const federico = await prisma.applicant.create({
    data: {
      name: "Federico",
      lastName: "Valverde",
      email: "federico.valverde@eagerworks.uy",
      phone: "+598 99 150 815",
      photo:
        "https://utfs.io/f/hR8lYSLGKWImJt88e7duWENHGaTLgeYFv7r2dZABOCXKpxQ3",
      country: "Uruguay",
      linkedin: "https://www.linkedin.com/in/federico-valverde-uy/",
      englishLevel: "Advanced" as EnglishLevel,
      source: "Inbound" as Source,
      hearAboutUs: "LinkedInJobs" as HearAboutUs,
      title: "Ingeniería en Computación",
      academicInstitution: "Universidad de la República (FING)",
      careerStartYear: 2016,
      careerEndYear: 2021,
      education:
        "https://utfs.io/f/hR8lYSLGKWIm8zTkVAHLwUYeOQ6Wv9AgquNjF75tzrZyiHn2",
      resume:
        "https://utfs.io/f/hR8lYSLGKWImSKkk47JEcMHrwDYklgLhf8q64zJvpFdxWQbK",
      roleId: roles["Full Stack Developer (Ruby on Rails & React)"].id,
      areaId: areas["Ingeniería Web & Mobile"].id,
      seniorityId: seniorities["Senior"].id,
      tags: {
        connect: [
          { id: tags["Ruby on Rails"].id },
          { id: tags["React"].id },
          { id: tags["TypeScript"].id },
          { id: tags["PostgreSQL"].id },
          { id: tags["Top Talent"].id },
          { id: tags["Inglés C1 / Fluido"].id },
        ],
      },
    },
  });

  await prisma.applicantHiringManager.create({
    data: {
      applicantId: federico.id,
      hiringManagerId: hm1.id,
      sharedByUserId: admin1.id,
    },
  });

  await prisma.application.create({
    data: {
      applicantId: federico.id,
      jobOpeningId: jobOpening1.id,
      applicationDate: new Date(seedNow.getTime() - 28 * 24 * 60 * 60 * 1000),
      active: true,
      currentStageId: stageKey("Entrevista técnica"),
      stageEntryDate: new Date(seedNow.getTime() - 10 * 24 * 60 * 60 * 1000),
      desiredSalaryAmount: 4500,
      desiredSalaryCurrency: "USD",
      availability: "Inmediata",
    },
  });

  await prisma.application.create({
    data: {
      applicantId: federico.id,
      jobOpeningId: jobOpening2.id,
      applicationDate: new Date(seedNow.getTime() - 16 * 24 * 60 * 60 * 1000),
      active: true,
      currentStageId: stageKey("Aplicado"),
      stageEntryDate: new Date(seedNow.getTime() - 16 * 24 * 60 * 60 * 1000),
      desiredSalaryAmount: 4200,
      desiredSalaryCurrency: "USD",
      availability: "2 semanas de aviso",
    },
  });

  // Fecha de la entrevista de Valverde: se usa en la entrevista y en su Activity
  // para que el log muestre exactamente la misma fecha y hora.
  const fedeInterviewDate = new Date(
    seedNow.getTime() - 11 * 24 * 60 * 60 * 1000,
  );
  const fedeInterviewDateLabel = format(
    new TZDate(fedeInterviewDate, "America/Montevideo"),
    "dd/MM/yyyy 'a las' HH:mm",
  );

  // 14 Actividades para Valverde (permite verificar páginas 1, 2 y 3 con 6 ítems por página - CP-008)
  // Ordenadas de la más antigua a la más reciente: las del mismo día se crean
  // en este orden, así "agregó el candidato" queda después de "creó el candidato".
  const fedeActivities = [
    {
      desc: "creó el candidato",
      daysAgo: 28,
      jobOp: null,
    },
    {
      desc: `agregó el candidato a "${jobOpening1.name}"`,
      daysAgo: 28,
      jobOp: jobOpening1.id,
    },
    {
      desc: "creó una nota del candidato",
      daysAgo: 26,
      jobOp: null,
    },
    {
      desc: 'movió la postulación de "Aplicado" a "Entrevista HR"',
      daysAgo: 25,
      jobOp: jobOpening1.id,
    },
    {
      desc: 'movió la postulación de "Entrevista HR" a "Psicotécnico"',
      daysAgo: 22,
      jobOp: jobOpening1.id,
    },
    {
      desc: "actualizó los datos del candidato",
      daysAgo: 21,
      jobOp: null,
    },
    {
      desc: "actualizó los datos del candidato",
      daysAgo: 20,
      jobOp: null,
    },
    {
      desc: `agregó el candidato a "${jobOpening2.name}"`,
      daysAgo: 16,
      jobOp: jobOpening2.id,
    },
    {
      desc: "actualizó los datos del candidato",
      daysAgo: 15,
      jobOp: null,
    },
    {
      desc: `agendó la entrevista "Entrevista técnica" el ${fedeInterviewDateLabel}`,
      daysAgo: 14,
      jobOp: jobOpening1.id,
    },
    {
      desc: 'movió la postulación de "Psicotécnico" a "Revisión de perfil"',
      daysAgo: 12,
      jobOp: jobOpening1.id,
    },
    {
      desc: 'movió la postulación de "Revisión de perfil" a "Entrevista técnica"',
      daysAgo: 10,
      jobOp: jobOpening1.id,
    },
    {
      desc: "actualizó los datos del candidato",
      daysAgo: 4,
      jobOp: null,
    },
    {
      desc: "actualizó los datos del candidato",
      daysAgo: 2,
      jobOp: null,
    },
  ];

  for (const act of fedeActivities) {
    await prisma.activity.create({
      data: {
        applicantId: federico.id,
        createdById: admin1.id,
        jobOpeningId: act.jobOp,
        description: act.desc,
        date: new Date(seedNow.getTime() - act.daysAgo * 24 * 60 * 60 * 1000),
      },
    });
  }

  // --- CANDIDATO 2: DARWIN NÚÑEZ ---
  // Casos de prueba: CP-003 (acceso HM solo lectura), CP-006 (postulación sin actividad / logs vacíos)
  const darwin = await prisma.applicant.create({
    data: {
      name: "Darwin",
      lastName: "Núñez",
      email: "darwin.nunez@eagerworks.uy",
      phone: "+598 98 210 999",
      photo:
        "https://utfs.io/f/hR8lYSLGKWIm1Et5K6jFocWOCMilxSKvI6ygLh3w5ubHNEZa",
      country: "Uruguay",
      linkedin: "https://www.linkedin.com/in/darwin-nunez-uy/",
      englishLevel: "Intermediate" as EnglishLevel,
      source: "Referral" as Source,
      hearAboutUs: "Referral" as HearAboutUs,
      title: "Licenciatura en Sistemas",
      academicInstitution: "Universidad ORT Uruguay",
      careerStartYear: 2018,
      careerEndYear: 2023,
      education:
        "https://utfs.io/f/hR8lYSLGKWImOFI5Tl9NtM6Bb8fsFr1wTAvQYueHk5ic7EDn",
      resume:
        "https://utfs.io/f/hR8lYSLGKWImJyWLuAduWENHGaTLgeYFv7r2dZABOCXKpxQ3",
      roleId: roles["QA Automation Engineer"].id,
      areaId: areas["Quality Assurance & Testing"].id,
      seniorityId: seniorities["Semi Senior"].id,
      tags: {
        connect: [
          { id: tags["TypeScript"].id },
          { id: tags["Docker"].id },
          { id: tags["Referido Eagerworks"].id },
        ],
      },
    },
  });

  await prisma.applicantHiringManager.create({
    data: {
      applicantId: darwin.id,
      hiringManagerId: hm1.id,
      sharedByUserId: admin1.id,
    },
  });

  await prisma.application.create({
    data: {
      applicantId: darwin.id,
      jobOpeningId: jobOpening3.id,
      applicationDate: new Date(seedNow.getTime() - 6 * 24 * 60 * 60 * 1000),
      active: true,
      currentStageId: stageKey("Aplicado"),
      stageEntryDate: new Date(seedNow.getTime() - 6 * 24 * 60 * 60 * 1000),
      desiredSalaryAmount: 3200,
      desiredSalaryCurrency: "USD",
      availability: "1 mes de aviso",
    },
  });

  // --- CANDIDATO 3: SERGIO ROCHET ---
  // Caso de prueba: CP-005 (Flujo alternativo 4A - Candidato sin postulaciones asociadas)
  const rochet = await prisma.applicant.create({
    data: {
      name: "Sergio",
      lastName: "Rochet",
      email: "sergio.rochet@eagerworks.uy",
      phone: "+598 91 330 001",
      photo:
        "https://utfs.io/f/hR8lYSLGKWImVY1SU8NEPatwQzNrSK9G6WUHpdAuIx7knmCs",
      country: "Uruguay",
      linkedin: "https://www.linkedin.com/in/sergio-rochet-uy/",
      englishLevel: "Advanced" as EnglishLevel,
      source: "Outbound" as Source,
      hearAboutUs: "RecruiterContact" as HearAboutUs,
      title: "Tecnólogo en Informática",
      academicInstitution: "UTU - DGETP / FING",
      careerStartYear: 2012,
      careerEndYear: 2016,
      education:
        "https://utfs.io/f/hR8lYSLGKWImEe9aoRrHBKiVRmq5Sol8GYveAQhsOF39PgJa",
      resume:
        "https://utfs.io/f/hR8lYSLGKWImkFphp7omRUN0f2qnh8rKHBCkgIXzYsuEpjDS",
      roleId: roles["DevOps & Cloud Engineer (AWS)"].id,
      areaId: areas["Infraestructura Cloud & DevOps"].id,
      seniorityId: seniorities["Senior"].id,
      tags: {
        connect: [
          { id: tags["AWS"].id },
          { id: tags["Docker"].id },
          { id: tags["Remoto Uruguay"].id },
        ],
      },
    },
  });

  await prisma.applicantHiringManager.create({
    data: {
      applicantId: rochet.id,
      hiringManagerId: hm1.id,
      sharedByUserId: admin1.id,
    },
  });

  // --- CANDIDATO 4: RONALD ARAÚJO ---
  const ronald = await prisma.applicant.create({
    data: {
      name: "Ronald",
      lastName: "Araújo",
      email: "ronald.araujo@eagerworks.uy",
      phone: "+598 99 444 333",
      photo:
        "https://utfs.io/f/hR8lYSLGKWImm5e42wQ3HCd9j6AlTfn0bFLrExghtROmV4oQ",
      country: "Uruguay",
      linkedin: "https://www.linkedin.com/in/ronald-araujo-uy/",
      englishLevel: "Intermediate" as EnglishLevel,
      source: "Inbound" as Source,
      hearAboutUs: "LinkedInJobs" as HearAboutUs,
      title: "Analista en Tecnologías de la Información",
      academicInstitution: "Universidad ORT Uruguay",
      careerStartYear: 2017,
      careerEndYear: 2021,
      education:
        "https://utfs.io/f/hR8lYSLGKWImQvL7lKShjHLUiJaSAu37prKRqVDtfBbxPIg9",
      resume:
        "https://utfs.io/f/hR8lYSLGKWImWIaP5xzRPm3IZJpdylh1iKuwMtTzkrcN5Axv",
      roleId: roles["Backend Developer (Ruby on Rails)"].id,
      areaId: areas["Ingeniería Web & Mobile"].id,
      seniorityId: seniorities["Semi Senior"].id,
      tags: {
        connect: [
          { id: tags["Ruby on Rails"].id },
          { id: tags["PostgreSQL"].id },
          { id: tags["Redis"].id },
        ],
      },
    },
  });

  await prisma.applicantHiringManager.createMany({
    data: [
      {
        applicantId: ronald.id,
        hiringManagerId: hm1.id,
        sharedByUserId: admin1.id,
      },
      {
        applicantId: ronald.id,
        hiringManagerId: hm2.id,
        sharedByUserId: admin1.id,
      },
    ],
  });

  await prisma.application.create({
    data: {
      applicantId: ronald.id,
      jobOpeningId: jobOpening2.id,
      applicationDate: new Date(seedNow.getTime() - 14 * 24 * 60 * 60 * 1000),
      active: true,
      currentStageId: stageKey("Entrevista técnica"),
      stageEntryDate: new Date(seedNow.getTime() - 5 * 24 * 60 * 60 * 1000),
      desiredSalaryAmount: 3800,
      desiredSalaryCurrency: "USD",
      availability: "Inmediata",
    },
  });

  await prisma.activity.create({
    data: {
      applicantId: ronald.id,
      createdById: admin1.id,
      jobOpeningId: jobOpening2.id,
      description: 'movió la postulación de "Aplicado" a "Entrevista técnica"',
      date: new Date(seedNow.getTime() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  // --- CANDIDATO 5: MANUEL UGARTE ---
  // Caso de prueba: CP-004 (Acceso denegado a Larriera hm1; asignado ÚNICAMENTE a Alonso hm2)
  const ugarte = await prisma.applicant.create({
    data: {
      name: "Manuel",
      lastName: "Ugarte",
      email: "manuel.ugarte@eagerworks.uy",
      phone: "+598 94 555 123",
      photo:
        "https://utfs.io/f/hR8lYSLGKWImfFzhXOSfu8Kth6YjTSgR72dGzlyXbwqoIaPe",
      country: "Uruguay",
      linkedin: "https://www.linkedin.com/in/manuel-ugarte-uy/",
      englishLevel: "Advanced" as EnglishLevel,
      source: "Inbound" as Source,
      hearAboutUs: "JobBoard" as HearAboutUs,
      title: "Licenciatura en Informática",
      academicInstitution: "Universidad Católica del Uruguay (UCU)",
      careerStartYear: 2019,
      careerEndYear: 2023,
      education:
        "https://utfs.io/f/hR8lYSLGKWIm9bHNWVgyuagNQHpOEf7RZeL4IAjFtmoU6vK1",
      resume:
        "https://utfs.io/f/hR8lYSLGKWImfwGqhISfu8Kth6YjTSgR72dGzlyXbwqoIaPe",
      roleId: roles["Backend Developer (Ruby on Rails)"].id,
      areaId: areas["Ingeniería Web & Mobile"].id,
      seniorityId: seniorities["Semi Senior"].id,
      tags: {
        connect: [
          { id: tags["Ruby on Rails"].id },
          { id: tags["Docker"].id },
          { id: tags["PostgreSQL"].id },
        ],
      },
    },
  });

  await prisma.applicantHiringManager.create({
    data: {
      applicantId: ugarte.id,
      hiringManagerId: hm2.id,
      sharedByUserId: admin1.id,
    },
  });

  await prisma.application.create({
    data: {
      applicantId: ugarte.id,
      jobOpeningId: jobOpening2.id,
      applicationDate: new Date(seedNow.getTime() - 12 * 24 * 60 * 60 * 1000),
      active: true,
      currentStageId: stageKey("Revisión de perfil"),
      stageEntryDate: new Date(seedNow.getTime() - 12 * 24 * 60 * 60 * 1000),
      desiredSalaryAmount: 3500,
      desiredSalaryCurrency: "USD",
      availability: "Inmediata",
    },
  });

  await prisma.activity.create({
    data: {
      applicantId: ugarte.id,
      createdById: admin2.id,
      jobOpeningId: jobOpening2.id,
      description: 'movió la postulación de "Aplicado" a "Revisión de perfil"',
      date: new Date(seedNow.getTime() - 12 * 24 * 60 * 60 * 1000),
    },
  });

  // --- CANDIDATO 6: RODRIGO BENTANCUR ---
  const bentancur = await prisma.applicant.create({
    data: {
      name: "Rodrigo",
      lastName: "Bentancur",
      email: "rodrigo.bentancur@eagerworks.uy",
      phone: "+598 99 777 888",
      photo:
        "https://utfs.io/f/hR8lYSLGKWImQv9jFwhjHLUiJaSAu37prKRqVDtfBbxPIg9O",
      country: "Uruguay",
      linkedin: "https://www.linkedin.com/in/rodrigo-bentancur-uy/",
      englishLevel: "Native" as EnglishLevel,
      source: "Referral" as Source,
      hearAboutUs: "Referral" as HearAboutUs,
      title: "Ingeniería en Computación",
      academicInstitution: "Universidad de Montevideo (UM)",
      careerStartYear: 2014,
      careerEndYear: 2019,
      education:
        "https://utfs.io/f/hR8lYSLGKWIm85pX47HLwUYeOQ6Wv9AgquNjF75tzrZyiHn2",
      resume:
        "https://utfs.io/f/hR8lYSLGKWIm9SSoj7NgyuagNQHpOEf7RZeL4IAjFtmoU6vK",
      roleId: roles["Tech Lead / Solutions Architect"].id,
      areaId: areas["Ingeniería Web & Mobile"].id,
      seniorityId: seniorities["Staff / Lead"].id,
      tags: {
        connect: [
          { id: tags["TypeScript"].id },
          { id: tags["Ruby on Rails"].id },
          { id: tags["React"].id },
          { id: tags["AWS"].id },
          { id: tags["Top Talent"].id },
          { id: tags["Inglés C2 / Bilingüe"].id },
        ],
      },
    },
  });

  await prisma.applicantHiringManager.createMany({
    data: [
      {
        applicantId: bentancur.id,
        hiringManagerId: hm1.id,
        sharedByUserId: admin1.id,
      },
      {
        applicantId: bentancur.id,
        hiringManagerId: hm2.id,
        sharedByUserId: admin1.id,
      },
    ],
  });

  await prisma.application.create({
    data: {
      applicantId: bentancur.id,
      jobOpeningId: jobOpening1.id,
      applicationDate: new Date(seedNow.getTime() - 18 * 24 * 60 * 60 * 1000),
      active: true,
      currentStageId: stageKey("Entrevista HR"),
      stageEntryDate: new Date(seedNow.getTime() - 4 * 24 * 60 * 60 * 1000),
      desiredSalaryAmount: 6000,
      desiredSalaryCurrency: "USD",
      availability: "1 mes de aviso",
    },
  });

  await prisma.activity.create({
    data: {
      applicantId: bentancur.id,
      createdById: admin1.id,
      jobOpeningId: jobOpening1.id,
      description: 'movió la postulación de "Aplicado" a "Entrevista HR"',
      date: new Date(seedNow.getTime() - 4 * 24 * 60 * 60 * 1000),
    },
  });

  // --- CANDIDATO 7: FACUNDO PELLISTRI ---
  // Carrera IT: Licenciatura en Tecnologías de la Información (UTEC)
  const pellistri = await prisma.applicant.create({
    data: {
      name: "Facundo",
      lastName: "Pellistri",
      email: "facundo.pellistri@eagerworks.uy",
      phone: "+598 92 444 333",
      photo:
        "https://utfs.io/f/hR8lYSLGKWImViU69cBNEPatwQzNrSK9G6WUHpdAuIx7knmC",
      country: "Uruguay",
      linkedin: "https://www.linkedin.com/in/facundo-pellistri-uy/",
      englishLevel: "Advanced" as EnglishLevel,
      source: "Inbound" as Source,
      hearAboutUs: "LinkedInPost" as HearAboutUs,
      title: "Licenciatura en Tecnologías de la Información",
      academicInstitution: "Universidad Tecnológica del Uruguay (UTEC)",
      careerStartYear: 2019,
      careerEndYear: 2023,
      education:
        "https://utfs.io/f/hR8lYSLGKWImzc21Z0iBm4FATwCEZPelHW5gDXhqv6SLNbR0",
      resume:
        "https://utfs.io/f/hR8lYSLGKWImIzraN4bpXfrbtxsdoSUny6CElHeq083cIZAM",
      roleId: roles["Frontend Developer (React / Next.js)"].id,
      areaId: areas["Ingeniería Web & Mobile"].id,
      seniorityId: seniorities["Semi Senior"].id,
      tags: {
        connect: [
          { id: tags["React"].id },
          { id: tags["Next.js"].id },
          { id: tags["TypeScript"].id },
          { id: tags["Tailwind CSS"].id },
          { id: tags["Híbrido Montevideo (Cordón)"].id },
        ],
      },
    },
  });

  await prisma.applicantHiringManager.createMany({
    data: [
      {
        applicantId: pellistri.id,
        hiringManagerId: hm1.id,
        sharedByUserId: admin1.id,
      },
      {
        applicantId: pellistri.id,
        hiringManagerId: hm3.id,
        sharedByUserId: admin1.id,
      },
    ],
  });

  await prisma.application.create({
    data: {
      applicantId: pellistri.id,
      jobOpeningId: jobOpening5.id,
      applicationDate: new Date(seedNow.getTime() - 7 * 24 * 60 * 60 * 1000),
      active: true,
      currentStageId: stageKey("Aplicado"),
      stageEntryDate: new Date(seedNow.getTime() - 7 * 24 * 60 * 60 * 1000),
      desiredSalaryAmount: 3400,
      desiredSalaryCurrency: "USD",
      availability: "Inmediata",
    },
  });

  // --- CANDIDATO 8: NICOLÁS DE LA CRUZ ---
  const delacruz = await prisma.applicant.create({
    data: {
      name: "Nicolás",
      lastName: "De La Cruz",
      email: "nicolas.delacruz@eagerworks.uy",
      phone: "+598 98 111 222",
      photo:
        "https://utfs.io/f/hR8lYSLGKWImTduAftczqbAuclI6LrEMdvGJaHT2gYfNeD97",
      country: "Uruguay",
      linkedin: "https://www.linkedin.com/in/nicolas-delacruz-uy/",
      englishLevel: "Intermediate" as EnglishLevel,
      source: "Inbound" as Source,
      hearAboutUs: "LinkedInJobs" as HearAboutUs,
      title: "Analista Programador",
      academicInstitution: "Universidad ORT Uruguay",
      careerStartYear: 2017,
      careerEndYear: 2020,
      education:
        "https://utfs.io/f/hR8lYSLGKWImCv1ruTxkAHnNfe7dxwumv3OEPpKIY41cXlJz",
      resume:
        "https://utfs.io/f/hR8lYSLGKWImIKJ2jUbpXfrbtxsdoSUny6CElHeq083cIZAM",
      roleId: roles["Full Stack Developer (Ruby on Rails & React)"].id,
      areaId: areas["Ingeniería Web & Mobile"].id,
      seniorityId: seniorities["Senior"].id,
      tags: {
        connect: [
          { id: tags["Ruby on Rails"].id },
          { id: tags["React"].id },
          { id: tags["PostgreSQL"].id },
        ],
      },
    },
  });

  await prisma.applicantHiringManager.create({
    data: {
      applicantId: delacruz.id,
      hiringManagerId: hm1.id,
      sharedByUserId: admin1.id,
    },
  });

  await prisma.application.create({
    data: {
      applicantId: delacruz.id,
      jobOpeningId: jobOpening1.id,
      applicationDate: new Date(seedNow.getTime() - 15 * 24 * 60 * 60 * 1000),
      active: true,
      currentStageId: stageKey("Entrevista técnica"),
      stageEntryDate: new Date(seedNow.getTime() - 6 * 24 * 60 * 60 * 1000),
      desiredSalaryAmount: 4300,
      desiredSalaryCurrency: "USD",
      availability: "2 semanas de aviso",
    },
  });

  // --- CANDIDATO 9: MATHÍAS OLIVERA ---
  const olivera = await prisma.applicant.create({
    data: {
      name: "Mathías",
      lastName: "Olivera",
      email: "mathias.olivera@eagerworks.uy",
      phone: "+598 99 666 555",
      photo:
        "https://utfs.io/f/hR8lYSLGKWImL7hwMPv5WnhSyidITwVUm73A0KlDjR8ekaHJ",
      country: "Uruguay",
      linkedin: "https://www.linkedin.com/in/mathias-olivera-uy/",
      englishLevel: "Advanced" as EnglishLevel,
      source: "Outbound" as Source,
      hearAboutUs: "RecruiterContact" as HearAboutUs,
      title: "Ingeniería en Telecomunicaciones",
      academicInstitution: "Universidad Católica del Uruguay (UCU)",
      careerStartYear: 2015,
      careerEndYear: 2020,
      education:
        "https://utfs.io/f/hR8lYSLGKWImjWthrNZ6I7B2qH4DTo0CAaezXrkYntOJN8ux",
      resume:
        "https://utfs.io/f/hR8lYSLGKWIm135PqAjFocWOCMilxSKvI6ygLh3w5ubHNEZa",
      roleId: roles["DevOps & Cloud Engineer (AWS)"].id,
      areaId: areas["Infraestructura Cloud & DevOps"].id,
      seniorityId: seniorities["Senior"].id,
      tags: {
        connect: [
          { id: tags["AWS"].id },
          { id: tags["Docker"].id },
          { id: tags["Remoto Uruguay"].id },
        ],
      },
    },
  });

  await prisma.applicantHiringManager.create({
    data: {
      applicantId: olivera.id,
      hiringManagerId: hm3.id,
      sharedByUserId: admin1.id,
    },
  });

  await prisma.application.create({
    data: {
      applicantId: olivera.id,
      jobOpeningId: jobOpening4.id,
      applicationDate: new Date(seedNow.getTime() - 9 * 24 * 60 * 60 * 1000),
      active: true,
      currentStageId: stageKey("Revisión de perfil"),
      stageEntryDate: new Date(seedNow.getTime() - 9 * 24 * 60 * 60 * 1000),
      desiredSalaryAmount: 4800,
      desiredSalaryCurrency: "USD",
      availability: "1 mes de aviso",
    },
  });

  // --- CANDIDATO 10: MAXIMILIANO ARAÚJO ---
  const maxi = await prisma.applicant.create({
    data: {
      name: "Maximiliano",
      lastName: "Araújo",
      email: "maxi.araujo@eagerworks.uy",
      phone: "+598 91 888 999",
      photo:
        "https://utfs.io/f/hR8lYSLGKWImLJiQNsv5WnhSyidITwVUm73A0KlDjR8ekaHJ",
      country: "Uruguay",
      linkedin: "https://www.linkedin.com/in/maxi-araujo-uy/",
      englishLevel: "Intermediate" as EnglishLevel,
      source: "Inbound" as Source,
      hearAboutUs: "InternetSearch" as HearAboutUs,
      title: "Tecnólogo en Informática",
      academicInstitution: "UTU - DGETP / FING",
      careerStartYear: 2018,
      careerEndYear: 2022,
      education:
        "https://utfs.io/f/hR8lYSLGKWImA0evDbVdlcznVbQr9gGEW3hHLN5X7KtkPqfM",
      resume:
        "https://utfs.io/f/hR8lYSLGKWImsvkHz46aXmYEGTqbd4oJ73A05Z1WuRpPOnhw",
      roleId: roles["Mobile Developer (React Native)"].id,
      areaId: areas["Ingeniería Web & Mobile"].id,
      seniorityId: seniorities["Semi Senior"].id,
      tags: {
        connect: [
          { id: tags["React Native"].id },
          { id: tags["React"].id },
          { id: tags["TypeScript"].id },
          { id: tags["Remoto Uruguay"].id },
        ],
      },
    },
  });

  await prisma.applicantHiringManager.createMany({
    data: [
      {
        applicantId: maxi.id,
        hiringManagerId: hm1.id,
        sharedByUserId: admin1.id,
      },
      {
        applicantId: maxi.id,
        hiringManagerId: hm2.id,
        sharedByUserId: admin1.id,
      },
    ],
  });

  await prisma.application.create({
    data: {
      applicantId: maxi.id,
      jobOpeningId: jobOpening1.id,
      applicationDate: new Date(seedNow.getTime() - 10 * 24 * 60 * 60 * 1000),
      active: true,
      currentStageId: stageKey("Aplicado"),
      stageEntryDate: new Date(seedNow.getTime() - 10 * 24 * 60 * 60 * 1000),
      desiredSalaryAmount: 3600,
      desiredSalaryCurrency: "USD",
      availability: "Inmediata",
    },
  });

  // --- CANDIDATO 11: FERRAN TORRES ---
  const ferran = await prisma.applicant.create({
    data: {
      name: "Ferran",
      lastName: "Torres",
      email: "ferran.torres@eagerworks.uy",
      phone: "+34 612 345 678",
      photo:
        "https://utfs.io/f/hR8lYSLGKWImHhb13cEm6P0IYWAc5JoVdwyXaKQZESumLf87",
      country: "España",
      linkedin: "https://www.linkedin.com/in/ferran-torres/",
      englishLevel: "Intermediate" as EnglishLevel,
      source: "Inbound" as Source,
      hearAboutUs: "LinkedInJobs" as HearAboutUs,
      title: "Grado en Ingeniería Multimedia",
      academicInstitution: "Universidad Politécnica de Valencia",
      careerStartYear: 2018,
      careerEndYear: 2022,
      education:
        "https://utfs.io/f/bFtU7UL7iC6d95hoUdxLyWjIRhS6MJH8irfq4OdDoAZzlCFc",
      resume:
        "https://utfs.io/f/bFtU7UL7iC6dzWFqHmoa1xD0MSIcTmBLQnvy75wW6JAofbeO",
      roleId: roles["Frontend Developer (React / Next.js)"].id,
      areaId: areas["Ingeniería Web & Mobile"].id,
      seniorityId: seniorities["Semi Senior"].id,
      tags: {
        connect: [
          { id: tags["React"].id },
          { id: tags["Next.js"].id },
          { id: tags["TypeScript"].id },
          { id: tags["Tailwind CSS"].id },
          { id: tags["Top Talent"].id },
        ],
      },
    },
  });

  await prisma.applicantHiringManager.createMany({
    data: [
      {
        applicantId: ferran.id,
        hiringManagerId: hm4.id,
        sharedByUserId: admin1.id,
      },
      {
        applicantId: ferran.id,
        hiringManagerId: hm5.id,
        sharedByUserId: admin1.id,
      },
    ],
  });

  await prisma.application.create({
    data: {
      applicantId: ferran.id,
      jobOpeningId: jobOpening5.id,
      applicationDate: new Date(seedNow.getTime() - 12 * 24 * 60 * 60 * 1000),
      active: true,
      currentStageId: stageKey("Entrevista técnica"),
      stageEntryDate: new Date(seedNow.getTime() - 3 * 24 * 60 * 60 * 1000),
      desiredSalaryAmount: 3200,
      desiredSalaryCurrency: "USD",
      availability: "Inmediata",
    },
  });

  await prisma.activity.create({
    data: {
      applicantId: ferran.id,
      createdById: admin1.id,
      jobOpeningId: jobOpening5.id,
      description: `agregó el candidato a "${jobOpening5.name}"`,
      date: new Date(seedNow.getTime() - 12 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.activity.create({
    data: {
      applicantId: ferran.id,
      createdById: admin1.id,
      jobOpeningId: jobOpening5.id,
      description: 'movió la postulación de "Aplicado" a "Entrevista técnica"',
      date: new Date(seedNow.getTime() - 3 * 24 * 60 * 60 * 1000),
    },
  });

  // --- CANDIDATO 12: ANTHONY GORDON ---
  const gordon = await prisma.applicant.create({
    data: {
      name: "Anthony",
      lastName: "Gordon",
      email: "anthony.gordon@eagerworks.uy",
      phone: "+44 7700 900123",
      photo:
        "https://utfs.io/f/hR8lYSLGKWImeW38mUIrBaxbc3UnuwtRP6K92fSCLpE5DdGj",
      country: "Reino Unido",
      linkedin: "https://www.linkedin.com/in/anthony-gordon/",
      englishLevel: "Native" as EnglishLevel,
      source: "Referral" as Source,
      hearAboutUs: "Referral" as HearAboutUs,
      title: "BSc in Software Engineering",
      academicInstitution: "University of Liverpool",
      careerStartYear: 2019,
      careerEndYear: 2023,
      education:
        "https://utfs.io/f/bFtU7UL7iC6dyMNNhwx8zFcyb9IOKkRnudqe7tv6ZfUlQ1T3",
      resume:
        "https://utfs.io/f/bFtU7UL7iC6dGcNfXXUYw0mSlJeTNp9tf6qZPu1zACinMV8y",
      roleId: roles["QA Automation Engineer"].id,
      areaId: areas["Quality Assurance & Testing"].id,
      seniorityId: seniorities["Semi Senior"].id,
      tags: {
        connect: [
          { id: tags["TypeScript"].id },
          { id: tags["Docker"].id },
          { id: tags["Inglés C2 / Bilingüe"].id },
          { id: tags["Referido Eagerworks"].id },
        ],
      },
    },
  });

  await prisma.applicantHiringManager.create({
    data: {
      applicantId: gordon.id,
      hiringManagerId: hm5.id,
      sharedByUserId: admin1.id,
    },
  });

  await prisma.application.create({
    data: {
      applicantId: gordon.id,
      jobOpeningId: jobOpening3.id,
      applicationDate: new Date(seedNow.getTime() - 7 * 24 * 60 * 60 * 1000),
      active: true,
      currentStageId: stageKey("Revisión de perfil"),
      stageEntryDate: new Date(seedNow.getTime() - 5 * 24 * 60 * 60 * 1000),
      desiredSalaryAmount: 3500,
      desiredSalaryCurrency: "USD",
      availability: "1 mes de preaviso",
    },
  });

  await prisma.activity.create({
    data: {
      applicantId: gordon.id,
      createdById: admin1.id,
      jobOpeningId: jobOpening3.id,
      description: `agregó el candidato a "${jobOpening3.name}"`,
      date: new Date(seedNow.getTime() - 7 * 24 * 60 * 60 * 1000),
    },
  });

  // --- CANDIDATO 13: CRISTIANO RONALDO ---
  const cristiano = await prisma.applicant.create({
    data: {
      name: "Cristiano",
      lastName: "Ronaldo",
      email: "cristiano.ronaldo@eagerworks.uy",
      phone: "+351 912 345 678",
      photo:
        "https://utfs.io/f/hR8lYSLGKWImrJaXOo8bsQ056OqKNWVH1zT9JPCL2F48aoXh",
      country: "Portugal",
      linkedin: "https://www.linkedin.com/in/cristiano-ronaldo/",
      englishLevel: "Advanced" as EnglishLevel,
      source: "Inbound" as Source,
      hearAboutUs: "InternetSearch" as HearAboutUs,
      title: "Licenciatura en Informática y Gestión",
      academicInstitution: "Universidade de Lisboa",
      careerStartYear: 2003,
      careerEndYear: 2008,
      education:
        "https://utfs.io/f/bFtU7UL7iC6dbwmnNwL7iC6dek34qyNI5SROABGtaLoulWzs",
      resume:
        "https://utfs.io/f/bFtU7UL7iC6duOOQx4m9aDgwxjpJGVkudZlvmHYAX5iBrM3t",
      roleId: roles["Tech Lead / Solutions Architect"].id,
      areaId: areas["Ingeniería Web & Mobile"].id,
      seniorityId: seniorities["Staff / Lead"].id,
      tags: {
        connect: [
          { id: tags["Ruby on Rails"].id },
          { id: tags["AWS"].id },
          { id: tags["Docker"].id },
          { id: tags["PostgreSQL"].id },
          { id: tags["Top Talent"].id },
          { id: tags["Inglés C1 / Fluido"].id },
        ],
      },
    },
  });

  await prisma.applicantHiringManager.createMany({
    data: [
      {
        applicantId: cristiano.id,
        hiringManagerId: hm1.id,
        sharedByUserId: admin1.id,
      },
      {
        applicantId: cristiano.id,
        hiringManagerId: hm4.id,
        sharedByUserId: admin1.id,
      },
    ],
  });

  await prisma.application.create({
    data: {
      applicantId: cristiano.id,
      jobOpeningId: jobOpening1.id,
      applicationDate: new Date(seedNow.getTime() - 18 * 24 * 60 * 60 * 1000),
      active: true,
      currentStageId: stageKey("Oferta"),
      stageEntryDate: new Date(seedNow.getTime() - 2 * 24 * 60 * 60 * 1000),
      desiredSalaryAmount: 7000,
      desiredSalaryCurrency: "USD",
      availability: "Inmediata",
    },
  });

  await prisma.activity.create({
    data: {
      applicantId: cristiano.id,
      createdById: admin1.id,
      jobOpeningId: jobOpening1.id,
      description: 'movió la postulación de "Aplicado" a "Entrevista técnica"',
      date: new Date(seedNow.getTime() - 8 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.activity.create({
    data: {
      applicantId: cristiano.id,
      createdById: admin1.id,
      jobOpeningId: jobOpening1.id,
      description: 'movió la postulación de "Entrevista técnica" a "Oferta"',
      date: new Date(seedNow.getTime() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  // --- CANDIDATO 14: JULIÁN ÁLVAREZ ---
  const julian = await prisma.applicant.create({
    data: {
      name: "Julián",
      lastName: "Álvarez",
      email: "julian.alvarez@eagerworks.uy",
      phone: "+54 9 11 2345 6789",
      photo:
        "https://utfs.io/f/hR8lYSLGKWImn1zAAatBlvSoOUGZk97AQs2P03wdbX6itycE",
      country: "Argentina",
      linkedin: "https://www.linkedin.com/in/julian-alvarez/",
      englishLevel: "Advanced" as EnglishLevel,
      source: "Inbound" as Source,
      hearAboutUs: "LinkedInJobs" as HearAboutUs,
      title: "Licenciatura en Ciencias de la Computación",
      academicInstitution: "Universidad de Buenos Aires (UBA)",
      careerStartYear: 2018,
      careerEndYear: 2023,
      education:
        "https://utfs.io/f/bFtU7UL7iC6dsUX6U0FQZz7f6ncx2REU4B5PwSyJV10gCYaD",
      resume:
        "https://utfs.io/f/bFtU7UL7iC6di8eJ1AKkNfUudbxes4p6tRO1vqZBKVlzyim0",
      roleId: roles["AI / Machine Learning Engineer"].id,
      areaId: areas["AI Studio & Data"].id,
      seniorityId: seniorities["Semi Senior"].id,
      tags: {
        connect: [
          { id: tags["Python"].id },
          { id: tags["TypeScript"].id },
          { id: tags["Docker"].id },
          { id: tags["Top Talent"].id },
          { id: tags["Remoto Uruguay"].id },
        ],
      },
    },
  });

  await prisma.applicantHiringManager.create({
    data: {
      applicantId: julian.id,
      hiringManagerId: hm4.id,
      sharedByUserId: admin1.id,
    },
  });

  await prisma.application.create({
    data: {
      applicantId: julian.id,
      jobOpeningId: jobOpening6.id,
      applicationDate: new Date(seedNow.getTime() - 4 * 24 * 60 * 60 * 1000),
      active: true,
      currentStageId: stageKey("Entrevista HR"),
      stageEntryDate: new Date(seedNow.getTime() - 2 * 24 * 60 * 60 * 1000),
      desiredSalaryAmount: 4000,
      desiredSalaryCurrency: "USD",
      availability: "2 semanas",
    },
  });

  await prisma.activity.create({
    data: {
      applicantId: julian.id,
      createdById: admin1.id,
      jobOpeningId: jobOpening6.id,
      description: `agregó el candidato a "${jobOpening6.name}"`,
      date: new Date(seedNow.getTime() - 4 * 24 * 60 * 60 * 1000),
    },
  });

  // --- CANDIDATO 15: FERNANDO MUSLERA ---
  const muslera = await prisma.applicant.create({
    data: {
      name: "Fernando",
      lastName: "Muslera",
      email: "fernando.muslera@eagerworks.uy",
      phone: "+598 99 123 456",
      photo:
        "https://utfs.io/f/hR8lYSLGKWImT1x2nYczqbAuclI6LrEMdvGJaHT2gYfNeD97",
      country: "Uruguay",
      linkedin: "https://www.linkedin.com/in/fernando-muslera-uy/",
      englishLevel: "Advanced" as EnglishLevel,
      source: "Outbound" as Source,
      hearAboutUs: "RecruiterContact" as HearAboutUs,
      title: "Ingeniería en Sistemas de Información",
      academicInstitution: "Universidad Manos de Manteca",
      careerStartYear: 2004,
      careerEndYear: 2009,
      education:
        "https://utfs.io/f/bFtU7UL7iC6dFR1FmelnY0ZCeByJDuXEmxFskzMjTUiI4PAO",
      resume:
        "https://utfs.io/f/bFtU7UL7iC6d2w8ytpqPpmvyQTLnRbxerGHSUXgMkc1YuiEC",
      roleId: roles["DevOps & Cloud Engineer (AWS)"].id,
      areaId: areas["Infraestructura Cloud & DevOps"].id,
      seniorityId: seniorities["Senior"].id,
      tags: {
        connect: [
          { id: tags["AWS"].id },
          { id: tags["Docker"].id },
          { id: tags["PostgreSQL"].id },
          { id: tags["Híbrido Montevideo (Cordón)"].id },
        ],
      },
    },
  });

  await prisma.applicantHiringManager.createMany({
    data: [
      {
        applicantId: muslera.id,
        hiringManagerId: hm3.id,
        sharedByUserId: admin1.id,
      },
      {
        applicantId: muslera.id,
        hiringManagerId: hm5.id,
        sharedByUserId: admin1.id,
      },
    ],
  });

  await prisma.application.create({
    data: {
      applicantId: muslera.id,
      jobOpeningId: jobOpening4.id,
      applicationDate: new Date(seedNow.getTime() - 9 * 24 * 60 * 60 * 1000),
      active: true,
      currentStageId: stageKey("Aplicado"),
      stageEntryDate: new Date(seedNow.getTime() - 9 * 24 * 60 * 60 * 1000),
      desiredSalaryAmount: 4800,
      desiredSalaryCurrency: "USD",
      availability: "Inmediata",
    },
  });

  await prisma.activity.create({
    data: {
      applicantId: muslera.id,
      createdById: admin1.id,
      jobOpeningId: jobOpening4.id,
      description: `agregó el candidato a "${jobOpening4.name}"`,
      date: new Date(seedNow.getTime() - 9 * 24 * 60 * 60 * 1000),
    },
  });

  // Historical outcomes populate sources, motives and every pipeline stage.
  // Rochet deliberately keeps no applications, preserving the existing profile case.
  const historicalApplicants = [
    federico,
    darwin,
    ronald,
    ugarte,
    bentancur,
    pellistri,
    delacruz,
    olivera,
    maxi,
    ferran,
    gordon,
    cristiano,
    julian,
    muslera,
  ];
  const historicalStageIndexes = [0, 0, 0, 0, 1, 1, 1, 2, 2, 3, 3, 4, 5, 6];
  for (const opening of closedOpenings) {
    const closingDate = opening.closingDate!;
    for (const [index, applicant] of historicalApplicants.entries()) {
      const stage = defaultStages[historicalStageIndexes[index]];
      const hired = stage.type === "Contratado";
      const motive =
        disqualificationMotives[index % disqualificationMotives.length];
      // One legacy rejection has no motive, exercising the fallback label.
      const hasMotive = index !== 0;
      const applicationDate = addDays(opening.openingDate, 1);
      const stageEntryDate = hired
        ? closingDate
        : subDays(closingDate, 8 - historicalStageIndexes[index]);
      const disqualificationDate = hired ? null : subDays(closingDate, 1);
      await prisma.application.create({
        data: {
          applicantId: applicant.id,
          jobOpeningId: opening.id,
          applicationDate,
          currentStageId: stage.key,
          stageEntryDate,
          active: hired,
          disqualificationDate,
          disqualificationMotiveId: !hired && hasMotive ? motive.id : null,
          disqualificationDescription: hired
            ? null
            : hasMotive
              ? `${motive.name}. Proceso finalizado para ${opening.name}.`
              : "Descalificación histórica sin motivo registrado.",
          desiredSalaryAmount: 2800 + index * 200,
          desiredSalaryCurrency: "USD",
          availability: "2 semanas de aviso",
        },
      });
      await prisma.activity.createMany({
        data: [
          {
            applicantId: applicant.id,
            jobOpeningId: opening.id,
            createdById: admin1.id,
            description: `agregó el candidato a "${opening.name}"`,
            date: applicationDate,
          },
          {
            applicantId: applicant.id,
            jobOpeningId: opening.id,
            createdById: admin1.id,
            description: hired
              ? 'movió la postulación de "Oferta" a "Contratado/a"'
              : `descalificó la postulación: ${hasMotive ? motive.name : "sin motivo registrado"}`,
            date: disqualificationDate ?? stageEntryDate,
          },
        ],
      });
    }
  }

  await prisma.application.createMany({
    data: [
      {
        applicantId: pellistri.id,
        jobOpeningId: jobOpening1.id,
        applicationDate: seedDateFromToday(-10),
        currentStageId: stageKey("Psicotécnico"),
        stageEntryDate: seedDateFromToday(-2),
        active: true,
      },
      {
        applicantId: muslera.id,
        jobOpeningId: jobOpening7.id,
        applicationDate: seedDateFromToday(0),
        currentStageId: stageKey("Aplicado"),
        stageEntryDate: seedDateFromToday(0),
        active: true,
      },
    ],
  });

  const openRejections = [
    {
      applicant: delacruz,
      opening: jobOpening4,
      stage: "Entrevista técnica",
      motive: 0,
    },
    {
      applicant: gordon,
      opening: jobOpening6,
      stage: "Entrevista HR",
      motive: 2,
    },
    { applicant: maxi, opening: jobOpening5, stage: "Aplicado", motive: 1 },
  ];
  for (const rejection of openRejections) {
    const motive = disqualificationMotives[rejection.motive];
    await prisma.application.create({
      data: {
        applicantId: rejection.applicant.id,
        jobOpeningId: rejection.opening.id,
        applicationDate: seedDateFromToday(-3),
        currentStageId: stageKey(rejection.stage),
        stageEntryDate: seedDateFromToday(-2),
        active: false,
        disqualificationDate: seedDateFromToday(-1),
        disqualificationMotiveId: motive.id,
        disqualificationDescription: `${motive.name}. Continuar con otros perfiles.`,
      },
    });
    await prisma.activity.create({
      data: {
        applicantId: rejection.applicant.id,
        jobOpeningId: rejection.opening.id,
        createdById: admin2.id,
        description: `descalificó la postulación: ${motive.name}`,
        date: seedDateFromToday(-1),
      },
    });
  }

  // Interviews use Montevideo time, independently of the machine's timezone.
  const interviewDate = (dayOffset: number, hour: number, minute = 0) =>
    new TZDate(
      nowInUruguay.getFullYear(),
      nowInUruguay.getMonth(),
      nowInUruguay.getDate() + dayOffset,
      hour,
      minute,
      "America/Montevideo",
    );
  await prisma.interview.create({
    data: {
      stageId: "83412", // "Entrevista técnica" in defaultStages
      duration: 60,
      modality: "VideoCall" as InterviewType,
      date: fedeInterviewDate,
      status: "Completed" as InterviewStatus,
      summary: "https://app.read.ai/meeting/abc123/summary",
      applicantId: federico.id,
      jobOpeningId: jobOpening1.id,
      interviewers: { connect: [{ id: hm1.id }] },
      assignments: {
        create: [{ interviewerId: hm1.id, assignedById: admin1.id }],
      },
    },
  });

  await prisma.interview.create({
    data: {
      exploratoryName: "Charla exploratoria",
      duration: 30,
      modality: "VideoCall" as InterviewType,
      date: interviewDate(1, 15),
      status: "Scheduled" as InterviewStatus,
      applicantId: muslera.id,
      interviewers: { connect: [{ id: hm1.id }] },
      assignments: {
        create: [{ interviewerId: hm1.id, assignedById: admin1.id }],
      },
    },
  });

  const dashboardInterviews = [
    {
      applicant: ronald,
      opening: jobOpening2,
      stage: "Entrevista técnica",
      date: interviewDate(0, 9),
      interviewer: hm1,
    },
    {
      applicant: bentancur,
      opening: jobOpening1,
      stage: "Entrevista HR",
      date: seedNow,
      interviewer: admin1,
      completed: true,
    },
    {
      applicant: pellistri,
      opening: jobOpening1,
      stage: "Psicotécnico",
      date: interviewDate(0, 12),
      interviewer: hm2,
    },
    {
      applicant: rochet,
      opening: null,
      stage: null,
      date: interviewDate(0, 14),
      interviewer: hm3,
    },
    {
      applicant: julian,
      opening: jobOpening6,
      stage: "Entrevista HR",
      date: interviewDate(0, 16, 30),
      interviewer: hm4,
    },
    {
      applicant: federico,
      opening: jobOpening1,
      stage: "Entrevista técnica",
      date: interviewDate(1, 9, 30),
      interviewer: hm1,
    },
    {
      applicant: ferran,
      opening: jobOpening5,
      stage: "Entrevista técnica",
      date: interviewDate(1, 11),
      interviewer: hm4,
    },
    {
      applicant: julian,
      opening: jobOpening6,
      stage: "Entrevista HR",
      date: interviewDate(1, 14),
      interviewer: hm5,
    },
    {
      applicant: olivera,
      opening: jobOpening4,
      stage: "Entrevista técnica",
      date: interviewDate(3, 10),
      interviewer: hm3,
    },
    {
      applicant: muslera,
      opening: jobOpening7,
      stage: "Entrevista HR",
      date: null,
      interviewer: admin2,
    },
  ];
  for (const definition of dashboardInterviews) {
    const stageId = definition.stage ? stageKey(definition.stage) : null;
    const dateLabel = definition.date
      ? format(
          new TZDate(definition.date, "America/Montevideo"),
          "dd/MM/yyyy 'a las' HH:mm",
        )
      : "pendiente de coordinar";
    await prisma.interview.create({
      data: {
        applicantId: definition.applicant.id,
        jobOpeningId: definition.opening?.id,
        stageId,
        exploratoryName: stageId ? null : "Charla exploratoria Cloud & DevOps",
        duration: definition.stage === "Entrevista técnica" ? 60 : 30,
        modality:
          definition.applicant.id === pellistri.id ? "InPerson" : "VideoCall",
        date: definition.date,
        status: definition.completed
          ? "Completed"
          : definition.date
            ? "Scheduled"
            : "Pending",
        interviewers: { connect: [{ id: definition.interviewer.id }] },
        assignments: {
          create: [
            {
              interviewerId: definition.interviewer.id,
              assignedById: admin1.id,
              assignedAt: seedNow,
            },
          ],
        },
        ...(definition.completed
          ? {
              note: {
                create: {
                  content: {
                    type: "doc",
                    content: [
                      {
                        type: "paragraph",
                        content: [
                          {
                            type: "text",
                            text: "Buen nivel de comunicación e inglés. Avanzar con la evaluación técnica.",
                          },
                        ],
                      },
                    ],
                  },
                  lastModifiedById: admin1.id,
                },
              },
            }
          : {}),
      },
    });
    await prisma.activity.create({
      data: {
        applicantId: definition.applicant.id,
        jobOpeningId: definition.opening?.id,
        createdById: admin1.id,
        description: `agendó la entrevista "${definition.stage ?? "Charla exploratoria"}" ${dateLabel}`,
        date: seedNow,
      },
    });
  }

  await prisma.applicantNote.create({
    data: {
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Excelente perfil técnico, experiencia sólida en proyectos de escala y muy buen nivel de inglés.",
              },
            ],
          },
        ],
      },
      applicantId: federico.id,
      lastModifiedById: hm1.id,
    },
  });

  await prisma.applicantNote.create({
    data: {
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Candidato referido con muy buenas referencias en testing automatizado y calidad de software.",
              },
            ],
          },
        ],
      },
      applicantId: darwin.id,
      lastModifiedById: admin1.id,
    },
  });

  console.log("Seed completado exitosamente.");
}
