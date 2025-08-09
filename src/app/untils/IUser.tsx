export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  role?: number | string;
  createdAt: string;
  authType?: string;
  resetPasswordCount?: number;
  point?: number;
  rank?: string;
  updatedAt?: string;
  avatar?: string;
  gender?: string;
}
