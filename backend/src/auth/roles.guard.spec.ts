import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  const makeContext = (role?: Role) =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({ getRequest: () => ({ user: role ? { role } : undefined }) }),
    }) as unknown as ExecutionContext;

  it('allows public routes and users with a required role', () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue([Role.ADMIN]) } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(makeContext(Role.ADMIN))).toBe(true);
    expect(guard.canActivate(makeContext(Role.CUSTOMER))).toBe(false);
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);
    expect(guard.canActivate(makeContext())).toBe(true);
  });
});
