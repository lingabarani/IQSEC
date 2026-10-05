import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'Presales Lead' | 'Proposal Director' | 'Compliance Lead' | 'Solution Architect';
  avatarInitials: string;
}

export const DEMO_USERS: UserProfile[] = [
  {
    id: 'user_1',
    name: 'Alejandro Ruiz',
    email: 'alejandro.ruiz@iqsec.com',
    role: 'Presales Lead',
    avatarInitials: 'AR'
  },
  {
    id: 'user_2',
    name: 'Lic. M. Peralta',
    email: 'm.peralta@iqsec.com',
    role: 'Proposal Director',
    avatarInitials: 'MP'
  },
  {
    id: 'user_3',
    name: 'Carlos Mendez',
    email: 'carlos.mendez@iqsec.com',
    role: 'Compliance Lead',
    avatarInitials: 'CM'
  }
];

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: UserProfile | null;
  login: (email: string, password?: string) => boolean;
  signup: (name: string, email: string, role: UserProfile['role'], password?: string) => boolean;
  logout: () => void;
  switchUser: (user: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('iqsec_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEMO_USERS[0];
      }
    }
    return DEMO_USERS[0]; // Default logged-in as Presales Lead
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('iqsec_authenticated') !== 'false';
  });

  const login = (email: string): boolean => {
    const found = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    const userToLogin = found || {
      id: `user_${Date.now()}`,
      name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      email,
      role: 'Presales Lead' as const,
      avatarInitials: email.substring(0, 2).toUpperCase()
    };

    setCurrentUser(userToLogin);
    setIsAuthenticated(true);
    localStorage.setItem('iqsec_user', JSON.stringify(userToLogin));
    localStorage.setItem('iqsec_authenticated', 'true');
    return true;
  };

  const signup = (name: string, email: string, role: UserProfile['role']): boolean => {
    const initials = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'IQ';

    const newUser: UserProfile = {
      id: `user_${Date.now()}`,
      name,
      email,
      role,
      avatarInitials: initials
    };

    setCurrentUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('iqsec_user', JSON.stringify(newUser));
    localStorage.setItem('iqsec_authenticated', 'true');
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('iqsec_authenticated', 'false');
  };

  const switchUser = (user: UserProfile) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('iqsec_user', JSON.stringify(user));
    localStorage.setItem('iqsec_authenticated', 'true');
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        login,
        signup,
        logout,
        switchUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
