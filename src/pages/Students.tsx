
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { 
  Users, 
  Plus, 
  Search, 
  Download, 
  UserPlus,
  Mail,
  Phone,
  GraduationCap,
  Award
} from 'lucide-react'

interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  class: string;
  testsCompleted: number;
  avgScore: number;
  lastActivity: string;
  status: 'active' | 'inactive';
}

export default function Students() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const { toast } = useToast()
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    phone: '',
    class: ''
  })

  // Mock student data - bu veriler gerçek uygulamada localStorage'dan gelecek
  const [students, setStudents] = useState<Student[]>([
    {
      id: 1,
      name: 'Ahmet Yılmaz',
      email: 'ahmet@example.com',
      phone: '0532 123 4567',
      class: '10-A',
      testsCompleted: 12,
      avgScore: 85.5,
      lastActivity: '2025-06-15',
      status: 'active'
    },
    {
      id: 2,
      name: 'Ayşe Demir',
      email: 'ayse@example.com',
      phone: '0533 987 6543',
      class: '10-B',
      testsCompleted: 8,
      avgScore: 92.3,
      lastActivity: '2025-06-14',
      status: 'active'
    },
    {
      id: 3,
      name: 'Mehmet Kaya',
      email: 'mehmet@example.com',
      phone: '0534 555 1234',
      class: '10-A',
      testsCompleted: 15,
      avgScore: 78.9,
      lastActivity: '2025-06-13',
      status: 'inactive'
    }
  ])

  const handleAddStudent = () => {
    if (!newStudent.name || !newStudent.email || !newStudent.phone || !newStudent.class) {
      toast({
        title: 'Hata',
        description: 'Lütfen tüm alanları doldurun.',
        variant: 'destructive'
      })
      return
    }

    const student: Student = {
      id: Math.max(...students.map(s => s.id), 0) + 1,
      ...newStudent,
      testsCompleted: 0,
      avgScore: 0,
      lastActivity: new Date().toISOString().split('T')[0],
      status: 'active'
    }

    setStudents(prev => [...prev, student])
    setNewStudent({ name: '', email: '', phone: '', class: '' })
    setIsAddDialogOpen(false)
    
    toast({
      title: 'Başarılı',
      description: 'Öğrenci başarıyla eklendi.'
    })
  }

  const handleExportStudents = () => {
    const dataToExport = {
      exportDate: new Date().toISOString(),
      students: students.map(student => ({
        'Ad Soyad': student.name,
        'E-posta': student.email,
        'Telefon': student.phone,
        'Sınıf': student.class,
        'Tamamlanan Test': student.testsCompleted,
        'Ortalama Puan': student.avgScore,
        'Son Aktivite': student.lastActivity,
        'Durum': student.status === 'active' ? 'Aktif' : 'Pasif'
      }))
    }

    const csvContent = [
      Object.keys(dataToExport.students[0] || {}).join(','),
      ...dataToExport.students.map(student => 
        Object.values(student).map(value => 
          typeof value === 'string' && value.includes(',') ? `"${value}"` : value
        ).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `ogrenciler-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: 'Dışa Aktarıldı',
      description: 'Öğrenci listesi CSV olarak indirildi.'
    })
  }

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.class.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const statsCards = [
    {
      title: 'Toplam Öğrenci',
      value: students.length,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950'
    },
    {
      title: 'Aktif Öğrenci',
      value: students.filter(s => s.status === 'active').length,
      icon: GraduationCap,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950'
    },
    {
      title: 'Ortalama Başarı',
      value: `${(students.reduce((acc, s) => acc + s.avgScore, 0) / students.length).toFixed(1)}%`,
      icon: Award,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950'
    },
    {
      title: 'Toplam Test',
      value: students.reduce((acc, s) => acc + s.testsCompleted, 0),
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Öğrenci Yönetimi
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Öğrenci kayıtları ve performans takibi
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2" onClick={handleExportStudents}>
            <Download className="h-4 w-4" />
            Dışa Aktar
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Öğrenci Ekle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni Öğrenci Ekle</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Ad Soyad</Label>
                  <Input
                    id="name"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Öğrenci adı ve soyadı"
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="ornek@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={newStudent.phone}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="0532 123 4567"
                  />
                </div>
                <div>
                  <Label htmlFor="class">Sınıf</Label>
                  <Select value={newStudent.class} onValueChange={(value) => setNewStudent(prev => ({ ...prev, class: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sınıf seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="9-A">9-A</SelectItem>
                      <SelectItem value="9-B">9-B</SelectItem>
                      <SelectItem value="10-A">10-A</SelectItem>
                      <SelectItem value="10-B">10-B</SelectItem>
                      <SelectItem value="11-A">11-A</SelectItem>
                      <SelectItem value="11-B">11-B</SelectItem>
                      <SelectItem value="12-A">12-A</SelectItem>
                      <SelectItem value="12-B">12-B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    İptal
                  </Button>
                  <Button onClick={handleAddStudent}>
                    Öğrenci Ekle
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <Card key={index} className={`${stat.bgColor} border-0`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Öğrenci ara (isim, email, sınıf)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">Filtrele</Button>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Öğrenci Listesi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredStudents.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {student.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {student.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {student.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {student.phone}
                      </span>
                      <Badge variant="outline">{student.class}</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {student.testsCompleted}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Test</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      %{student.avgScore}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Ortalama</p>
                  </div>
                  <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                    {student.status === 'active' ? 'Aktif' : 'Pasif'}
                  </Badge>
                  <Button variant="outline" size="sm">
                    Detay
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
