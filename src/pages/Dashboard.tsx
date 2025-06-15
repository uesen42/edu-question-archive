
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, FileText, FolderOpen, TrendingUp } from 'lucide-react';
import { useQuestionStore } from '@/store/questionStore';

export default function Dashboard() {
  const { questions, categories, tests, loadQuestions, loadCategories, loadTests } = useQuestionStore();

  useEffect(() => {
    loadQuestions();
    loadCategories();
    loadTests();
  }, [loadQuestions, loadCategories, loadTests]);

  const stats = [
    {
      title: 'Toplam Soru',
      value: questions.length,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Kategoriler',
      value: categories.length,
      icon: FolderOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Testler',
      value: tests.length,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Bu Ay Eklenen',
      value: questions.filter(q => {
        const questionDate = new Date(q.createdAt);
        const now = new Date();
        return questionDate.getMonth() === now.getMonth() && 
               questionDate.getFullYear() === now.getFullYear();
      }).length,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  const difficultyStats = {
    kolay: questions.filter(q => q.difficultyLevel === 'kolay').length,
    orta: questions.filter(q => q.difficultyLevel === 'orta').length,
    zor: questions.filter(q => q.difficultyLevel === 'zor').length,
  };

  const gradeStats = [1, 2, 3, 4, 5].map(grade => ({
    grade,
    count: questions.filter(q => q.grade === grade).length,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Anasayfa</h1>
        <p className="text-gray-600 mt-2">Soru bankası sistemine hoş geldiniz!</p>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Zorluk Seviyesi Dağılımı */}
        <Card>
          <CardHeader>
            <CardTitle>Zorluk Seviyesi Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(difficultyStats).map(([level, count]) => (
                <div key={level} className="flex items-center justify-between">
                  <span className="capitalize text-sm font-medium">{level}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          level === 'kolay' ? 'bg-green-500' :
                          level === 'orta' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ 
                          width: questions.length > 0 ? `${(count / questions.length) * 100}%` : '0%' 
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sınıf Seviyesi Dağılımı */}
        <Card>
          <CardHeader>
            <CardTitle>Sınıf Seviyesi Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {gradeStats.map(({ grade, count }) => (
                <div key={grade} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{grade}. Sınıf</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ 
                          width: questions.length > 0 ? `${(count / questions.length) * 100}%` : '0%' 
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Son Eklenen Sorular */}
      <Card>
        <CardHeader>
          <CardTitle>Son Eklenen Sorular</CardTitle>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Henüz hiç soru eklenmemiş. Sorular sayfasından yeni sorular ekleyebilirsiniz.
            </p>
          ) : (
            <div className="space-y-3">
              {questions
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 5)
                .map((question) => (
                  <div key={question.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{question.title}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(question.createdAt).toLocaleDateString('tr-TR')} - {question.difficultyLevel}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {question.grade}. Sınıf
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
