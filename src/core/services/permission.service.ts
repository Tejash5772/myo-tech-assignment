import { Injectable, signal } from '@angular/core';

export type Role = 'ADMIN' | 'USER';

@Injectable({
    providedIn: 'root'
})
export class PermissionService {

    private readonly roleSignal = signal<Role>('ADMIN');

    readonly role = this.roleSignal.asReadonly();

    setRole(role: Role): void {
        this.roleSignal.set(role);
    }

    hasRole(requiredRole: Role): boolean {
        return this.roleSignal() === requiredRole;
    }

    hasPermission(permission: string): boolean {

        const role = this.roleSignal();

        if (role === 'ADMIN') {
            return true;
        }

        const userPermissions: Record<string, string[]> = {
            USER: [
                'READ'
            ]
        };

        return userPermissions[role]?.includes(permission) ?? false;
    }
}