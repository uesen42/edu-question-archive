import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calculator, 
  Clock, 
  Star, 
  TrendingUp, 
  BookOpen, 
  Target,
  CheckCircle,
  PlayCircle,
  Users,
  Award
} from 'lucide-react';

const ProblemSolving = () => {
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');

  const problemCategories = [
    {
      title: 'Temel Matematik',
      problems: [
        { title: 'Sayılar ve İşlemler', difficulty: 'Kolay', time: '5-10 dk', solved: 145, total: 200 },
        { title: 'Kesirler ve Ondalık Sayılar', difficulty: 'Kolay', time: '5-15 dk', solved: 98, total: 150 },
        { title: 'Yüzdeler', difficulty: 'Orta', time: '10-20 dk', solved: 76, total: 120 },
      ]
    },
    {
      title: 'Cebir',
      problems: [
        { title: 'Denklemler', difficulty: 'Orta', time: '15-25 dk', solved: 89, total: 180 },
        { title: 'Eşitsizlikler', difficulty: 'Orta', time: '10-20 dk', solved: 67, total: 140 },
        { title: 'Fonksiyonlar', difficulty: 'Zor', time: '20-30 dk', solved: 45, total: 100 },
      ]
    },
    {
      title: 'Geometri',
      problems: [
        { title: 'Açılar ve Üçgenler', difficulty: 'Kolay', time: '10-15 dk', solved: 112, total: 160 },
        { title: 'Çember ve Daire', difficulty: 'Orta', time: '15-25 dk', solved: 78, total: 130 },
        { title: 'Analitik Geometri', difficulty: 'Zor', time: '25-35 dk', solved: 34, total: 90 },
      ]
    }
  ];

  const recentProblems = [
    { title: 'İkinci Dereceden Denklem Çözümü', topic: 'Cebir', difficulty: 'Orta', status: 'completed' },
    { title: 'Üçgen Alan Hesaplama', topic: 'Geometri', difficulty: 'Kolay', status: 'in-progress' },
    { title: 'Logaritma İşlemleri', topic: 'Cebir', difficulty: 'Zor', status: 'not-started' },
    { title: 'Trigonometrik Özdeşlikler', topic: 'Trigonometri', difficulty: 'Zor', status: 'completed' },
  ];

  const studyStats = [
    { icon: Target, label: 'Çözülen Soru', value: '423', color: 'text-green-600' },
    { icon: Clock, label: 'Toplam Süre', value: '48 saat', color: 'text-blue-600' },
    { icon: TrendingUp, label: 'Başarı Oranı', value: '%78', color: 'text-purple-600' },
    { icon: Award, label: 'Rozetler', value: '12', color: 'text-orange-600' }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Kolay': return 'bg-green-100 text-green-800';
      case 'Orta': return 'bg-yellow-100 text-yellow-800';
      case 'Zor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in-progress': return <PlayCircle className="h-4 w-4 text-blue-600" />;
      default: return <BookOpen className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Soru Çözme Merkezi</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Adım adım çözümlerle matematik becerilerinizi geliştirin
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

      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="categories">Konu Kategorileri</TabsTrigger>
          <TabsTrigger value="recent">Son Çözülenler</TabsTrigger>
          <TabsTrigger value="practice">Pratik Yapmaya Başla</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-6">
          <div className="space-y-6">
            {problemCategories.map((category, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    {category.title}
                  </CardTitle>
                  <CardDescription>
                    Bu kategorideki problemleri çözerek konuyu pekiştirin
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.problems.map((problem, problemIndex) => (
                      <Card key={problemIndex} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <h4 className="font-semibold text-sm">{problem.title}</h4>
                              <Badge className={getDifficultyColor(problem.difficulty)}>
                                {problem.difficulty}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{problem.time}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                {problem.solved}/{problem.total} çözüldü
                              </span>
                            </div>
                            
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary rounded-full h-2 transition-all"
                                style={{ width: `${(problem.solved / problem.total) * 100}%` }}
                              />
                            </div>
                            
                            <Button className="w-full" size="sm">
                              <PlayCircle className="h-4 w-4 mr-2" />
                              Çözmeye Başla
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Son Çözülen Problemler</CardTitle>
              <CardDescription>
                Son zamanlarda üzerinde çalıştığınız problemler
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentProblems.map((problem, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(problem.status)}
                      <div>
                        <h4 className="font-semibold">{problem.title}</h4>
                        <p className="text-sm text-muted-foreground">{problem.topic}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getDifficultyColor(problem.difficulty)}>
                        {problem.difficulty}
                      </Badge>
                      <Button size="sm" variant="outline">Devam Et</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="practice" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Özelleştirilmiş Pratik</CardTitle>
              <CardDescription>
                Kendi seviyenize uygun problemler oluşturun
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Konu Seçin</label>
                  <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                    <SelectTrigger>
                      <SelectValue placeholder="Bir konu seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="algebra">Cebir</SelectItem>
                      <SelectItem value="geometry">Geometri</SelectItem>
                      <SelectItem value="trigonometry">Trigonometri</SelectItem>
                      <SelectItem value="calculus">Analiz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Zorluk Seviyesi</label>
                  <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                    <SelectTrigger>
                      <SelectValue placeholder="Zorluk seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Kolay</SelectItem>
                      <SelectItem value="medium">Orta</SelectItem>
                      <SelectItem value="hard">Zor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button size="lg" className="w-full">
                <Star className="h-5 w-5 mr-2" />
                Özelleştirilmiş Pratik Başlat
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProblemSolving;