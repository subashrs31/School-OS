import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

interface FailedJobAttributes {
  id: number;
  name: string;
  payload: Record<string, unknown>;
  priority: number;
  attempts: number;
  maxAttempts: number;
  error: string | null;
  failedAt: Date;
  retryAfter: Date | null;
  resolved: boolean;
}
type FailedJobCreation = Optional<FailedJobAttributes, 'id' | 'payload' | 'priority' | 'attempts' | 'maxAttempts' | 'error' | 'failedAt' | 'retryAfter' | 'resolved'>;

class FailedJob extends Model<FailedJobAttributes, FailedJobCreation> implements FailedJobAttributes {
  declare id: number;
  declare name: string;
  declare payload: Record<string, unknown>;
  declare priority: number;
  declare attempts: number;
  declare maxAttempts: number;
  declare error: string | null;
  declare failedAt: Date;
  declare retryAfter: Date | null;
  declare resolved: boolean;
}

FailedJob.init({
  id:          { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name:        { type: DataTypes.STRING, allowNull: false },
  payload:     { type: DataTypes.JSON, defaultValue: {} },
  priority:    { type: DataTypes.INTEGER, defaultValue: 2 },
  attempts:    { type: DataTypes.INTEGER, defaultValue: 0 },
  maxAttempts: { type: DataTypes.INTEGER, defaultValue: 3 },
  error:       { type: DataTypes.TEXT, allowNull: true },
  failedAt:    { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  retryAfter:  { type: DataTypes.DATE, allowNull: true },
  resolved:    { type: DataTypes.BOOLEAN, defaultValue: false },
}, { sequelize, tableName: 'failed_jobs', timestamps: true });

export default FailedJob;
