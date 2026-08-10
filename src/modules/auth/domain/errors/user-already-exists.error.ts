export class UserAlreadyExistsError extends Error {
  constructor() {
    super("USER_ALREADY_EXISTS");
    this.name = "UserAlreadyExistsError";
  }
}
