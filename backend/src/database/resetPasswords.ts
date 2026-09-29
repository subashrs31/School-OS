import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/db';
import { User } from '../models/index';

const DEFAULT_PASSWORD = '12345678';

(async () => {
  try {
    await sequelize.authenticate();
    const hash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    const [count] = await User.update({ password: hash }, { where: { deletedAt: null }, individualHooks: false });
    console.log(`Done. Reset ${count} users to: ${DEFAULT_PASSWORD}`);
  } catch (err) {
    console.error('Error:', (err as Error).message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
})();
