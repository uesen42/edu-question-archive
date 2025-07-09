import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  Star, 
  TrendingUp, 
  Target,
  CheckCircle,
  PlayCircle,
  Users,
  Award,
  BookOpen,
  Calendar,
  BarChart3
} from 'lucide-react';

const PracticeTests = () => {
  const [selectedTest, setSelectedTest] = useState(null);

  const practiceTests = [
    {
      id: 1,
      title: '9. Sınıf Matematik Deneme-1',
      description: 'Temel konuları kapsayan kapsamlı deneme sınavı',
      questions: 25,
      duration: 60,
      difficulty: 'Kolay',
      attempted: 234,
      averageScore: 78,
      myBestScore: 85,
      category: '9. Sınıf'
    },
    {
      id: 2,
      title: '10. Sınıf Fonksiyonlar Testi',
      description: 'Fonksiyonlar konusunda derinlemesine test',
      questions: 20,
      duration: 45,
      difficulty: 'Orta',
      attempted: 189,
      averageScore: 68,
      myBestScore: 72,
      category: '10. Sınıf'
    },
    {
      id: 3,
      title: '11. Sınıf Türev Uygulamaları',
      description: 'Türev konusunda pratik problemler',
      questions: 30,
      duration: 75,
      difficulty: 'Zor',
      attempted: 156,
      averageScore: 62,
      myBestScore: null,
      category: '11. Sınıf'
    },
    {
      id: 4,
      title: '12. Sınıf YKS Hazırlık',
      description: 'Üniversite sınavına hazırlık deneme sınavı',
      questions: 40,
      duration: 90,
      difficulty: 'Zor',
      attempted: 312,
      averageScore: 58,
      myBestScore: 65,
      category: '12. Sınıf'
    }
  ];

  const recentResults = [
    { test: '9. Sınıf Matematik Deneme-1', score: 85, date: '2024-01-15', duration: '52 dk' },
    { test: '10. Sınıf Fonksiyonlar Testi', score: 72, date: '2024-01-12', duration: '38 dk' },
    { test: '12. Sınıf YKS Hazırlık', score: 65, date: '2024-01-10', duration: '87 dk' },
  ];

  const studyStats = [
    { icon: Target, label: 'Tamamlanan Test', value: '18', color: 'text-green-600' },
    { icon: Clock, label: 'Toplam Süre', value: '12 saat', color: 'text-blue-600' },
    { icon: TrendingUp, label: 'Ortalama Puan', value: '74', color: 'text-purple-600' },
    { icon: Award, label: 'En Yüksek Puan', value: '95', color: 'text-orange-600' }
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Kolay': return 'bg-green-100 text-green-800';
      case 'Orta': return 'bg-yellow-100 text-yellow-800';
      case 'Zor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Deneme Sınavları</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Gerçek sınav ortamında kendinizi test edin ve gelişim kaydedin
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {studyStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-muted mb-4">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="available" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available">Mevcut Testler</TabsTrigger>
          <TabsTrigger value="results">Sonuçlarım</TabsTrigger>
          <TabsTrigger value="analytics">Analiz</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {practiceTests.map((test) => (
              <Card key={test.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{test.title}</CardTitle>
                      <CardDescription>{test.description}</CardDescription>
                    </div>
                    <Badge className={getDifficultyColor(test.difficulty)}>
                      {test.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span>{test.questions} Soru</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{test.duration} Dakika</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{test.attempted} Kişi Çözdü</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      <span>Ort. %{test.averageScore}</span>
                    </div>
                  </div>

                  {test.myBestScore && (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">En İyi Puanınız</span>
                        <span className={`font-bold ${getScoreColor(test.myBestScore)}`}>
                          %{test.myBestScore}
                        </span>
                      </div>
                      <Progress value={test.myBestScore} className="mt-2" />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button className="flex-1">
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Teste Başla
                    </Button>
                    <Button variant="outline">
                      <Star className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Son Test Sonuçları</CardTitle>
              <CardDescription>
                Son çözdüğünüz testlerin detaylı sonuçları
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-semibold">{result.test}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{result.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{result.duration}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getScoreColor(result.score)}`}>
                        %{result.score}
                      </div>
                      <Button size="sm" variant="outline" className="mt-2">
                        Detayları Gör
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Konu Bazında Performans</CardTitle>
                <CardDescription>
                  Hangi konularda daha iyi olduğunuzu görün
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { topic: 'Cebir', score: 85, questions: 45 },
                  { topic: 'Geometri', score: 72, questions: 38 },
                  { topic: 'Trigonometri', score: 68, questions: 25 },
                  { topic: 'Analiz', score: 61, questions: 20 },
                ].map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{item.topic}</span>
                      <span className={`font-bold ${getScoreColor(item.score)}`}>
                        %{item.score}
                      </span>
                    </div>
                    <Progress value={item.score} />
                    <p className="text-xs text-muted-foreground">
                      {item.questions} soru çözüldü
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gelişim Grafiği</CardTitle>
                <CardDescription>
                  Zaman içindeki performans değişimi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-8 w-8 text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Grafik Yükleniyor...</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-green-600">+12%</p>
                      <p className="text-xs text-muted-foreground">Bu Ay</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">78</p>
                      <p className="text-xs text-muted-foreground">Ortalama</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-600">95</p>
                      <p className="text-xs text-muted-foreground">En Yüksek</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PracticeTests;