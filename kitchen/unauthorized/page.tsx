import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldX, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className=\"min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4\">
      <Card className=\"w-full max-w-md text-center\">
        <CardHeader>
          <div className=\"flex justify-center mb-4\">
            <div className=\"bg-red-100 p-3 rounded-full\">
              <ShieldX className=\"h-8 w-8 text-red-600\" />
            </div>
          </div>
          <CardTitle className=\"text-2xl font-bold text-gray-900\">
            Access Denied
          </CardTitle>
          <CardDescription>
            You don't have permission to access this resource. Please contact your administrator if you believe this is an error.
          </CardDescription>
        </CardHeader>
        
        <CardContent className=\"space-y-4\">
          <div className=\"text-sm text-gray-600\">
            <p>If you need access to this feature:</p>
            <ul className=\"mt-2 text-left space-y-1\">
              <li>• Contact your kitchen manager</li>
              <li>• Verify your role permissions</li>
              <li>• Check with system administrator</li>
            </ul>
          </div>
          
          <div className=\"flex flex-col space-y-2\">
            <Button asChild className=\"w-full\">
              <Link href=\"/kitchen\">
                <ArrowLeft className=\"mr-2 h-4 w-4\" />
                Back to Kitchen
              </Link>
            </Button>
            
            <Button variant=\"outline\" asChild className=\"w-full\">
              <Link href=\"/kitchen/login\">
                Sign in with different account
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}