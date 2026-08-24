'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { HALL_LABELS, HALLS } from '@/lib/utils';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  UserPlus, 
  Search, 
  Phone, 
  DoorOpen, 
  Calendar, 
  Wallet,
  MoreVertical,
  Edit,
  Archive,
  Eye,
  Building2
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

interface Student {
  id: string;
  name: string;
  phone: string;
  room: string;
  hall?: string;
  status: 'ACTIVE' | 'ARCHIVED';
  balance: number;
  joinedAt: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { toast } = useToast();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    room: '',
    hall: '',
    balance: 0
  });

  const fetchStudents = async () => {
    try {
      const { data } = await api.get(`/students?search=${search}`);
      setStudents(Array.isArray(data) ? data : data.data);
    } catch {
      toast({ title: 'خرابی', description: 'ڈیٹا لوڈ کرنے میں مسئلہ ہوا', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/students', formData);
      toast({ title: 'کامیاب', description: 'نیا اسٹوڈنٹ شامل کر دیا گیا' });
      setIsAddOpen(false);
      setFormData({ name: '', phone: '', room: '', hall: '', balance: 0 });
      fetchStudents();
    } catch {
      toast({ title: 'خرابی', description: 'اسٹوڈنٹ شامل نہیں ہو سکا', variant: 'destructive' });
    }
  };

  const toggleStatus = async (student: Student) => {
    const newStatus = student.status === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE';
    try {
      await api.patch(`/students/${student.id}`, { status: newStatus });
      toast({ 
        title: 'اپ ڈیٹ', 
        description: `اسٹوڈنٹ کو ${newStatus === 'ARCHIVED' ? 'آرکائیو' : 'ایکٹو'} کر دیا گیا` 
      });
      fetchStudents();
    } catch {
      toast({ title: 'خرابی', description: 'سٹیٹس اپ ڈیٹ نہیں ہو سکا', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">اسٹوڈنٹ مینجمنٹ</h1>
          <p className="text-slate-500">میس کے تمام ممبران کی فہرست</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="h-12 px-6 text-lg font-semibold bg-emerald-600 hover:bg-emerald-700 shadow-md">
              <UserPlus className="ml-2 w-5 h-5" />
              نیا اسٹوڈنٹ
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-right">نیا اسٹوڈنٹ شامل کریں</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 py-4">
              <div className="space-y-2 text-right">
                <label className="text-sm font-medium">نام *</label>
                <Input 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="h-12 text-lg text-right"
                  placeholder="نام لکھیں"
                />
              </div>
              <div className="space-y-2 text-right">
                <label className="text-sm font-medium">ہال / ہاسٹل *</label>
                <Select value={formData.hall} onValueChange={v => setFormData({...formData, hall: v})}>
                  <SelectTrigger className="h-12 text-lg">
                    <SelectValue placeholder="ہال منتخب کریں" />
                  </SelectTrigger>
                  <SelectContent>
                    {HALLS.map(hall => (
                      <SelectItem key={hall.value} value={hall.value}>
                        {hall.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 text-right">
                <label className="text-sm font-medium">کمرہ نمبر</label>
                <Input 
                  value={formData.room} 
                  onChange={e => setFormData({...formData, room: e.target.value})}
                  className="h-12 text-lg"
                  placeholder="A-101"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2 text-right">
                <label className="text-sm font-medium">فون نمبر</label>
                <Input 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="h-12 text-lg"
                  placeholder="03xx xxxxxxx"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2 text-right">
                <label className="text-sm font-medium">ابتدائی بیلنس</label>
                <Input 
                  type="number"
                  value={formData.balance} 
                  onChange={e => setFormData({...formData, balance: parseFloat(e.target.value) || 0})}
                  className="h-12 text-lg"
                  dir="ltr"
                />
              </div>
              <DialogFooter className="mt-6 gap-2">
                <Button type="submit" className="w-full h-12 text-lg bg-emerald-600 hover:bg-emerald-700">
                  محفوظ کریں
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Box */}
      <div className="relative group">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
        <Input 
          placeholder="نام، فون یا کمرہ نمبر سے تلاش کریں..." 
          className="h-14 pr-12 text-lg border-2 border-slate-100 focus:border-emerald-200 bg-white/50 backdrop-blur-sm shadow-sm"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <Card key={i} className="overflow-hidden border-0 shadow-md">
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-20 w-full rounded-xl" />
              </CardContent>
            </Card>
          ))
        ) : students.length > 0 ? (
          students.map((student) => (
            <Card key={student.id} className={`overflow-hidden border-0 shadow-md transition-all hover:shadow-lg group ${student.status === 'ARCHIVED' ? 'opacity-75 grayscale-[0.5]' : ''}`}>
              <div className={`h-2 w-full ${student.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant={student.status === 'ACTIVE' ? 'default' : 'secondary'} className="px-3 py-1">
                      {student.status === 'ACTIVE' ? 'ایکٹو' : 'آرکائیو'}
                    </Badge>
                    <h3 className="text-xl font-bold text-slate-800">{student.name}</h3>
                  </div>

                  <div className="space-y-3 mb-6">
                    {student.hall && (
                      <div className="flex items-center gap-3 text-slate-600">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-emerald-700">{HALL_LABELS[student.hall] || student.hall}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-slate-600">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                        <DoorOpen className="w-4 h-4" />
                      </div>
                      <span dir="ltr">{student.room || '---'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <span dir="ltr">{student.phone || '---'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <span>{new Date(student.joinedAt).toLocaleDateString('ur-PK')}</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 flex justify-between items-center mb-6">
                    <div className="text-left">
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">بیلنس</p>
                      <p className={`text-xl font-bold ${student.balance < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                        Rs. {student.balance.toLocaleString()}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-500">
                      <Wallet className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="h-11 gap-2" onClick={() => toggleStatus(student)}>
                      {student.status === 'ACTIVE' ? <Archive className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                      {student.status === 'ACTIVE' ? 'آرکائیو' : 'ایکٹو کریں'}
                    </Button>
                    <Button className="h-11 gap-2 bg-slate-800 hover:bg-slate-900" onClick={() => window.location.href=`/students/${student.id}`}>
                      <Eye className="w-4 h-4" />
                      پروفائل
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-4 text-slate-300">
              <Search className="w-10 h-10" />
            </div>
            <p className="text-xl text-slate-500">کوئی اسٹوڈنٹ نہیں ملا</p>
          </div>
        )}
      </div>
    </div>
  );
}
