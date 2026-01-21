import { supabase } from '../lib/supabase';
import { UserRole } from '../types';

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  businessName: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  businessId: string;
}

class AuthService {
  /**
   * Sign up a new user and create their business (they become the OWNER)
   */
  async signUp({ email, password, fullName, businessName }: SignUpData): Promise<AuthUser | null> {
    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');

      const userId = authData.user.id;

      // 2. Create business for this owner
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .insert({
          name: businessName,
          owner_id: userId,
        })
        .select()
        .single();

      if (businessError) throw businessError;

      // 3. Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          business_id: businessData.id,
          email,
          full_name: fullName,
          role: UserRole.OWNER,
        });

      if (profileError) throw profileError;

      // 4. Create default automations for the new business
      await this.createDefaultAutomations(businessData.id);

      return {
        id: userId,
        email,
        fullName,
        role: UserRole.OWNER,
        businessId: businessData.id,
      };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  /**
   * Sign in existing user
   */
  async signIn({ email, password }: SignInData): Promise<AuthUser | null> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Sign in failed');

      // Get profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, role, business_id')
        .eq('id', authData.user.id)
        .single();

      if (profileError) throw profileError;

      return {
        id: authData.user.id,
        email: authData.user.email!,
        fullName: profile.full_name,
        role: profile.role as UserRole,
        businessId: profile.business_id,
      };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  /**
   * Get current session and user info
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;
      if (!session?.user) return null;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, role, business_id')
        .eq('id', session.user.id)
        .single();

      if (profileError) throw profileError;

      return {
        id: session.user.id,
        email: session.user.email!,
        fullName: profile.full_name,
        role: profile.role as UserRole,
        businessId: profile.business_id,
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Listen for auth state changes
   */
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const user = await this.getCurrentUser();
        callback(user);
      } else if (event === 'SIGNED_OUT') {
        callback(null);
      }
    });
  }

  /**
   * Create default automations for a new business
   */
  private async createDefaultAutomations(businessId: string): Promise<void> {
    const defaultAutomations = [
      {
        business_id: businessId,
        label: 'Class Reminder (24h)',
        description: 'Send students a reminder 24 hours before their scheduled class',
        enabled: false,
        type: 'Push' as const,
      },
      {
        business_id: businessId,
        label: 'Welcome Message',
        description: 'Send a welcome message to new students when they join',
        enabled: false,
        type: 'Email' as const,
      },
      {
        business_id: businessId,
        label: 'Payment Reminder',
        description: 'Remind students about upcoming payment due dates',
        enabled: false,
        type: 'WhatsApp' as const,
      },
      {
        business_id: businessId,
        label: 'Re-engagement Campaign',
        description: 'Reach out to inactive students who haven\'t attended in 30 days',
        enabled: false,
        type: 'Email' as const,
      },
    ];

    await supabase.from('automations').insert(defaultAutomations);
  }

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }

  /**
   * Update password
   */
  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  }
}

export const authService = new AuthService();
