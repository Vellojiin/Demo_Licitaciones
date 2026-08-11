import { UserRepository } from "@/src/modules/users/domain/repos/user.repository";

interface DeleteUserInput {
    id: string;
}

export class DeleteUserUseCase {
    constructor(private readonly userRepository: UserRepository) {}

    async execute(input: DeleteUserInput): Promise<boolean> {
        return this.userRepository.delete(input.id);
    }
}
