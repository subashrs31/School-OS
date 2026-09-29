'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id:                      { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      uuid:                    { type: Sequelize.STRING, allowNull: false, unique: true },
      name:                    { type: Sequelize.STRING, allowNull: true },
      email:                   { type: Sequelize.STRING, allowNull: true, unique: true },
      password:                { type: Sequelize.STRING, allowNull: true },
      pwdResetStatus:          { type: Sequelize.BOOLEAN, defaultValue: false },
      lastLogin:               { type: Sequelize.DATE, allowNull: true },
      createdById:             { type: Sequelize.INTEGER, allowNull: true },
      verificationTokenHash:   { type: Sequelize.STRING, allowNull: true },
      verificationTokenExpiry: { type: Sequelize.DATE, allowNull: true },
      resetTokenHash:          { type: Sequelize.STRING, allowNull: true },
      resetTokenExpiry:        { type: Sequelize.DATE, allowNull: true },
      verifiedAt:              { type: Sequelize.DATE, allowNull: true },
      isActive:                { type: Sequelize.BOOLEAN, defaultValue: true },
      deletedAt:               { type: Sequelize.DATE, allowNull: true },
      createdAt:               { type: Sequelize.DATE, allowNull: false },
      updatedAt:               { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.removeIndex('users', 'users_uuid_unique').catch(() => {});
    await queryInterface.addIndex('users', ['uuid'], { unique: true, name: 'users_uuid_unique' });

    await queryInterface.createTable('roles', {
      id:          { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name:        { type: Sequelize.STRING, allowNull: false },
      slug:        { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.STRING, defaultValue: '' },
      roleType:    { type: Sequelize.ENUM('primary', 'secondary', 'normal'), defaultValue: 'normal', allowNull: false },
      isSystem:    { type: Sequelize.BOOLEAN, defaultValue: false },
      isActive:    { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt:   { type: Sequelize.DATE, allowNull: false },
      updatedAt:   { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.removeIndex('roles', 'roles_slug_unique').catch(() => {});
    await queryInterface.addIndex('roles', ['slug'], { unique: true, name: 'roles_slug_unique' });

    await queryInterface.createTable('permissions', {
      id:          { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name:        { type: Sequelize.STRING, allowNull: false },
      slug:        { type: Sequelize.STRING, allowNull: false },
      resource:    { type: Sequelize.STRING, allowNull: false },
      action:      { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.STRING, defaultValue: '' },
      isSystem:    { type: Sequelize.BOOLEAN, defaultValue: false },
      isActive:    { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt:   { type: Sequelize.DATE, allowNull: false },
      updatedAt:   { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.removeIndex('permissions', 'permissions_resource_action').catch(() => {});
    await queryInterface.addIndex('permissions', ['resource', 'action'], { unique: true, name: 'permissions_resource_action' });

    await queryInterface.createTable('user_has_roles', {
      id:         { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      userId:     { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      roleId:     { type: Sequelize.INTEGER, allowNull: false, references: { model: 'roles', key: 'id' }, onDelete: 'CASCADE' },
      isActive:   { type: Sequelize.BOOLEAN, defaultValue: true },
      expiresAt:  { type: Sequelize.DATE, allowNull: true },
      scopeType:  { type: Sequelize.ENUM('global', 'organization'), defaultValue: 'global', allowNull: false },
      scopeId:    { type: Sequelize.INTEGER, allowNull: true, defaultValue: null },
      assignedBy: { type: Sequelize.INTEGER, allowNull: true },
      createdAt:  { type: Sequelize.DATE, allowNull: false },
      updatedAt:  { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.removeIndex('user_has_roles', 'user_has_roles_userid_roleid_scope').catch(() => {});
    await queryInterface.addIndex('user_has_roles', ['userId', 'roleId', 'scopeType', 'scopeId'], { unique: true, name: 'user_has_roles_userid_roleid_scope' });

    await queryInterface.createTable('role_has_permissions', {
      id:           { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      roleId:       { type: Sequelize.INTEGER, allowNull: false, references: { model: 'roles', key: 'id' }, onDelete: 'CASCADE' },
      permissionId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'permissions', key: 'id' }, onDelete: 'CASCADE' },
      createdAt:    { type: Sequelize.DATE, allowNull: false },
      updatedAt:    { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.removeIndex('role_has_permissions', 'role_has_permissions_roleid_permissionid').catch(() => {});
    await queryInterface.addIndex('role_has_permissions', ['roleId', 'permissionId'], { unique: true, name: 'role_has_permissions_roleid_permissionid' });

    await queryInterface.createTable('user_has_permissions', {
      id:           { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      userId:       { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      permissionId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'permissions', key: 'id' }, onDelete: 'CASCADE' },
      effect:       { type: Sequelize.ENUM('allow', 'deny'), allowNull: false },
      scopeType:    { type: Sequelize.ENUM('global', 'organization'), defaultValue: 'global' },
      scopeId:      { type: Sequelize.INTEGER, allowNull: true },
      expiresAt:    { type: Sequelize.DATE, allowNull: true },
      assignedBy:   { type: Sequelize.INTEGER, allowNull: true },
      remarks:      { type: Sequelize.STRING, defaultValue: '' },
      isActive:     { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt:    { type: Sequelize.DATE, allowNull: false },
      updatedAt:    { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.removeIndex('user_has_permissions', 'user_has_permissions_userid_permissionid_scope').catch(() => {});
    await queryInterface.addIndex('user_has_permissions', ['userId', 'permissionId', 'scopeType', 'scopeId'], { unique: true, name: 'user_has_permissions_userid_permissionid_scope' });

    await queryInterface.createTable('user_oauth_accounts', {
      id:                { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      userId:            { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      provider:          { type: Sequelize.STRING, allowNull: true },
      providerAccountId: { type: Sequelize.STRING, allowNull: true },
      createdAt:         { type: Sequelize.DATE, allowNull: false },
      updatedAt:         { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.removeIndex('user_oauth_accounts', 'user_oauth_accounts_provider_accountid').catch(() => {});
    await queryInterface.addIndex('user_oauth_accounts', ['provider', 'providerAccountId'], { name: 'user_oauth_accounts_provider_accountid' });

    await queryInterface.createTable('notifications', {
      id:         { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      userId:     { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      title:      { type: Sequelize.STRING, allowNull: false },
      message:    { type: Sequelize.TEXT, allowNull: false },
      type:       { type: Sequelize.STRING, defaultValue: 'info' },
      readAt:     { type: Sequelize.DATE, allowNull: true },
      navigateTo: { type: Sequelize.STRING, allowNull: true },
      data:       { type: Sequelize.JSON, defaultValue: {} },
      createdAt:  { type: Sequelize.DATE, allowNull: false },
      updatedAt:  { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('jobs', {
      id:          { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name:        { type: Sequelize.STRING, allowNull: false },
      payload:     { type: Sequelize.JSON, defaultValue: {} },
      priority:    { type: Sequelize.INTEGER, defaultValue: 2 },
      status:      { type: Sequelize.ENUM('pending', 'running', 'completed', 'failed'), defaultValue: 'pending' },
      attempts:    { type: Sequelize.INTEGER, defaultValue: 0 },
      maxAttempts: { type: Sequelize.INTEGER, defaultValue: 3 },
      error:       { type: Sequelize.TEXT, allowNull: true },
      scheduledAt: { type: Sequelize.DATE, allowNull: true },
      startedAt:   { type: Sequelize.DATE, allowNull: true },
      completedAt: { type: Sequelize.DATE, allowNull: true },
      createdAt:   { type: Sequelize.DATE, allowNull: false },
      updatedAt:   { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('failed_jobs', {
      id:          { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name:        { type: Sequelize.STRING, allowNull: false },
      payload:     { type: Sequelize.JSON, defaultValue: {} },
      priority:    { type: Sequelize.INTEGER, defaultValue: 2 },
      attempts:    { type: Sequelize.INTEGER, defaultValue: 0 },
      maxAttempts: { type: Sequelize.INTEGER, defaultValue: 3 },
      error:       { type: Sequelize.TEXT, allowNull: true },
      failedAt:    { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      retryAfter:  { type: Sequelize.DATE, allowNull: true },
      resolved:    { type: Sequelize.BOOLEAN, defaultValue: false },
      createdAt:   { type: Sequelize.DATE, allowNull: false },
      updatedAt:   { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('failed_jobs');
    await queryInterface.dropTable('jobs');
    await queryInterface.dropTable('notifications');
    await queryInterface.dropTable('user_oauth_accounts');
    await queryInterface.dropTable('user_has_permissions');
    await queryInterface.dropTable('role_has_permissions');
    await queryInterface.dropTable('user_has_roles');
    await queryInterface.dropTable('permissions');
    await queryInterface.dropTable('roles');
    await queryInterface.dropTable('users');
  },
};
