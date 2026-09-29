import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

interface NotificationAttributes {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  readAt: Date | null;
  navigateTo: string | null;
  data: Record<string, unknown>;
}
type NotificationCreation = Optional<NotificationAttributes, 'id' | 'type' | 'readAt' | 'navigateTo' | 'data'>;

class Notification extends Model<NotificationAttributes, NotificationCreation> implements NotificationAttributes {
  declare id: number;
  declare userId: number;
  declare title: string;
  declare message: string;
  declare type: string;
  declare readAt: Date | null;
  declare navigateTo: string | null;
  declare data: Record<string, unknown>;
}

Notification.init({
  id:         { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId:     { type: DataTypes.INTEGER, allowNull: false },
  title:      { type: DataTypes.STRING, allowNull: false },
  message:    { type: DataTypes.TEXT, allowNull: false },
  type:       { type: DataTypes.STRING, defaultValue: 'info' },
  readAt:     { type: DataTypes.DATE, allowNull: true, defaultValue: null },
  navigateTo: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
  data:       { type: DataTypes.JSON, defaultValue: {} },
}, { sequelize, tableName: 'notifications', timestamps: true });

export default Notification;
