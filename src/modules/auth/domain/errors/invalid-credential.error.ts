export class InvalidCredentialError extends Error {
    constructor() {
        super("Invalid credentials provided.");
        this.name = "InvalidCredentialError";
    }
}