import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

interface JobAttributes {
  id: number;
  name: string;
  payload: Record<string, unknown>;
  priority: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  attempts: number;
  maxAttempts: number;
  error: string | null;
  scheduledAt: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
}
type JobCreation = Optional<JobAttributes, 'id' | 'payload' | 'priority' | 'status' | 'attempts' | 'maxAttempts' | 'error' | 'scheduledAt' | 'startedAt' | 'completedAt'>;

class Job extends Model<JobAttributes, JobCreation> implements JobAttributes {
  declare id: number;
  declare name: string;
  declare payload: Record<string, unknown>;
  declare priority: number;
  declare status: 'pending' | 'running' | 'completed' | 'failed';
  declare attempts: number;
  declare maxAttempts: number;
  declare error: string | null;
  declare scheduledAt: Date | null;
  declare startedAt: Date | null;
  declare completedAt: Date | null;
}

Job.init({
  id:          { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name:        { type: DataTypes.STRING, allowNull: false },
  payload:     { type: DataTypes.JSON, defaultValue: {} },
  priority:    { type: DataTypes.INTEGER, defaultValue: 2 },
  status:      { type: DataTypes.ENUM('pending', 'running', 'completed', 'failed'), defaultValue: 'pending' },
  attempts:    { type: DataTypes.INTEGER, defaultValue: 0 },
  maxAttempts: { type: DataTypes.INTEGER, defaultValue: 3 },
  error:       { type: DataTypes.TEXT, allowNull: true },
  scheduledAt: { type: DataTypes.DATE, allowNull: true },
  startedAt:   { type: DataTypes.DATE, allowNull: true },
  completedAt: { type: DataTypes.DATE, allowNull: true },
}, { sequelize, tableName: 'jobs', timestamps: true });

export default Job;
