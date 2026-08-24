'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Member } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, HALL_LABELS, HALLS } from '@/lib/utils';
import { Search, Loader2, FileText, ChevronDown, ChevronUp, Building2, DoorOpen, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MonthlyStudentReport {
  studentId: string;
  studentName: string;
  room: string | null;
  hall: string | null;
  currentBalance: number;
  monthlyBill: number;
  presentDays: number;
  leaveDays: number;
  absentDays: number;
  totalDeposits: number;
}

interface MonthlyReport {
  month: number;
  year: number;
  monthName: string;
  students: MonthlyStudentReport[];
}

export default function ReportsPage() {
  const [monthlyReports, setMonthlyReports] = useState<MonthlyReport[]>([]);
  const [studentReport, setStudentReport] = useState<MonthlyStudentReport[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const [searchForm, setSearchForm] = useState({
    studentId: '',
    studentName: '',
    room: '',
    hall: '',
  });
  const [phoneSearchQuery, setPhoneSearchQuery] = useState('');
  const [phoneFilteredMembers, setPhoneFilteredMembers] = useState<Member[]>([]);

  useEffect(() => {
    fetchMonthlyReports();
    fetchMembers();
  }, []);

  // Real-time phone search for student selection
  useEffect(() => {
    if (!phoneSearchQuery.trim()) {
      setPhoneFilteredMembers([]);
      return;
    }

    const query = phoneSearchQuery.toLowerCase().trim();
    const filtered = members.filter(m => 
      m.status === 'ACTIVE' && 
      (m.phone?.toLowerCase().includes(query) ||
       m.name?.toLowerCase().includes(query) ||
       m.room?.toLowerCase().includes(query))
    );
    setPhoneFilteredMembers(filtered);
  }, [phoneSearchQuery, members]);

  const fetchMonthlyReports = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reports/monthly');
      const data = response.data;
      setMonthlyReports(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      toast({ title: 'خرابی', description: 'رپورٹ لوڈ نہیں ہوئی', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await api.get('/students');
      const data = response.data;
      setMembers(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const handleStudentSelect = (studentId: string) => {
    const student = members.find(m => m.id === studentId);
    if (student) {
      setSearchForm({
        studentId,
        studentName: student.name,
        room: student.room || '',
        hall: student.hall || '',
      });
      setPhoneSearchQuery(''); // Clear search after selection
      setPhoneFilteredMembers([]);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchForm.studentId) {
      toast({ title: 'خرابی', description: 'طالب علم منتخب کریں', variant: 'destructive' });
      return;
    }

    setSearching(true);
    try {
      const params = new URLSearchParams({
        studentId: searchForm.studentId,
        ...(searchForm.studentName && { studentName: searchForm.studentName }),
        ...(searchForm.room && { room: searchForm.room }),
        ...(searchForm.hall && { hall: searchForm.hall }),
      });

      const response = await api.get(`/reports/student-monthly?${params}`);
      const data = response.data;
      
      if (data.success) {
        setStudentReport(Array.isArray(data.data) ? data.data : []);
        if (data.data.length === 0) {
          toast({ title: 'کوئی ریکارڈ نہیں', description: 'اس طالب علم کا کوئی ریکارڈ نہیں ملا' });
        }
      } else {
        toast({ title: 'خرابی', description: data.message || 'تلاش ناکام', variant: 'destructive' });
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'تلاش میں خرابی';
      toast({ title: 'خرابی', description: msg, variant: 'destructive' });
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchForm({ studentId: '', studentName: '', room: '', hall: '' });
    setStudentReport([]);
    setPhoneSearchQuery('');
    setPhoneFilteredMembers([]);
  };

  const toggleMonth = (key: string) => {
    const newExpanded = new Set(expandedMonths);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedMonths(newExpanded);
  };

  // Filter and sort monthly reports based on search query
  const getFilteredAndSortedReports = () => {
    if (!searchForm.studentId || studentReport.length > 0) {
      // If student-specific search is active, don't filter monthly reports
      return monthlyReports;
    }

    // This is for the "all students" monthly reports view
    return monthlyReports.map(report => {
      if (!searchForm.studentName && !searchForm.room && !searchForm.hall) {
        return report;
      }

      const query = (searchForm.studentName || searchForm.room || searchForm.hall || '').toLowerCase().trim();
      
      // Separate matching and non-matching students
      const matching: MonthlyStudentReport[] = [];
      const nonMatching: MonthlyStudentReport[] = [];

      report.students.forEach(student => {
        const matchesName = student.studentName?.toLowerCase().includes(query);
        const matchesPhone = members.find(m => m.id === student.studentId)?.phone?.toLowerCase().includes(query);
        const matchesRoom = student.room?.toLowerCase().includes(query);
        
        if (matchesName || matchesPhone || matchesRoom) {
          matching.push(student);
        } else {
          nonMatching.push(student);
        }
      });

      return {
        ...report,
        students: [...matching, ...nonMatching]
      };
    });
  };

  const filteredMonthlyReports = getFilteredAndSortedReports();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">ماہانہ رپورٹس</h2>
        <p className="text-slate-500 text-sm">مہینے کے حساب سے تفصیلی رپورٹ</p>
      </div>

      {/* Search Form */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="w-5 h-5 text-violet-600" />
            طالب علم کی تلاش
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-600 block mb-2">فون نمبر سے تلاش کریں *</label>
                <Input
                  type="text"
                  placeholder="فون نمبر، نام، یا کمرہ نمبر..."
                  value={phoneSearchQuery}
                  onChange={(e) => setPhoneSearchQuery(e.target.value)}
                  className="h-12 text-right"
                  disabled={!!searchForm.studentId}
                />
                
                {/* Search Results */}
                {phoneFilteredMembers.length > 0 && !searchForm.studentId && (
                  <div className="mt-2 max-h-48 overflow-y-auto border rounded-lg bg-white">
                    {phoneFilteredMembers.map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleStudentSelect(m.id)}
                        className="w-full text-right px-4 py-3 hover:bg-slate-50 border-b last:border-b-0 transition-colors"
                      >
                        <p className="font-semibold text-slate-800">{m.name}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {m.phone && `${m.phone} • `}
                          {m.room && `کمرہ ${m.room} • `}
                          {m.hall && HALL_LABELS[m.hall]}
                        </p>
                      </button>
                    ))}
                  </div>
                )}

                {phoneSearchQuery && phoneFilteredMembers.length === 0 && !searchForm.studentId && (
                  <p className="text-xs text-red-600 mt-2">کوئی طالب علم نہیں ملا</p>
                )}
              </div>

              {searchForm.studentId && (
                <>
                  <div>
                    <label className="text-sm text-slate-600 block mb-2">کمرہ نمبر</label>
                    <div className="flex items-center gap-2 h-12 px-3 bg-slate-50 rounded-lg border">
                      <DoorOpen className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium">{searchForm.room || '---'}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-slate-600 block mb-2">ہال</label>
                    <div className="flex items-center gap-2 h-12 px-3 bg-slate-50 rounded-lg border">
                      <Building2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-medium text-emerald-700">
                        {searchForm.hall ? HALL_LABELS[searchForm.hall] : '---'}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3">
              <Button 
                type="submit" 
                disabled={searching || !searchForm.studentId}
                className="h-12 px-6 bg-violet-600 hover:bg-violet-700 gap-2"
              >
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                تلاش کریں
              </Button>
              {(studentReport.length > 0 || searchForm.studentId) && (
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={clearSearch}
                  className="h-12 px-6"
                >
                  صاف کریں
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Student-Specific Report */}
      {studentReport.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              {searchForm.studentName} کی ماہانہ رپورٹ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" dir="rtl">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">مہینہ</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">ہال</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">کمرہ</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">ماہانہ بل</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">حاضر دن</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">رخصت دن</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">جمع</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">بیلنس</th>
                  </tr>
                </thead>
                <tbody>
                  {studentReport.map((report, idx) => (
                    <tr key={idx} className="border-t hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <span className="font-medium">مہینہ {idx + 1}</span>
                      </td>
                      <td className="px-4 py-3">
                        {report.hall ? (
                          <span className="text-emerald-700 font-medium">{HALL_LABELS[report.hall]}</span>
                        ) : '---'}
                      </td>
                      <td className="px-4 py-3">{report.room || '---'}</td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-red-600">{formatCurrency(report.monthlyBill)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-emerald-600 font-semibold">{report.presentDays}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-orange-600">{report.leaveDays}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-violet-600">{formatCurrency(report.totalDeposits)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-800">{formatCurrency(report.currentBalance)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly Reports (All Students) */}
      {studentReport.length === 0 && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="w-5 h-5" />
              <h3 className="text-lg font-semibold">تمام طلباء کی ماہانہ رپورٹ</h3>
            </div>
            {/* Quick Search for All Students View */}
            <Input
              placeholder="نام، فون، یا کمرہ سے تلاش کریں..."
              value={searchForm.studentName}
              onChange={(e) => setSearchForm({ ...searchForm, studentName: e.target.value })}
              className="max-w-xs h-10 text-right"
            />
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
            </div>
          ) : monthlyReports.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">کوئی رپورٹ نہیں</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMonthlyReports.map((report) => {
                const key = `${report.year}-${report.month}`;
                const isExpanded = expandedMonths.has(key);

                return (
                  <Card key={key} className="border-0 shadow-md">
                    <CardHeader 
                      className="cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => toggleMonth(key)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-violet-600" />
                          </div>
                          <div>
                            <CardTitle className="text-xl">{report.monthName} {report.year}</CardTitle>
                            <p className="text-sm text-slate-500">{report.students.length} طلباء</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </Button>
                      </div>
                    </CardHeader>

                    {isExpanded && (
                      <CardContent className="pt-0">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm" dir="rtl">
                            <thead className="bg-slate-50">
                              <tr>
                                <th className="px-4 py-3 text-right font-semibold text-slate-700">#</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-700">نام</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-700">فون</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-700">ہال</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-700">کمرہ</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-700">موجودہ بیلنس</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-700">ماہانہ بل</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-700">حاضر دن</th>
                              </tr>
                            </thead>
                            <tbody>
                              {report.students.map((student, idx) => {
                                const studentData = members.find(m => m.id === student.studentId);
                                return (
                                  <tr key={student.studentId} className="border-t hover:bg-slate-50">
                                    <td className="px-4 py-3 text-slate-500">{idx + 1}</td>
                                    <td className="px-4 py-3 font-semibold text-slate-800">{student.studentName}</td>
                                    <td className="px-4 py-3 text-slate-600">{studentData?.phone || '---'}</td>
                                    <td className="px-4 py-3">
                                      {student.hall ? (
                                        <span className="text-emerald-700 font-medium">{HALL_LABELS[student.hall]}</span>
                                      ) : '---'}
                                    </td>
                                    <td className="px-4 py-3">{student.room || '---'}</td>
                                    <td className="px-4 py-3">
                                      <span className="font-bold text-slate-800">{formatCurrency(student.currentBalance)}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                      <span className="font-bold text-red-600">{formatCurrency(student.monthlyBill)}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                      <span className="text-emerald-600 font-semibold">{student.presentDays}</span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
