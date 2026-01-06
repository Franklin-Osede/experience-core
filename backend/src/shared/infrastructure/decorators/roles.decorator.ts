import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../../modules/identity/domain/user-role.enum';
import { ROLES_KEY } from '../guards/roles.guard';

/**
 * Decorator to specify which roles are allowed to access an endpoint
 * Must be used with @UseGuards(AuthGuard('jwt'), RolesGuard)
 *
 * @example
 * @Post('venues/availability')
 * @UseGuards(AuthGuard('jwt'), RolesGuard)
 * @Roles(UserRole.VENUE)
 * async postAvailability() { ... }
 *
 * @example
 * @Post('gigs/apply')
 * @UseGuards(AuthGuard('jwt'), RolesGuard)
 * @Roles(UserRole.DJ)
 * async applyToGig() { ... }
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

