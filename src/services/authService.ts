import { User } from '../types';

// Simulating AWS Cognito authentication service
class AuthService {
  private users: User[] = [
    {
      id: 'teacher-1',
      email: 'teacher@lambdallearn.com',
      name: 'Dr. Sarah Johnson',
      role: 'teacher',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'student-1',
      email: 'student@lambdallearn.com',
      name: 'Alex Rodriguez',
      role: 'student',
      createdAt: new Date().toISOString(),
    },
  ];

  constructor() {
    // Load users from localStorage if they exist
    const savedUsers = localStorage.getItem('lambdallearn_users');
    if (savedUsers) {
      this.users = JSON.parse(savedUsers);
    }
  }

  private saveUsers() {
    localStorage.setItem('lambdallearn_users', JSON.stringify(this.users));
  }

  async login(email: string, password: string): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = this.users.find(u => u.email === email);
    if (!user) {
      throw new Error('User not found');
    }
    
    // For demo accounts, use password123
    // For newly created accounts, use the actual password (stored in a real app, this would be hashed)
    const isValidPassword = password === 'password123' || 
                           (user as any).password === password;
    
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }
    
    localStorage.setItem('lambdallearn_user', JSON.stringify(user));
    return user;
  }

  async signup(email: string, password: string, name: string, role: 'teacher' | 'student'): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (this.users.find(u => u.email === email)) {
      throw new Error('User already exists');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    const newUser: User & { password?: string } = {
      id: `${role}-${Date.now()}`,
      email,
      name,
      role,
      createdAt: new Date().toISOString(),
      password, // In real implementation, this would be hashed
    };

    this.users.push(newUser);
    this.saveUsers();
    
    // Remove password before storing in session
    const { password: _, ...userWithoutPassword } = newUser;
    localStorage.setItem('lambdallearn_user', JSON.stringify(userWithoutPassword));
    return userWithoutPassword;
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('lambdallearn_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  logout(): void {
    localStorage.removeItem('lambdallearn_user');
  }
}

export const authService = new AuthService();