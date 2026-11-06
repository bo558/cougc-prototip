/** Kullanıcıya gösterilebilir iş kuralı hatası (ör. "revize hakkınız doldu") */
export class UserError extends Error {}
export const errorMessage = (e: unknown) => (e instanceof UserError ? e.message : 'Bir hata oluştu');
