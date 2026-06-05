// Shared auth helpers — password hashing + JWT issuance + safe user shape.
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10;

export const hashPassword = (plain) => bcrypt.hash(plain, SALT_ROUNDS);

export const comparePassword = (plain, hash) => bcrypt.compare(plain, hash);

// Sign an 8h token. role is 'teacher' | 'student'. Never omit expiry.
export const signToken = ({ id, role }) =>
  jwt.sign({ id: String(id), role }, process.env.JWT_SECRET, { expiresIn: '8h' });

// The user shape the frontend expects on the login/register response: { id, name, role }.
export const publicUser = (doc, role) => ({
  id: String(doc._id),
  name: doc.name,
  role
});
