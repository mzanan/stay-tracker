export function lastPassportLocked(passportCount: number, stayCount: number): boolean {
  return passportCount === 1 && stayCount > 0;
}
