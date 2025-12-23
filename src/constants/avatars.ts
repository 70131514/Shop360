export type AvatarId =
  | 'admin'
  | 'user'
  | 'm1'
  | 'm2'
  | 'm3'
  | 'm4'
  | 'm5'
  | 'm6'
  | 'm7'
  | 'm8'
  | 'm9'
  | 'w1'
  | 'w2'
  | 'w3'
  | 'w4'
  | 'w5'
  | 'w6'
  | 'w7'
  | 'w8'
  | 'w9';

export const AVATAR_SOURCES: Record<AvatarId, any> = {
  admin: require('../assets/avatars/Admin.png'),
  user: require('../assets/avatars/User.png'),
  m1: require('../assets/avatars/m1.png'),
  m2: require('../assets/avatars/m2.png'),
  m3: require('../assets/avatars/m3.png'),
  m4: require('../assets/avatars/m4.png'),
  m5: require('../assets/avatars/m5.png'),
  m6: require('../assets/avatars/m6.png'),
  m7: require('../assets/avatars/m7.png'),
  m8: require('../assets/avatars/m8.png'),
  m9: require('../assets/avatars/m9.png'),
  w1: require('../assets/avatars/w1.png'),
  w2: require('../assets/avatars/w2.png'),
  w3: require('../assets/avatars/w3.png'),
  w4: require('../assets/avatars/w4.png'),
  w5: require('../assets/avatars/w5.png'),
  w6: require('../assets/avatars/w6.png'),
  w7: require('../assets/avatars/w7.png'),
  w8: require('../assets/avatars/w8.png'),
  w9: require('../assets/avatars/w9.png'),
};

export const SELECTABLE_AVATARS: AvatarId[] = [
  'user',
  'm1',
  'm2',
  'm3',
  'm4',
  'm5',
  'm6',
  'm7',
  'm8',
  'm9',
  'w1',
  'w2',
  'w3',
  'w4',
  'w5',
  'w6',
  'w7',
  'w8',
  'w9',
];

export function resolveAvatarId(params: {
  avatarId?: string | null;
  isGuest: boolean;
  isAdmin: boolean;
}): AvatarId {
  const { avatarId, isGuest, isAdmin } = params;
  if (isAdmin) {
    return 'admin';
  }
  if (isGuest) {
    return 'user';
  }
  const maybe = (avatarId ?? '').trim() as AvatarId;
  if (maybe && (maybe in AVATAR_SOURCES)) {
    return maybe;
  }
  return 'user';
}


