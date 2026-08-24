'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, XCircle, Clock, Save, Users, Search, Calendar, CheckCircle2, Building2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { HALL_LABELS } from '@/lib/utils';

interface StudentWithAttendance {
  id: string;
  name: string;
  room: string | null;
  hall?: string | null;
  balance: number;
  attendance: {
    status: 'PRESENT' | 'ABSENT' | 'LEAVE';
    cost: number;
    date: string;
    mealQuantity?: number;
  };
}

export default function AttendancePage() {
  const [students, setStudents] = useState<StudentWithAttendance[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentWithAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyCharge, setDailyCharge] = useState('100');
  const [searchQuery, setSearchQuery] = useState('');
  const [changedStudents, setChangedStudents] = useState<Set<string>>(new Set());
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('Fetching attendance data for date:', date);
      const { data } = await api.get(`/attendance/all-students?date=${date}`);
      console.log('API Response:', data);
      
      const studentData = Array.isArray(data) ? data : data.data || [];
      console.log('Student data:', studentData);
      
      setStudents(studentData);
      setFilteredStudents(studentData);
      setChangedStudents(new Set());
      setSearchQuery('');
    } catch (err: any) {
      console.error('Error fetching attendance:', err);
      console.error('Error response:', err.response);
      
      const errorMsg = err.response?.data?.message || err.message || 'ڈیٹا لوڈ نہیں ہو سکا';
      toast({ 
        title: 'خرابی', 
        description: errorMsg, 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [date]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredStudents(students);
    } else {
      const query = searchQuery.toLowerCase().trim();
      const filtered = students.filter(s => 
        s.name.toLowerCase().includes(query) || 
        (s.room && s.room.toLowerCase().includes(query))
      );
      setFilteredStudents(filtered);
    }
  }, [searchQuery, students]);

  const setStatus = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LEAVE', mealQuantity?: number) => {
    setStudents(prev => prev.map(s => 
      s.id === studentId 
        ? { 
            ...s, 
            attendance: { 
              ...s.attendance, 
              status,
              ...(mealQuantity !== undefined && { mealQuantity })
            } 
          }
        : s
    ));
    setChangedStudents(prev => new Set(prev).add(studentId));
  };

  const handleBulkAction = async (status: 'PRESENT' | 'ABSENT' | 'LEAVE') => {
    const confirmMessage = 
      status === 'PRESENT' ? 'کیا آپ تمام طلباء کو حاضر مارک کرنا چاہتے ہیں؟' :
      status === 'ABSENT' ? 'کیا آپ تمام طلباء کو غیر حاضر مارک کرنا چاہتے ہیں؟' :
      'کیا آپ تمام طلباء کو رخصت مارک کرنا چاہتے ہیں؟';

    if (!confirm(confirmMessage)) return;

    setBulkActionLoading(true);
    try {
      const { data } = await api.post('/attendance/bulk-action', {
        date,
        status,
        mealQuantity: 1
      });

      if (data.failed > 0) {
        toast({ 
          title: 'کچھ حاضری محفوظ نہیں ہو سکی', 
          description: `${data.success} کامیاب، ${data.failed} فیل`,
          variant: 'destructive' 
        });
      } else {
        toast({ 
          title: 'بلک ایکشن کامیاب ✓', 
          description: `${data.success} طلباء کی حاضری محفوظ ہو گئی` 
        });
      }
      
      await fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'بلک ایکشن ناکام';
      toast({ title: 'خرابی', description: msg, variant: 'destructive' });
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleMarkSelectedOnly = async () => {
    if (selectedStudents.size === 0) {
      toast({ 
        title: 'کوئی طالب علم منتخب نہیں', 
        description: 'پہلے طلباء کو منتخب کریں',
        variant: 'destructive'
      });
      return;
    }

    const confirmMessage = `${selectedStudents.size} منتخب شدہ طلباء کو غیر حاضر/رخصت مارک کریں؟\nباقی تمام خودکار طور پر حاضر ہوں گے۔`;
    if (!confirm(confirmMessage)) return;

    setBulkActionLoading(true);
    try {
      // Mark selected students as ABSENT or LEAVE (user can choose)
      const attendances = Array.from(selectedStudents).map(studentId => ({
        studentId,
        date,
        status: 'ABSENT', // Default to ABSENT, can be changed
        cost: Number(dailyCharge),
        mealQuantity: 1
      }));

      // Mark all other students as PRESENT
      const otherStudents = students
        .filter(s => !selectedStudents.has(s.id))
        .map(s => ({
          studentId: s.id,
          date,
          status: 'PRESENT',
          cost: Number(dailyCharge),
          mealQuantity: 1
        }));

      const allAttendances = [...attendances, ...otherStudents];

      const { data } = await api.post('/attendance/save-all', { 
        attendances: allAttendances 
      });

      if (data.failed > 0) {
        toast({ 
          title: 'کچھ حاضری محفوظ نہیں ہو سکی', 
          description: `${data.success} کامیاب، ${data.failed} فیل`,
          variant: 'destructive' 
        });
      } else {
        toast({ 
          title: 'حاضری کامیاب ✓', 
          description: `${data.success} طلباء کی حاضری محفوظ ہو گئی` 
        });
      }
      
      setSelectedStudents(new Set());
      await fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'حاضری محفوظ نہیں ہو سکی';
      toast({ title: 'خرابی', description: msg, variant: 'destructive' });
    } finally {
      setBulkActionLoading(false);
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    if (changedStudents.size === 0) {
      toast({ title: 'کوئی تبدیلی نہیں', description: 'پہلے حاضری میں تبدیلی کریں' });
      return;
    }

    setSubmitting(true);
    try {
      const attendances = Array.from(changedStudents).map(studentId => {
        const student = students.find(s => s.id === studentId);
        return {
          studentId,
          date,
          status: student?.attendance.status || 'PRESENT',
          cost: Number(dailyCharge),
          mealQuantity: student?.attendance.mealQuantity || 1
        };
      });

      const { data } = await api.post('/attendance/save-all', { attendances });
      
      if (data.failed > 0) {
        const firstError = data.errors?.[0]?.message || 'کچھ خرابی ہوئی';
        toast({ 
          title: 'کچھ حاضری محفوظ نہیں ہو سکی', 
          description: `${data.success} کامیاب، ${data.failed} فیل۔ ${firstError}`,
          variant: 'destructive' 
        });
      } else {
        toast({ title: 'حاضری کامیاب ✓', description: `${data.success} طلباء کی حاضری محفوظ ہو گئی` });
      }
      
      await fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'حاضری محفوظ نہیں ہو سکی';
      toast({ title: 'خرابی', description: msg, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusCounts = () => {
    const present = students.filter(s => s.attendance.status === 'PRESENT').length;
    const absent = students.filter(s => s.attendance.status === 'ABSENT').length;
    const leave = students.filter(s => s.attendance.status === 'LEAVE').length;
    return { present, absent, leave, total: students.length };
  };

  const counts = getStatusCounts();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">روزانہ حاضری</h2>
          <p className="text-slate-500 mt-1">سادہ اور آسان حاضری کا نظام</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={submitting || changedStudents.size === 0} 
          className="h-14 px-8 bg-emerald-600 hover:bg-emerald-700 gap-2 text-lg font-semibold shadow-lg disabled:opacity-50"
        >
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          محفوظ کریں {changedStudents.size > 0 && `(${changedStudents.size})`}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md bg-gradient-to-br from-slate-50 to-slate-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">کل طلباء</p>
                <p className="text-2xl font-black text-slate-800">{counts.total}</p>
              </div>
              <Users className="w-10 h-10 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-50 to-emerald-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-600 font-medium mb-1">حاضر</p>
                <p className="text-2xl font-black text-emerald-700">{counts.present}</p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-rose-50 to-rose-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-rose-600 font-medium mb-1">غیر حاضر</p>
                <p className="text-2xl font-black text-rose-700">{counts.absent}</p>
              </div>
              <XCircle className="w-10 h-10 text-rose-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 font-medium mb-1">رخصت</p>
                <p className="text-2xl font-black text-blue-700">{counts.leave}</p>
              </div>
              <Clock className="w-10 h-10 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-md overflow-hidden">
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-white">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              تاریخ منتخب کریں
            </label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-12 px-4 border-2 border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600">روزانہ چارج (روپے)</label>
            <div className="relative">
              <span className="absolute right-4 top-3 text-slate-400 font-bold text-sm">Rs</span>
              <input 
                type="number" 
                value={dailyCharge} 
                onChange={(e) => setDailyCharge(e.target.value)}
                className="w-full h-12 pr-12 pl-4 border-2 border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none font-bold text-right"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
              <Search className="w-4 h-4" />
              تلاش کریں
            </label>
            <Input
              placeholder="نام یا کمرہ نمبر..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card className="border-0 shadow-sm bg-blue-50 border-r-4 border-r-blue-500">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 font-bold">ℹ</span>
            </div>
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">حاضری کا طریقہ:</p>
              <ul className="space-y-1 text-blue-700">
                <li>• تمام طلباء <strong>خودکار طور پر حاضر</strong> ہیں</li>
                <li>• صرف <strong>غیر حاضر</strong> یا <strong>رخصت</strong> والوں کو مارک کریں</li>
                <li>• <strong>رخصت</strong> پر کوئی چارج نہیں لگے گا</li>
                <li>• <strong>غیر حاضر</strong> پر چارج لگے گا</li>
                <li>• <strong>کھانے کی تعداد</strong> سے رقم ضرب ہو گی (2 کھانے = 2x چارج)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-indigo-50">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-bold text-slate-800">بلک ایکشن - تیز حاضری</h3>
              {selectedStudents.size > 0 && (
                <Badge className="bg-purple-600 text-white">
                  {selectedStudents.size} منتخب
                </Badge>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                onClick={() => handleBulkAction('PRESENT')}
                disabled={bulkActionLoading || loading}
                className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md"
              >
                {bulkActionLoading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <CheckCircle2 className="w-4 h-4 ml-2" />}
                سب حاضر
              </Button>

              <Button
                onClick={() => handleBulkAction('ABSENT')}
                disabled={bulkActionLoading || loading}
                className="h-12 bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-md"
              >
                {bulkActionLoading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <XCircle className="w-4 h-4 ml-2" />}
                سب غیر حاضر
              </Button>

              <Button
                onClick={() => handleBulkAction('LEAVE')}
                disabled={bulkActionLoading || loading}
                className="h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md"
              >
                {bulkActionLoading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Clock className="w-4 h-4 ml-2" />}
                سب رخصت
              </Button>

              <Button
                onClick={handleMarkSelectedOnly}
                disabled={bulkActionLoading || loading || selectedStudents.size === 0}
                className="h-12 bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md"
              >
                {bulkActionLoading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Users className="w-4 h-4 ml-2" />}
                صرف منتخب
              </Button>
            </div>

            <p className="text-xs text-slate-600 mt-2">
              💡 <strong>صرف منتخب:</strong> منتخب طلباء غیر حاضر، باقی سب خودکار حاضر
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
            </div>
          ) : students.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg">کوئی رجسٹرڈ طالب علم نہیں ہے</p>
              <p className="text-sm mt-2">پہلے طلباء کو شامل کریں</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <Search className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg">"{searchQuery}" سے کوئی طالب علم نہیں ملا</p>
              <Button 
                variant="outline" 
                onClick={() => setSearchQuery('')}
                className="mt-4"
              >
                تلاش صاف کریں
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b-2 border-slate-200">
                  <tr>
                    <th className="px-4 py-4 text-center text-sm font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={selectedStudents.size === filteredStudents.length && filteredStudents.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudents(new Set(filteredStudents.map(s => s.id)));
                          } else {
                            setSelectedStudents(new Set());
                          }
                        }}
                        className="w-5 h-5 rounded border-2 border-slate-300 text-purple-600 focus:ring-2 focus:ring-purple-500 cursor-pointer"
                      />
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">#</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">نام</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">ہال</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">کمرہ</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">بیلنس</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">کھانے</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">حاضری</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((student, index) => {
                    const status = student.attendance.status;
                    const isChanged = changedStudents.has(student.id);
                    const isSelected = selectedStudents.has(student.id);
                    const mealQuantity = student.attendance.mealQuantity || 1;
                    
                    return (
                      <tr 
                        key={student.id} 
                        className={`hover:bg-slate-50 transition-colors ${
                          isChanged ? 'bg-amber-50' : ''
                        } ${isSelected ? 'bg-purple-50' : ''}`}
                      >
                        <td className="px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleStudentSelection(student.id)}
                            className="w-5 h-5 rounded border-2 border-slate-300 text-purple-600 focus:ring-2 focus:ring-purple-500 cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-medium">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-lg">{student.name}</span>
                            {isChanged && (
                              <Badge className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5">
                                تبدیل شدہ
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {student.hall ? (
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-emerald-500" />
                              <span className="text-emerald-700 font-semibold">
                                {HALL_LABELS[student.hall] || student.hall}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-sm">---</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {student.room ? (
                            <span className="text-slate-600 bg-slate-100 px-3 py-1 rounded-lg font-medium">
                              {student.room}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-sm">---</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-bold text-lg ${
                            student.balance < 0 ? 'text-red-600' : 
                            student.balance < 500 ? 'text-amber-600' : 
                            'text-emerald-600'
                          }`}>
                            Rs. {student.balance.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center">
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={mealQuantity}
                              onChange={(e) => {
                                const value = Math.max(1, Math.min(10, Number(e.target.value) || 1));
                                setStudents(prev => prev.map(s => 
                                  s.id === student.id 
                                    ? { 
                                        ...s, 
                                        attendance: { 
                                          ...s.attendance, 
                                          mealQuantity: value 
                                        } 
                                      }
                                    : s
                                ));
                                setChangedStudents(prev => new Set(prev).add(student.id));
                              }}
                              className="w-16 h-10 px-2 text-center border-2 border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none font-bold"
                            />
                            <span className="mr-2 text-xs text-slate-500">
                              {mealQuantity > 1 && `(${mealQuantity}x)`}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant={status === 'PRESENT' ? 'default' : 'outline'}
                              onClick={() => setStatus(student.id, 'PRESENT')}
                              className={`h-10 px-4 rounded-lg font-semibold transition-all ${
                                status === 'PRESENT'
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                                  : 'border-2 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-700'
                              }`}
                            >
                              <CheckCircle2 className="w-4 h-4 ml-1" />
                              حاضر
                            </Button>

                            <Button
                              size="sm"
                              variant={status === 'ABSENT' ? 'default' : 'outline'}
                              onClick={() => setStatus(student.id, 'ABSENT')}
                              className={`h-10 px-4 rounded-lg font-semibold transition-all ${
                                status === 'ABSENT'
                                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md'
                                  : 'border-2 border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-700'
                              }`}
                            >
                              <XCircle className="w-4 h-4 ml-1" />
                              غیر حاضر
                            </Button>

                            <Button
                              size="sm"
                              variant={status === 'LEAVE' ? 'default' : 'outline'}
                              onClick={() => setStatus(student.id, 'LEAVE')}
                              className={`h-10 px-4 rounded-lg font-semibold transition-all ${
                                status === 'LEAVE'
                                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                                  : 'border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700'
                              }`}
                            >
                              <Clock className="w-4 h-4 ml-1" />
                              رخصت
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Show total when searching */}
      {searchQuery && filteredStudents.length > 0 && (
        <div className="text-center text-sm text-slate-500">
          {filteredStudents.length} طلباء ملے (کل {students.length} میں سے)
        </div>
      )}
    </div>
  );
}
