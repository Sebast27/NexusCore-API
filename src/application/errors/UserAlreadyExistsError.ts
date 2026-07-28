

export class UserAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`El usuario con email ${email} ya existe`);
    this.name = 'UserAlreadyExistsError';
    Object.setPrototypeOf(this, UserAlreadyExistsError.prototype);
  }
}