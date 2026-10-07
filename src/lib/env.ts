const TRUTHY_FLAGS = new Set(["true", "1", "yes"]);

export function isEnvFlagOn(value: string | undefined): boolean {
  return TRUTHY_FLAGS.has((value ?? "").trim().toLowerCase());
}
