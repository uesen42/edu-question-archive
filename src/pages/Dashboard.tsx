
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Users, 
  FileText, 
  TrendingUp, 
  Plus, 
  Star,
  Clock,
  Target,
  Award,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { useQuestionStore } from '@/store/questionStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell } from 'recharts';

export default function Dashboard() {
  const { questions, categories, tests, loadQuestions, loadCategories, loadTests } = useQuestionStore();
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadQuestions();
    loadCategories();
    loadTests();
  }, [loadQuestions, loadCategories, loadTests]);

  // İstatistik hesaplamaları
  const totalQuestions = questions.length;
  const totalCategories = categories.length;
  const totalTests = tests.length;

  const difficultyStats = {
    kolay: questions.filter(q => q.difficultyLevel === 'kolay').length,
    orta: questions.filter(q => q.difficultyLevel === 'orta').length,
    zor: questions.filter(q => q.difficultyLevel === 'zor').length,
  };

  const gradeStats = questions.reduce((acc, q) => {
    acc[q.grade] = (acc[q.grade] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const categoryStats = categories.map(cat => ({
    name: cat.name,
    count: questions.filter(q => q.categoryId === cat.id).length,
    color: cat.color
  }));

  const gradeChartData = Object.entries(gradeStats).map(([grade, count]) => ({
    grade: `${grade}. Sınıf`,
    count
  }));

  const difficultyChartData = [
    { name: 'Kolay', value: difficultyStats.kolay, color: '#10B981' },
    { name: 'Orta', value: difficultyStats.orta, color: '#F59E0B' },
    { name: 'Zor', value: difficultyStats.zor, color: '#EF4444' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Soru bankası yönetim sisteminize genel bakış</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Rapor Oluştur
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Yeni Soru Ekle
          </Button>
        </div>
      </div>

      {/* Ana İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Soru</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuestions}</div>
            <p className="text-xs text-muted-foreground">
              +12% geçen aydan
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kategoriler</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCategories}</div>
            <p className="text-xs text-muted-foreground">
              Aktif kategoriler
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Testler</CardTitle>
            <FileText className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTests}</div>
            <p className="text-xs text-muted-foreground">
              Oluşturulan testler
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Başarı Oranı</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">
              Ortalama test başarısı
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grafikler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Sınıf Dağılımı
            </CardTitle>
            <CardDescription>Sorular sınıflara göre dağılım</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gradeChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="grade" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Zorluk Dağılımı
            </CardTitle>
            <CardDescription>Sorular zorluk seviyesine göre</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={difficultyChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {difficultyChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {difficultyChartData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kategori İstatistikleri */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Kategori Performansı
          </CardTitle>
          <CardDescription>Her kategorideki soru sayısı ve yüzdesi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryStats.map((cat, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  ></div>
                  <span className="font-medium">{cat.name}</span>
                </div>
                <div className="flex items-center gap-3 min-w-0 flex-1 ml-4">
                  <Progress 
                    value={(cat.count / totalQuestions) * 100} 
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600 min-w-fit">
                    {cat.count} soru ({Math.round((cat.count / totalQuestions) * 100)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Son Aktiviteler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Son Aktiviteler
            </CardTitle>
            <CardDescription>Sistemdeki son değişiklikler</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {questions.slice(0, 5).map((question, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{question.title}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(question.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {question.difficultyLevel}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Hedefler
            </CardTitle>
            <CardDescription>Bu ay için hedefleriniz</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Yeni sorular</span>
                  <span>{totalQuestions}/100</span>
                </div>
                <Progress value={(totalQuestions / 100) * 100} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Test oluşturma</span>
                  <span>{totalTests}/20</span>
                </div>
                <Progress value={(totalTests / 20) * 100} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Kategori çeşitliliği</span>
                  <span>{totalCategories}/10</span>
                </div>
                <Progress value={(totalCategories / 10) * 100} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
