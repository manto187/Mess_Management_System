'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2, XCircle, Clock, Save, UserCheck, Users } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MEAL_TYPE_LABELS } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface Student {
  id: string;
  name: string;
  status: string;
}

interface Attendance {
  studentId: string;
  status: 'PRESENT' | 'ABSENT' | 'LEAVE';
}

export default function AttendancePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LEAVE'>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState('LUNCH');
  const [mealPrice, setMealPrice] = useState('100');
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Active Students
      const { data: studentData } = await api.get('/students');
      const activeStudents = Array.isArray(studentData) ? studentData : studentData.data || [];
      const filtered = activeStudents.filter((s: Student) => s.status === 'ACTIVE');
      setStudents(filtered);

      // 2. Fetch Existing Attendance for this date/type
      const { data: attResponse } = await api.get(`/attendance?date=${date}&type=${type}`);
      const existing = Array.isArray(attResponse) ? attResponse : attResponse.data || [];
      
      const map: Record<string, 'PRESENT' | 'ABSENT' | 'LEAVE'> = {};
      existing.forEach((a: any) => {
        map[a.studentId] = a.status;
      });
      setAttendanceMap(map);
    } catch (err) {
      toast({ title: 'خرابی', description: 'ڈیٹا لوڈ نہیں ہو سکا', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [date, type]);

  const setStatus = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LEAVE') => {
    setAttendanceMap(prev => ({ ...prev, [studentId]: status }));
  };

  const markAllPresent = () => {
    const map: Record<string, 'PRESENT' | 'ABSENT' | 'LEAVE'> = { ...attendanceMap };
    students.forEach(s => {
      if (!map[s.id]) map[s.id] = 'PRESENT';
    });
    setAttendanceMap(map);
    toast({ title: 'سب کو حاضر کر دیا گیا' });
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const attendances = Object.entries(attendanceMap).map(([studentId, status]) => ({
        studentId,
        date,
        type,
        status,
        cost: Number(mealPrice)
      }));

      if (attendances.length === 0) {
        toast({ title: 'پہلے حاضری لگائیں', variant: 'destructive' });
        return;
      }

      console.log('Saving attendances:', attendances);
      const { data } = await api.post('/attendance/save-all', { attendances });
      console.log('Save response:', data);
      
      if (data.failed > 0) {
        const firstError = data.errors?.[0]?.message || 'لیٹ چھٹی کی وجہ سے ہو سکتا ہے';
        toast({ 
          title: 'کچھ حاضری محفوظ نہیں ہو سکی', 
          description: `${data.success} کامیاب، ${data.failed} فیل۔ وجہ: ${firstError}`,
          variant: 'destructive' 
        });
      } else {
        toast({ title: 'حاضری کامیاب', description: 'تمام حاضری محفوظ کر لی گئی ہے ✓' });
      }
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'حاضری محفوظ نہیں ہو سکی';
      toast({ title: 'خرابی', description: msg, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">روزانہ حاضری</h2>
          <p className="text-slate-500 text-sm">کھانے کی حاضری اور بلنگ</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={markAllPresent} variant="outline" className="h-12 border-emerald-200 text-emerald-700 hover:bg-emerald-50 gap-2 flex-1 sm:flex-none">
            <UserCheck className="w-5 h-5" /> سب حاضر
          </Button>
          <Button onClick={handleSave} disabled={submitting} className="h-12 bg-emerald-600 hover:bg-emerald-700 gap-2 flex-1 sm:flex-none shadow-lg">
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            محفوظ کریں
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardContent className="p-4 grid grid-cols-2 gap-4 bg-white/50 backdrop-blur-sm">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">تاریخ</label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-12 px-4 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">کھانا</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="h-12 border-slate-200 rounded-xl bg-white shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MEAL_TYPE_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 sm:col-span-1 space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">قیمت (روپے)</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-slate-400 font-bold">Rs</span>
              <input 
                type="number" 
                value={mealPrice} 
                onChange={(e) => setMealPrice(e.target.value)}
                className="w-full h-12 pl-10 pr-4 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none font-bold"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {loading ? (
          Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
        ) : students.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-400">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>کوئی فعال ممبر نہیں ملا</p>
          </div>
        ) : students.map((student) => {
          const currentStatus = attendanceMap[student.id];
          return (
            <Card key={student.id} className={`border-0 shadow-sm transition-all duration-300 ${
              currentStatus === 'PRESENT' ? 'bg-emerald-50 ring-1 ring-emerald-200' : 
              currentStatus === 'ABSENT' ? 'bg-rose-50 ring-1 ring-rose-200' :
              currentStatus === 'LEAVE' ? 'bg-blue-50 ring-1 ring-blue-200' : 'bg-white'
            }`}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 text-lg">{student.name}</h3>
                  <div className="flex gap-2 mt-1">
                    {currentStatus ? (
                      <Badge className={
                        currentStatus === 'PRESENT' ? 'bg-emerald-100 text-emerald-700' : 
                        currentStatus === 'ABSENT' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                      }>
                        {currentStatus === 'PRESENT' ? 'حاضر' : currentStatus === 'ABSENT' ? 'غیر حاضر' : 'رخصت'}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-slate-100 text-slate-400">باقی</Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-1">
                  <Button 
                    size="icon" 
                    variant={currentStatus === 'PRESENT' ? 'default' : 'outline'}
                    className={`h-12 w-12 rounded-xl transition-all ${currentStatus === 'PRESENT' ? 'bg-emerald-600 scale-105 shadow-md' : 'border-slate-200'}`}
                    onClick={() => setStatus(student.id, 'PRESENT')}
                  >
                    <CheckCircle2 className="w-6 h-6" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant={currentStatus === 'ABSENT' ? 'default' : 'outline'}
                    className={`h-12 w-12 rounded-xl transition-all ${currentStatus === 'ABSENT' ? 'bg-rose-600 scale-105 shadow-md' : 'border-slate-200'}`}
                    onClick={() => setStatus(student.id, 'ABSENT')}
                  >
                    <XCircle className="w-6 h-6" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant={currentStatus === 'LEAVE' ? 'default' : 'outline'}
                    className={`h-12 w-12 rounded-xl transition-all ${currentStatus === 'LEAVE' ? 'bg-blue-600 scale-105 shadow-md' : 'border-slate-200'}`}
                    onClick={() => setStatus(student.id, 'LEAVE')}
                  >
                    <Clock className="w-6 h-6" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
