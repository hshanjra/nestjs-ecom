/* eslint-disable prettier/prettier */

import { Role } from 'src/api/auth/enums';

enum accountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
}

declare global {
  namespace Express {
    interface User {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      password: string;
      roles: Role;
      isEmailVerified: boolean;
      status: accountStatus;
      merchant?: {
        user: User;
        bussinessName: string;
        bussinessLicense: string;
        bussinessLicenseExp: Date;
        displayName: string;
        merchantRating: number;
        isVerified: boolean;
        accountStatus: accountStatus;
      };
    }

    interface Request {
      authInfo?: AuthInfo | undefined;
      user?: User | undefined;
    }
  }
}
