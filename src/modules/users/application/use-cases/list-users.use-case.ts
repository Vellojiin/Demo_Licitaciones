import { User } from "@/src/modules/users/domain/entities/user.entity";
import { UserRepository } from "@/src/modules/users/domain/repos/user.repository";

export class ListUsersUseCase {
    constructor(private readonly userRepository: UserRepository) {}

    async execute(): Promise<User[]> {
        return this.userRepository.findAll();
    }
}
