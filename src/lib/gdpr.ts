"server-only";

// GDPR Art. 20 (export) and Art. 17 (erasure / anonymisation).
// Implementation filled in during the GDPR step.

export async function exportUserData(_userId: string): Promise<object> {
  throw new Error("Not yet implemented");
}

export async function anonymizeUser(_userId: string): Promise<void> {
  throw new Error("Not yet implemented");
}
