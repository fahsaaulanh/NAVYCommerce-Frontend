export const PASSWORD_MIN_LENGTH = 10;
export const PASSWORD_MAX_BYTES = 72;

export function getPasswordValidation(password: string) {
  const requirements = [
    {
      id: "length",
      label: `Minimal ${PASSWORD_MIN_LENGTH} karakter`,
      met: password.length >= PASSWORD_MIN_LENGTH,
    },
    {
      id: "uppercase",
      label: "Minimal satu huruf kapital (A–Z)",
      met: /[A-Z]/.test(password),
    },
    {
      id: "symbol",
      label: "Minimal satu simbol, seperti ! @ #",
      met: /[\x21-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E]/.test(password),
    },
  ];

  const byteLength = new TextEncoder().encode(password).length;
  const withinByteLimit = byteLength <= PASSWORD_MAX_BYTES;

  return {
    requirements,
    byteLength,
    withinByteLimit,
    completed: requirements.filter((item) => item.met).length,
    valid: requirements.every((item) => item.met) && withinByteLimit,
  };
}

export type PasswordValidation = ReturnType<typeof getPasswordValidation>;
