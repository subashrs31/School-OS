export const formatUser = (user: { toObject?: () => Record<string, unknown> } & Record<string, unknown>): Record<string, unknown> => {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj['__v'];
  delete obj['isOAuthUser'];
  delete obj['oauthProvider'];
  delete obj['oauthId'];
  delete obj['createdAt'];
  delete obj['updatedAt'];
  return obj;
};
