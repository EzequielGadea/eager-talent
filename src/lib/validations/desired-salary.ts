const SALARY_REGEX = /^-?\d+(?:[.,]\d+)?$/;

// Returns null when the raw text is not a plain decimal number.
export function parseDesiredSalary(raw: string): number | null {
  const value = raw.trim();

  if (!SALARY_REGEX.test(value)) return null;

  return Number(value.replace(",", "."));
}

type SalaryIssueMessages = {
  invalid: string;
  notPositive: string;
  currencyRequired: string;
  salaryRequired: string;
};

type SalaryIssue = {
  path: "desiredSalary" | "currency";
  message: string;
};

export function getDesiredSalaryIssues(
  data: { desiredSalary?: string; currency?: string },
  messages: SalaryIssueMessages,
): SalaryIssue[] {
  const rawSalary = data.desiredSalary?.trim() ?? "";
  const hasSalary = rawSalary !== "";
  const hasCurrency = data.currency !== undefined;
  const issues: SalaryIssue[] = [];

  if (hasSalary) {
    const amount = parseDesiredSalary(rawSalary);

    if (amount === null) {
      issues.push({ path: "desiredSalary", message: messages.invalid });
    } else if (amount <= 0) {
      issues.push({ path: "desiredSalary", message: messages.notPositive });
    }

    if (!hasCurrency) {
      issues.push({ path: "currency", message: messages.currencyRequired });
    }
  } else if (hasCurrency) {
    issues.push({ path: "desiredSalary", message: messages.salaryRequired });
  }

  return issues;
}

export function toDesiredSalaryAmount(raw: string | undefined) {
  const value = raw?.trim() ?? "";

  return value === "" ? undefined : (parseDesiredSalary(value) ?? undefined);
}
