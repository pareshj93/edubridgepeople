// lib/auth.ts
import { supabase } from './supabase';

// Corrected signUp to handle username and assign a default role
export async function signUp(email: string, password: string, username: string) {
  try {
    console.log('🚀 Starting signup for:', email);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/?verified=true`,
        data: {
          username: username, // Pass username in metadata
          role: 'student' // Assign a default role
        }
      }
    });

    if (error) {
      console.error('❌ Signup error:', error);
      throw error;
    }

    console.log('✅ Signup successful - verification email sent');
    return data;
  } catch (error) {
    console.error('❌ SignUp error:', error);
    throw error;
  }
}

// Renamed this function to match the import
export async function signInWithPassword(email: string, password: string) {
  try {
    console.log('🔑 Signing in:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ SignIn error:', error);
      throw error;
    }

    console.log('✅ SignIn successful');
    return data;
  } catch (error) {
    console.error('❌ SignIn error:', error);
    throw error;
  }
}

export async function signInWithGoogle() {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/?page=feed`,
      },
    });
    if (error) throw error;
  } catch (error) {
    console.error('❌ Google SignIn error:', error);
    throw error;
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    console.log('✅ SignOut successful');
  } catch (error) {
    console.error('❌ SignOut error:', error);
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  } catch (error) {
    console.error('❌ GetCurrentUser error:', error);
    return null; // Return null on error
  }
}

export async function getUserProfile(userId: string) {
  try {
    console.log('🔍 Fetching profile for:', userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle(); 

    if (error) {
      console.error('❌ Profile fetch error:', error);
      throw error;
    }

    if (data) {
      console.log('✅ Profile found:', data);
      return data;
    } else {
      console.log('📝 No profile found for user:', userId);
      return null;
    }
  } catch (error) {
    console.error('❌ GetUserProfile error:', error);
    return null;
  }
}

export async function resendVerificationEmail() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || !user.email) {
      throw new Error('No user found or email missing');
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email,
      options: {
        emailRedirectTo: `${window.location.origin}/?verified=true`
      }
    });

    if (error) throw error;
    console.log('✅ Verification email resent');
    return true;
  } catch (error) {
    console.error('❌ Resend verification error:', error);
    throw error;
  }
}
