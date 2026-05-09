'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/store/auth.context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, UtensilsCrossed } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast({ title: 'خوش آمدید! ✓', description: 'لاگ ان کامیاب ہوا' });
    } catch {
      toast({ title: 'خرابی', description: 'ای میل یا پاسورڈ غلط ہے', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg mb-4">
            <UtensilsCrossed className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">میس مینجمنٹ</h1>
          <p className="text-slate-500 mt-1 text-sm">اپنے اکاؤنٹ میں لاگ ان کریں</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-center text-slate-700">لاگ ان</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">ای میل</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 text-base border-slate-200 focus:border-emerald-400"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">پاسورڈ</label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 text-base border-slate-200 focus:border-emerald-400"
                  dir="ltr"
                />
              </div>
              <Button
                id="login-btn"
                type="submit"
                disabled={isLoading}
                className="w-full h-14 text-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 font-semibold shadow-md"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin ml-2" /> : null}
                {isLoading ? 'لاگ ان ہو رہا ہے...' : 'لاگ ان کریں'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-slate-500">اکاؤنٹ نہیں ہے؟</span>{' '}
              <Link href="/register" className="text-emerald-600 font-semibold hover:underline">
                نیا اکاؤنٹ بنائیں
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
