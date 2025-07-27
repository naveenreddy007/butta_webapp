'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ChefHat } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setError(error.message);
      } else {
        router.push('/kitchen');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className=\"min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 p-4\">
      <Card className=\"w-full max-w-md\">
        <CardHeader className=\"text-center\">
          <div className=\"flex justify-center mb-4\">
            <div className=\"bg-orange-100 p-3 rounded-full\">
              <ChefHat className=\"h-8 w-8 text-orange-600\" />
            </div>
          </div>
          <CardTitle className=\"text-2xl font-bold text-gray-900\">
            Kitchen Access
          </CardTitle>
          <CardDescription>
            Sign in to access the Butta Convention Kitchen Module
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className=\"space-y-4\">
            {error && (
              <Alert variant=\"destructive\">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className=\"space-y-2\">
              <Label htmlFor=\"email\">Email</Label>
              <Input
                id=\"email\"
                type=\"email\"
                placeholder=\"chef@buttaconvention.com\"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className=\"h-12 text-base\"
              />
            </div>
            
            <div className=\"space-y-2\">
              <Label htmlFor=\"password\">Password</Label>
              <Input
                id=\"password\"
                type=\"password\"
                placeholder=\"Enter your password\"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className=\"h-12 text-base\"
              />
            </div>
            
            <Button
              type=\"submit\"
              className=\"w-full h-12 text-base bg-orange-600 hover:bg-orange-700\"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className=\"mr-2 h-4 w-4 animate-spin\" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          
          <div className=\"mt-6 text-center text-sm text-gray-600\">
            <p>Demo Accounts:</p>
            <div className=\"mt-2 space-y-1 text-xs\">
              <p><strong>Chef:</strong> chef@butta.com / chef123</p>
              <p><strong>Manager:</strong> manager@butta.com / manager123</p>
              <p><strong>Admin:</strong> admin@butta.com / admin123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}