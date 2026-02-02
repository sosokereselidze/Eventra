import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CalendarDays, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

const loginSchema = z.object({
  identifier: z.string().min(3, 'Please enter your email or username'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, signIn, signUp, googleSignIn } = useAuth();
  const { toast } = useToast();

  const [isSignUp, setIsSignUp] = useState(searchParams.get('mode') === 'signup');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    identifier: '',
    password: '',
  });

  useEffect(() => {
    if (user) {
      navigate(user.isAdmin ? '/admin' : '/');
    }
  }, [user, navigate]);

  useEffect(() => {
    setIsSignUp(searchParams.get('mode') === 'signup');
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      setIsLoading(true);
      const { error } = await googleSignIn(credentialResponse.credential);
      setIsLoading(false);
      if (error) {
        toast({ title: 'Google Sign-In Failed', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Welcome!', description: 'Signed in with Google successfully.' });
        navigate('/');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      if (isSignUp) {
        const validated = signupSchema.parse(formData);
        const { error } = await signUp(
          validated.email,
          validated.username,
          validated.password,
          validated.name
        );
        if (error) {
          if (error.message.toLowerCase().includes('already registered')) {
            toast({
              title: 'Account exists',
              description: error.message,
              variant: 'destructive',
            });
          } else {
            throw error;
          }
        } else {
          toast({
            title: 'Welcome to Eventra!',
            description: 'Your account has been created successfully.',
          });
          // Check if the newly created user is admin (unlikely but safe)
          // For now, new signups are users, so '/' is fine.
          navigate('/');
        }
      } else {
        const validated = loginSchema.parse(formData);
        const { error } = await signIn(validated.identifier, validated.password);
        if (error) {
          toast({
            title: 'Sign in failed',
            description: 'Invalid credentials. Please try again.',
            variant: 'destructive',
          });
        } else {
          // Navigation will be handled by the user effect above, but we can also force it here to be explicit if the effect is slow
          // The effect [user, navigate] will trigger as soon as signIn updates user state.
        }
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            fieldErrors[error.path[0] as string] = error.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast({
          title: 'Error',
          description: 'Something went wrong. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 bg-primary" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-10 bg-primary" />
      </div>

      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md bg-card/30 backdrop-blur-xl border border-border/50 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-3 mb-8 group/logo">
            <div className="h-12 w-12 flex items-center justify-center overflow-hidden">
              <img src="/eventra_logo.png" alt="Eventra Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-display font-bold text-3xl tracking-tight">Eventra</span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold mb-2 gradient-text">
              {isSignUp ? 'Create account' : 'Welcome back'}
            </h1>
            <p className="text-muted-foreground">
              {isSignUp
                ? 'Join Eventra and start discovering events'
                : 'Sign in to access your dashboard'}
            </p>
          </div>

          <div className="mb-6 flex flex-col items-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast({ title: 'Login Failed', variant: 'destructive' })}
              useOneTap
              theme="filled_black"
              shape="pill"
              size="large"
            />
            <div className="relative w-full mt-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-transparent px-2 text-muted-foreground backdrop-blur-sm">Or continue with</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 relative">
            {isSignUp && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      className="pl-10 bg-background/50 border-border/50"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      name="username"
                      placeholder="johndoe123"
                      value={formData.username}
                      onChange={handleChange}
                      className="pl-10 bg-background/50 border-border/50"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.username && <p className="text-xs text-destructive mt-1">{errors.username}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10 bg-background/50 border-border/50"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                </div>
              </>
            )}

            {!isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-sm font-medium">Email or Username</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="identifier"
                    name="identifier"
                    placeholder="you@example.com or username"
                    value={formData.identifier}
                    onChange={handleChange}
                    className="pl-10 bg-background/50 border-border/50"
                    disabled={isLoading}
                  />
                </div>
                {errors.identifier && <p className="text-xs text-destructive mt-1">{errors.identifier}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password" name="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10 bg-background/50 border-border/50"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
            </div>

            <Button type="submit" className="w-full mt-2 glow h-11" size="lg" disabled={isLoading}>
              {isLoading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          {/* Toggle */}
          <p className="mt-8 text-center text-muted-foreground text-sm">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary hover:text-primary/80 transition-colors font-semibold"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:flex-1 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200"
          alt="Event"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-10000 hover:scale-110"
        />
        <div className="absolute inset-0 bg-primary/40 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-md text-center">
            <h2 className="font-display text-5xl font-bold mb-6 text-white leading-tight">
              Discover Events That <span className="text-primary-foreground underline decoration-primary decoration-4 underline-offset-8">Inspire</span>
            </h2>
            <p className="text-xl text-white/90 font-medium">
              Join thousands of event-goers and discover unforgettable experiences.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
