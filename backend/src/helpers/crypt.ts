import bcrypt from 'bcryptjs';

const crypt = {
  hashPassword: async (password: string, rounds: number): Promise<string> => {
    const salt = await bcrypt.genSalt(Number(rounds));
    return bcrypt.hash(password, salt);
  },
  matchPassword: async (enteredPassword: string, hashedPassword: string): Promise<boolean> => {
    return bcrypt.compare(enteredPassword, hashedPassword);
  },
};

export default crypt;
