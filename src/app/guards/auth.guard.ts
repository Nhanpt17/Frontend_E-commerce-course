import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserstorageService } from '../services/storage/userstorage.service';

export const authGuard: CanActivateFn = (route, state) => {

  
  const router = inject(Router);
  const userRole = UserstorageService.getUserRole();


  const allowedRoles = route.data['roles'] as string[];
  const excludedRoles = route.data['rolesExclude'] as string[];

  //  Nếu có danh sách bị loại (không được vào)
  if (excludedRoles && excludedRoles.includes(userRole)) {
    router.navigate(['/unauthorized']);
    return false;
  }

  //  Nếu có danh sách cho phép (chỉ được vào nếu đúng role)
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    router.navigate(['/unauthorized']);
    return false;
  }

  return true;
};
