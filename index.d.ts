/* eslint-disable prettier/prettier */

import { Mongoose } from 'mongoose';
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
        _id: Mongoose.Types.ObjectId;
        user: User;
        bussinessName: string;
        bussinessLicense: string;
        bussinessLicenseExp: Date;
        displayName: string;
        merchantRating: number;
        isVerified: boolean;
        accountStatus: accountStatus;
      };
      sCustId?: string;
    }

    interface Request {
      authInfo?: AuthInfo | undefined;
      user?: User | undefined;
    }
  }
}
