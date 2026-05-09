'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/store/auth.context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { UtensilsCrossed, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signup(name, email, password);
    } catch (err: any) {
      setError(err.response?.data?.message || 'رجسٹریشن میں غلطی ہوئی');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg mb-4">
            <UtensilsCrossed className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">نیا اکاؤنٹ بنائیں</h1>
          <p className="text-slate-500 mt-1 text-sm">میس مینجمنٹ سسٹم میں خوش آمدید</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-center text-slate-700">رجسٹریشن</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center border border-red-200">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">نام</label>
                <Input
                  id="name"
                  placeholder="اپنا مکمل نام لکھیں"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 text-base border-slate-200 focus:border-emerald-400"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">ای میل</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 text-base border-slate-200 focus:border-emerald-400"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">پاس ورڈ</label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 text-base border-slate-200 focus:border-emerald-400"
                  dir="ltr"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-14 text-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 font-semibold shadow-md"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin ml-2" /> : null}
                {loading ? 'صبر کریں...' : 'رجسٹریشن کریں'}
              </Button>
            </form>
            <div className="text-center text-sm pt-2">
              <span className="text-slate-500">پہلے سے اکاؤنٹ موجود ہے؟</span>{' '}
              <Link href="/login" className="text-emerald-600 font-semibold hover:underline">
                لاگ ان کریں
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
