import { randomBytes } from "node:crypto";
import { betterAuth } from "better-auth";
<<<<<<< HEAD
import { organization } from "better-auth/plugins";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { faker } from "@faker-js/faker";
import type {
  PrismaClient,
  EnglishLevel,
  Source,
  HearAboutUs,
  JobOpeningStatus,
  InterviewStatus,
  InterviewType,
  UserStatus,
} from "~/generated/prisma/client";

const ORGANIZATION_NAME = "EagerWorks";
const ORGANIZATION_SLUG = "eagerworks";

// ============================================================================
// 1. USUARIOS DEFINIDOS (3 RECRUITERS + 3 HIRING MANAGERS)
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
    plugins: [organization()],
  });
}

export async function seedDatabase(prisma: PrismaClient): Promise<void> {
  const seedAuth = getSeedAuth(prisma);

  // ==========================================================================
  // GESTIÓN DE USUARIOS CON BETTER-AUTH (IDEMPOTENCIA)
  // ==========================================================================
  const seedEmails = SEED_USERS.map((u) => u.email);

  for (const userDef of SEED_USERS) {
    const existing = await prisma.user.findUnique({
      where: { email: userDef.email },
    });

    if (!existing) {
      await seedAuth.api.signUpEmail({
        body: {
          name: `${userDef.name} ${userDef.lastName}`,
          email: userDef.email,
          password: userDef.password,
        },
      });
      await prisma.user.update({
        where: { email: userDef.email },
        data: {
          name: userDef.name,
          lastName: userDef.lastName,
          status: "Active",
          emailVerified: true,
        },
      });
      console.log(`Usuario creado: ${userDef.email} (${userDef.name} ${userDef.lastName})`);
    } else {
      await prisma.user.update({
        where: { email: userDef.email },
        data: {
          name: userDef.name,
          lastName: userDef.lastName,
          status: "Active",
          emailVerified: true,
        },
      });
      console.log(`Usuario conservado/actualizado: ${userDef.email} (${userDef.name} ${userDef.lastName})`);
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

    await seedAuth.api.createOrganization({
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
=======
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
>>>>>>> f0b1168 (Prisma tables)
        },
      },
    });

<<<<<<< HEAD
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
  // LIMPIEZA PREVIA PARA IDEMPOTENCIA (Conserva solo los 6 usuarios del seed)
  // ==========================================================================
  await prisma.$transaction([
    prisma.publicLink.deleteMany(),
    prisma.invitation.deleteMany(),
    prisma.activity.deleteMany(),
    prisma.interviewNote.deleteMany(),
    prisma.applicantNote.deleteMany(),
    prisma.interview.deleteMany(),
    prisma.application.deleteMany(),
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
  const admin3 = dbUsers.find((u) => u.email === "admin3@example.com")!;
  const hm1 = dbUsers.find((u) => u.email === "hiring.manager@example.com")!;
  const hm2 = dbUsers.find((u) => u.email === "hiring.manager2@example.com")!;
  const hm3 = dbUsers.find((u) => u.email === "hiring.manager3@example.com")!;

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
    { name: "Ruby on Rails", color: "#CC0000" },
    { name: "React", color: "#61DAFB" },
    { name: "Next.js", color: "#000000" },
    { name: "TypeScript", color: "#3178C6" },
    { name: "React Native", color: "#087EA4" },
    { name: "Node.js", color: "#339933" },
    { name: "Python", color: "#3776AB" },
    { name: "PostgreSQL", color: "#4169E1" },
    { name: "Docker", color: "#2496ED" },
    { name: "AWS", color: "#FF9900" },
    { name: "Redis", color: "#DC382D" },
    { name: "GraphQL", color: "#E10098" },
    { name: "Tailwind CSS", color: "#06B6D4" },
  ];
  const otherTagDefs = [
    { name: "Híbrido Montevideo (Cordón)", color: "#3B82F6" },
    { name: "Remoto Uruguay", color: "#10B981" },
    { name: "Inglés C1 / Fluido", color: "#8B5CF6" },
    { name: "Inglés C2 / Bilingüe", color: "#6366F1" },
    { name: "Top Talent", color: "#F59E0B" },
    { name: "Referido Eagerworks", color: "#EC4899" },
    { name: "Disponible Inmediato", color: "#14B8A6" },
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

  // ==========================================================================
  // VACANTES / JOB OPENINGS DE EAGERWORKS
  // ==========================================================================
  const defaultStages = [
    { name: "Revisión Inicial" },
    { name: "Entrevista Técnica" },
    { name: "Entrevista Cultural" },
    { name: "Oferta" },
  ];

  const jobOpening1 = await prisma.jobOpening.create({
    data: {
      name: "Senior Full Stack Developer (Rails & React) - US Partner",
      status: "Open" as JobOpeningStatus,
      stages: defaultStages,
      location: "Montevideo, Uruguay (Híbrido Cordón / Remoto)",
      openingDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      targetClosingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      areaId: areas["Ingeniería Web & Mobile"].id,
      seniorities: { connect: [{ id: seniorities["Senior"].id }] },
      hiringManagers: { connect: [{ id: hm1.id }, { id: hm2.id }] },
    },
  });

  const jobOpening2 = await prisma.jobOpening.create({
    data: {
      name: "Backend Developer (Ruby on Rails) - Fintech Startup",
      status: "Open" as JobOpeningStatus,
      stages: defaultStages,
      location: "Remoto (Uruguay)",
      openingDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      targetClosingDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
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
      stages: defaultStages,
      location: "Montevideo, Uruguay (Híbrido)",
      openingDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      targetClosingDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      areaId: areas["Quality Assurance & Testing"].id,
      seniorities: { connect: [{ id: seniorities["Semi Senior"].id }] },
      hiringManagers: { connect: [{ id: hm2.id }] },
    },
  });

  const jobOpening4 = await prisma.jobOpening.create({
    data: {
      name: "DevOps & Cloud Engineer (AWS) - Cloud Infrastructure",
      status: "Open" as JobOpeningStatus,
      stages: defaultStages,
      location: "Remoto (Uruguay)",
      openingDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      targetClosingDate: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
      areaId: areas["Infraestructura Cloud & DevOps"].id,
      seniorities: { connect: [{ id: seniorities["Senior"].id }] },
      hiringManagers: { connect: [{ id: hm3.id }] },
    },
  });

  const jobOpening5 = await prisma.jobOpening.create({
    data: {
      name: "Frontend Developer (React / Next.js) - E-Commerce Platform",
      status: "Open" as JobOpeningStatus,
      stages: defaultStages,
      location: "Montevideo, Uruguay (Híbrido Cordón)",
      openingDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      targetClosingDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
      areaId: areas["Ingeniería Web & Mobile"].id,
      seniorities: { connect: [{ id: seniorities["Semi Senior"].id }] },
      hiringManagers: { connect: [{ id: hm1.id }, { id: hm3.id }] },
    },
  });

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
      photo: "https://img.a.transfermarkt.technology/portrait/header/369081-1731018042.jpg",
      country: "Uruguay",
      linkedin: "https://www.linkedin.com/in/federico-valverde-uy/",
      englishLevel: "Advanced" as EnglishLevel,
      source: "Inbound" as Source,
      hearAboutUs: "LinkedInJobs" as HearAboutUs,
      title: "Ingeniería en Computación",
      academicInstitution: "Universidad de la República (FING)",
      careerStartYear: 2016,
      careerEndYear: 2021,
      education: "https://utfs.io/f/hR8lYSLGKWIm8zTkVAHLwUYeOQ6Wv9AgquNjF75tzrZyiHn2",
      resume: "https://utfs.io/f/hR8lYSLGKWImSKkk47JEcMHrwDYklgLhf8q64zJvpFdxWQbK",
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
      hiringManagers: { connect: [{ id: hm1.id }] },
    },
  });

  const appFede1 = await prisma.application.create({
    data: {
      applicantId: federico.id,
      jobOpeningId: jobOpening1.id,
      applicationDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
      active: true,
      currentStage: "Entrevista Técnica",
      stageEntryDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      desiredSalary: "$4500 USD",
      availability: "Inmediata",
    },
  });

  const appFede2 = await prisma.application.create({
    data: {
      applicantId: federico.id,
      jobOpeningId: jobOpening2.id,
      applicationDate: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
      active: true,
      currentStage: "Revisión Inicial",
      stageEntryDate: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
      desiredSalary: "$4200 USD",
      availability: "2 semanas de aviso",
    },
  });

  // 14 Actividades para Valverde (permite verificar páginas 1, 2 y 3 con 6 ítems por página - CP-008)
  const fedeActivities = [
    { desc: "Propuesta formal presentada y compartida con el Hiring Manager", daysAgo: 1, jobOp: jobOpening1.id },
    { desc: "Revisión de referencias laborales con CTO de empresa previa en EE.UU.", daysAgo: 2, jobOp: null },
    { desc: "Segunda postulación asociada al proceso de Backend Ruby on Rails", daysAgo: 4, jobOp: jobOpening2.id },
    { desc: "Evaluación de competencias blandas y fit cultural con People Ops", daysAgo: 7, jobOp: jobOpening1.id },
    { desc: "Live coding de arquitectura de microservicios y consultas PostgreSQL completado", daysAgo: 9, jobOp: jobOpening1.id },
    { desc: "Entrevista técnica de diseño de APIs en Ruby on Rails completada con nota sobresaliente", daysAgo: 11, jobOp: jobOpening1.id },
    { desc: "Screening inicial de habilidades y disponibilidad con Recruiter", daysAgo: 13, jobOp: jobOpening1.id },
    { desc: "Certificado de escolaridad de FING validado por el equipo de selección", daysAgo: 15, jobOp: null },
    { desc: "Test técnico automatizado de algoritmos enviado al candidato", daysAgo: 17, jobOp: jobOpening1.id },
    { desc: "Resolución del challenge técnico recibido en repositorio Git", daysAgo: 19, jobOp: jobOpening1.id },
    { desc: "CV recibido y verificado por reclutamiento técnico", daysAgo: 21, jobOp: null },
    { desc: "Contacto inicial establecido a través de LinkedIn Jobs", daysAgo: 23, jobOp: jobOpening1.id },
    { desc: "Perfil preseleccionado para el partner tecnológico de Eagerworks", daysAgo: 25, jobOp: jobOpening1.id },
    { desc: "Postulación recibida en el portal de carreras de Eagerworks", daysAgo: 28, jobOp: jobOpening1.id },
  ];

  for (const act of fedeActivities) {
    await prisma.activity.create({
      data: {
        applicantId: federico.id,
        jobOpeningId: act.jobOp,
        description: act.desc,
        date: new Date(Date.now() - act.daysAgo * 24 * 60 * 60 * 1000),
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
      photo: "https://img.a.transfermarkt.technology/portrait/header/546543-1681827179.jpg",
      country: "Uruguay",
      linkedin: "https://www.linkedin.com/in/darwin-nunez-uy/",
      englishLevel: "Intermediate" as EnglishLevel,
      source: "Referral" as Source,
      hearAboutUs: "Referral" as HearAboutUs,
      title: "Licenciatura en Sistemas",
      academicInstitution: "Universidad ORT Uruguay",
      careerStartYear: 2018,
      careerEndYear: 2023,
      education: "https://utfs.io/f/hR8lYSLGKWImOFI5Tl9NtM6Bb8fsFr1wTAvQYueHk5ic7EDn",
      resume: "https://utfs.io/f/hR8lYSLGKWImJyWLuAduWENHGaTLgeYFv7r2dZABOCXKpxQ3",
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
      hiringManagers: { connect: [{ id: hm1.id }] },
    },
  });

  await prisma.application.create({
    data: {
      applicantId: darwin.id,
      jobOpeningId: jobOpening3.id,
      applicationDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      active: true,
      currentStage: "Revisión Inicial",
      stageEntryDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      desiredSalary: "$3200 USD",
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
      photo: "https://img.a.transfermarkt.technology/portrait/header/264014-1668501221.jpg",
      country: "Uruguay",
      linkedin: "https://www.linkedin.com/in/sergio-rochet-uy/",
      englishLevel: "Advanced" as EnglishLevel,
      source: "Outbound" as Source,
      hearAboutUs: "RecruiterContact" as HearAboutUs,
      title: "Tecnólogo en Informática",
      academicInstitution: "UTU - DGETP / FING",
      careerStartYear: 2012,
      careerEndYear: 2016,
      education: "https://utfs.io/f/hR8lYSLGKWImEe9aoRrHBKiVRmq5Sol8GYveAQhsOF39PgJa",
      resume: "https://utfs.io/f/hR8lYSLGKWImkFphp7omRUN0f2qnh8rKHBCkgIXzYsuEpjDS",
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
      hiringManagers: { connect: [{ id: hm1.id }] },
    },
  });

  // --- CANDIDATO 4: RONALD ARAÚJO ---
  const ronald = await prisma.applicant.create({
    data: {
      name: "Ronald",
      lastName: "Araújo",
      email: "ronald.araujo@eagerworks.uy",
      phone: "+598 99 444 333",
      photo: "https://img.a.transfermarkt.technology/portrait/header/480267-1736431980.jpg",
      country: "Uruguay",
      linkedin: "https://www.linkedin.com/in/ronald-araujo-uy/",
      englishLevel: "Intermediate" as EnglishLevel,
      source: "Inbound" as Source,
      hearAboutUs: "LinkedInJobs" as HearAboutUs,
      title: "Analista en Tecnologías de la Información",
      academicInstitution: "Universidad ORT Uruguay",
      careerStartYear: 2017,
      careerEndYear: 2021,
      education: "https://utfs.io/f/hR8lYSLGKWImQvL7lKShjHLUiJaSAu37prKRqVDtfBbxPIg9",
      resume: "https://utfs.io/f/hR8lYSLGKWImWIaP5xzRPm3IZJpdylh1iKuwMtTzkrcN5Axv",
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
      hiringManagers: { connect: [{ id: hm1.id }, { id: hm2.id }] },
    },
  });

  await prisma.application.create({
    data: {
      applicantId: ronald.id,
      jobOpeningId: jobOpening2.id,
      applicationDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      active: true,
      currentStage: "Entrevista Técnica",
      stageEntryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      desiredSalary: "$3800 USD",
      availability: "Inmediata",
    },
  });

  await prisma.activity.create({
    data: {
      applicantId: ronald.id,
      jobOpeningId: jobOpening2.id,
      description: "Entrevista técnica de arquitectura y RSpec completada con buen desempeño",
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
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
      photo: "https://img.a.transfermarkt.technology/portrait/header/476701-1715107512.jpg",
      country: "Uruguay",
      linkedin: "https://www.linkedin.com/in/manuel-ugarte-uy/",
      englishLevel: "Advanced" as EnglishLevel,
      source: "Inbound" as Source,
      hearAboutUs: "JobBoard" as HearAboutUs,
      title: "Licenciatura en Informática",
      academicInstitution: "Universidad Católica del Uruguay (UCU)",
      careerStartYear: 2019,
      careerEndYear: 2023,
      education: "https://utfs.io/f/hR8lYSLGKWIm9bHNWVgyuagNQHpOEf7RZeL4IAjFtmoU6vK1",
      resume: "https://utfs.io/f/hR8lYSLGKWImfwGqhISfu8Kth6YjTSgR72dGzlyXbwqoIaPe",
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
      hiringManagers: { connect: [{ id: hm2.id }] }, // Asignado SOLO a Diego Alonso
    },
  });

  await prisma.application.create({
    data: {
      applicantId: ugarte.id,
      jobOpeningId: jobOpening2.id,
      applicationDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      active: true,
      currentStage: "Revisión Inicial",
      stageEntryDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      desiredSalary: "$3500 USD",
      availability: "Inmediata",
    },
  });

  await prisma.activity.create({
    data: {
      applicantId: ugarte.id,
      jobOpeningId: jobOpening2.id,
      description: "Postulación recibida y screening preliminar realizado por Diego Alonso",
      date: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
    },
  });

  // --- CANDIDATO 6: RODRIGO BENTANCUR ---
  const bentancur = await prisma.applicant.create({
    data: {
      name: "Rodrigo",
      lastName: "Bentancur",
      email: "rodrigo.bentancur@eagerworks.uy",
      phone: "+598 99 777 888",
      photo: "https://img.a.transfermarkt.technology/portrait/header/354362-1740605779.jpg",
      country: "Uruguay",
      linkedin: "https://www.linkedin.com/in/rodrigo-bentancur-uy/",
      englishLevel: "Native" as EnglishLevel,
      source: "Referral" as Source,
      hearAboutUs: "Referral" as HearAboutUs,
      title: "Ingeniería en Computación",
      academicInstitution: "Universidad de Montevideo (UM)",
      careerStartYear: 2014,
      careerEndYear: 2019,
      education: "https://utfs.io/f/hR8lYSLGKWIm85pX47HLwUYeOQ6Wv9AgquNjF75tzrZyiHn2",
      resume: "https://utfs.io/f/hR8lYSLGKWIm9SSoj7NgyuagNQHpOEf7RZeL4IAjFtmoU6vK",
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
      hiringManagers: { connect: [{ id: hm1.id }, { id: hm2.id }] },
    },
  });

  await prisma.application.create({
    data: {
      applicantId: bentancur.id,
      jobOpeningId: jobOpening1.id,
      applicationDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
      active: true,
      currentStage: "Entrevista Cultural",
      stageEntryDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      desiredSalary: "$6000 USD",
      availability: "1 mes de aviso",
    },
  });

  await prisma.activity.create({
    data: {
      applicantId: bentancur.id,
      jobOpeningId: jobOpening1.id,
      description: "Entrevista técnica de arquitectura aprobada unánimemente",
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
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
      photo: "https://img.a.transfermarkt.technology/portrait/header/676318-1785512941.png",
      country: "Uruguay",
      linkedin: "https://www.linkedin.com/in/facundo-pellistri-uy/",
      englishLevel: "Advanced" as EnglishLevel,
      source: "Inbound" as Source,
      hearAboutUs: "LinkedInPost" as HearAboutUs,
      title: "Licenciatura en Tecnologías de la Información",
      academicInstitution: "Universidad Tecnológica del Uruguay (UTEC)",
      careerStartYear: 2019,
      careerEndYear: 2023,
      education: "https://utfs.io/f/hR8lYSLGKWImzc21Z0iBm4FATwCEZPelHW5gDXhqv6SLNbR0",
      resume: "https://utfs.io/f/hR8lYSLGKWImIzraN4bpXfrbtxsdoSUny6CElHeq083cIZAM",
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
      hiringManagers: { connect: [{ id: hm1.id }, { id: hm3.id }] },
    },
  });

  await prisma.application.create({
    data: {
      applicantId: pellistri.id,
      jobOpeningId: jobOpening5.id,
      applicationDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      active: true,
      currentStage: "Revisión Inicial",
      stageEntryDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      desiredSalary: "$3400 USD",
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
      photo: "https://img.a.transfermarkt.technology/portrait/header/397458-1719565799.jpg",
      country: "Uruguay",
      linkedin: "https://www.linkedin.com/in/nicolas-delacruz-uy/",
      englishLevel: "Intermediate" as EnglishLevel,
      source: "Inbound" as Source,
      hearAboutUs: "LinkedInJobs" as HearAboutUs,
      title: "Analista Programador",
      academicInstitution: "Universidad ORT Uruguay",
      careerStartYear: 2017,
      careerEndYear: 2020,
      education: "https://utfs.io/f/hR8lYSLGKWImCv1ruTxkAHnNfe7dxwumv3OEPpKIY41cXlJz",
      resume: "https://utfs.io/f/hR8lYSLGKWImIKJ2jUbpXfrbtxsdoSUny6CElHeq083cIZAM",
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
      hiringManagers: { connect: [{ id: hm1.id }] },
    },
  });

  await prisma.application.create({
    data: {
      applicantId: delacruz.id,
      jobOpeningId: jobOpening1.id,
      applicationDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      active: true,
      currentStage: "Entrevista Técnica",
      stageEntryDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      desiredSalary: "$4300 USD",
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
      photo: "https://img.a.transfermarkt.technology/portrait/header/376514-1681910576.jpg",
      country: "Uruguay",
      linkedin: "https://www.linkedin.com/in/mathias-olivera-uy/",
      englishLevel: "Advanced" as EnglishLevel,
      source: "Outbound" as Source,
      hearAboutUs: "RecruiterContact" as HearAboutUs,
      title: "Ingeniería en Telecomunicaciones",
      academicInstitution: "Universidad Católica del Uruguay (UCU)",
      careerStartYear: 2015,
      careerEndYear: 2020,
      education: "https://utfs.io/f/hR8lYSLGKWImjWthrNZ6I7B2qH4DTo0CAaezXrkYntOJN8ux",
      resume: "https://utfs.io/f/hR8lYSLGKWIm135PqAjFocWOCMilxSKvI6ygLh3w5ubHNEZa",
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
      hiringManagers: { connect: [{ id: hm3.id }] }, // Asignado a Jorge Bava (hm3)
    },
  });

  await prisma.application.create({
    data: {
      applicantId: olivera.id,
      jobOpeningId: jobOpening4.id,
      applicationDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      active: true,
      currentStage: "Revisión Inicial",
      stageEntryDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      desiredSalary: "$4800 USD",
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
      photo: "https://img.a.transfermarkt.technology/portrait/header/572675-1773786535.jpg",
      country: "Uruguay",
      linkedin: "https://www.linkedin.com/in/maxi-araujo-uy/",
      englishLevel: "Intermediate" as EnglishLevel,
      source: "Inbound" as Source,
      hearAboutUs: "InternetSearch" as HearAboutUs,
      title: "Tecnólogo en Informática",
      academicInstitution: "UTU - DGETP / FING",
      careerStartYear: 2018,
      careerEndYear: 2022,
      education: "https://utfs.io/f/hR8lYSLGKWImA0evDbVdlcznVbQr9gGEW3hHLN5X7KtkPqfM",
      resume: "https://utfs.io/f/hR8lYSLGKWImsvkHz46aXmYEGTqbd4oJ73A05Z1WuRpPOnhw",
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
      hiringManagers: { connect: [{ id: hm1.id }, { id: hm2.id }] },
    },
  });

  await prisma.application.create({
    data: {
      applicantId: maxi.id,
      jobOpeningId: jobOpening1.id,
      applicationDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      active: true,
      currentStage: "Revisión Inicial",
      stageEntryDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      desiredSalary: "$3600 USD",
      availability: "Inmediata",
    },
  });

  // ==========================================================================
  // ENTREVISTAS Y NOTAS DE EJEMPLO
  // ==========================================================================
  await prisma.interview.create({
    data: {
      name: "Evaluación Técnica de Arquitectura Ruby on Rails",
      duration: 60,
      modality: "VideoCall" as InterviewType,
      date: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
      status: "Completed" as InterviewStatus,
      summary: "Excelente solvencia en arquitectura de software, ActiveRecord, diseño de APIs y fit cultural.",
      applicantId: federico.id,
      jobOpeningId: jobOpening1.id,
      interviewers: { connect: [{ id: hm1.id }] },
    },
  });

  await prisma.applicantNote.create({
    data: {
      content: "Excelente perfil técnico, experiencia sólida en proyectos de escala y muy buen nivel de inglés.",
      applicantId: federico.id,
      lastModifiedById: hm1.id,
    },
  });

  await prisma.applicantNote.create({
    data: {
      content: "Candidato referido con muy buenas referencias en testing automatizado y calidad de software.",
      applicantId: darwin.id,
      lastModifiedById: admin1.id,
    },
  });

  console.log(
    "Seed completado exitosamente: 6 usuarios (3 Recruiters, 3 Hiring Managers), 9 roles IT Eagerworks, 5 áreas, 4 seniorities, 20 tags, 5 vacantes, 10 candidatos uruguayos con fotos de Transfermarkt y PDFs reales de CV/Escolaridad en UploadThing."
  );
=======
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

<<<<<<< HEAD
>>>>>>> f0b1168 (Prisma tables)
=======
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
  const sources: Source[] = ["LinkedIn", "Website", "Outbound", "Referral", "JobBoard"];
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
>>>>>>> c0733ed (chore: seeding)
}
