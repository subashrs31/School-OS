import sequelize from './sequelize';
import '../models/index';

export const connectDB = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('MySQL connected successfully');
  } catch (err) {
    console.error('Error connecting to MySQL:', (err as Error).message);
    process.exit(1);
  }
};

export { sequelize };
