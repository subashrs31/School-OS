import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/sequelize';

interface UserOAuthAccountAttributes {
  id: number;
  userId: number;
  provider: string | null;
  providerAccountId: string | null;
}
type UserOAuthAccountCreation = Optional<UserOAuthAccountAttributes, 'id' | 'provider' | 'providerAccountId'>;

class UserOAuthAccount extends Model<UserOAuthAccountAttributes, UserOAuthAccountCreation> implements UserOAuthAccountAttributes {
  declare id: number;
  declare userId: number;
  declare provider: string | null;
  declare providerAccountId: string | null;
}

UserOAuthAccount.init({
  id:                { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId:            { type: DataTypes.INTEGER, allowNull: false },
  provider:          { type: DataTypes.STRING, allowNull: true },
  providerAccountId: { type: DataTypes.STRING, allowNull: true },
}, {
  sequelize,
  tableName: 'user_oauth_accounts',
  timestamps: true,
  indexes: [{ fields: ['provider', 'providerAccountId'] }],
});

export default UserOAuthAccount;
