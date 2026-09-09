/** Configurable prototype format, not a claim about every historical EWU ID. */
export const studentIdPolicy = {
  pattern: /^\d{4}-[1-3]-\d{2}-\d{3}$/,
  domain: "std.ewubd.edu",
};
export function parseStudentId(input: string): string | null {
  const normalized = input.trim();
  return studentIdPolicy.pattern.test(normalized) ? normalized : null;
}
export function validateStudentId(input: string): boolean {
  return parseStudentId(input) !== null;
}
export function studentIdToEmail(input: string): string {
  const id = parseStudentId(input);
  if (!id) throw new Error("Use a student ID like 2023-3-60-376.");
  return `${id}@${studentIdPolicy.domain}`;
}
