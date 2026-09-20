import { createAccessControl } from "better-auth/plugins/access";
import {
  adminAc,
  defaultStatements,
  memberAc,
  ownerAc,
} from "better-auth/plugins/organization/access";

const CRUD = ["read", "create", "update", "delete"] as const;

export const accessStatements = {
  activity: CRUD,
  publicLink: CRUD,
  jobRole: CRUD,
  area: CRUD,
  seniority: CRUD,
  tag: CRUD,
  stageTemplate: CRUD,
  user: CRUD,

  // Entities with assigned scoping
  applicant: [...CRUD, "readAssigned"],
  application: [...CRUD, "readAssigned"],
  jobOpening: [...CRUD, "readAssigned"],
  interview: [...CRUD, "readAssigned"],
  applicantNote: [...CRUD, "readAssigned"],
  interviewNote: [...CRUD, "readAssigned", "createAssigned", "updateAssigned"],
} as const;

export const ac = createAccessControl({
  ...defaultStatements,
  ...accessStatements,
});

export const owner = ac.newRole({ ...ownerAc.statements, ...accessStatements });
export const admin = ac.newRole({ ...adminAc.statements, ...accessStatements });
export const member = ac.newRole(memberAc.statements);

export const recruiter = ac.newRole({
  ...adminAc.statements,
  ...accessStatements,
});

export const hiringManager = ac.newRole({
  ...memberAc.statements,
  activity: ["read"],
  applicant: ["readAssigned"],
  application: ["readAssigned"],
  jobOpening: ["readAssigned"],
  interview: ["readAssigned"],
  applicantNote: ["readAssigned"],
  interviewNote: ["readAssigned", "createAssigned", "updateAssigned"],
});

export const roles = { owner, admin, member, recruiter, hiringManager };
