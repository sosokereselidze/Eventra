export function toPublicUser(u) {
  if (!u) return null;
  return { 
    id: u.id || u._id?.toString(), 
    email: u.email, 
    username: u.username, 
    name: u.name, 
    isAdmin: !!u.isAdmin 
  };
}
