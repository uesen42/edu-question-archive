import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Calculator, PlayCircle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const Grade12Topics = () => {
  const topics = [
    {
      title: 'İntegral',
      description: 'Belirsiz ve belirli integral, alan hesaplamaları',
      lessons: 22,
      exercises: 75,
      difficulty: 'Zor'
    },
    {
      title: 'Diferansiyel Denklemler',
      description: 'Birinci dereceden diferansiyel denklemler ve çözümleri',
      lessons: 16,
      exercises: 50,
      difficulty: 'Zor'
    },
    {
      title: 'Karmaşık Sayılar',
      description: 'Karmaşık sayı sistemi, işlemler ve geometrik gösterim',
      lessons: 14,
      exercises: 45,
      difficulty: 'Zor'
    },
    {
      title: 'Matrisler',
      description: 'Matris işlemleri, determinant ve ters matris',
      lessons: 18,
      exercises: 60,
      difficulty: 'Orta'
    },
    {
      title: 'İstatistik',
      description: 'Merkezi eğilim ölçüleri, dağılım ve veri analizi',
      lessons: 15,
      exercises: 50,
      difficulty: 'Kolay'
    },
    {
      title: 'Sınav Hazırlık',
      description: 'YKS matematiği, karma sorular ve tekrar',
      lessons: 20,
      exercises: 100,
      difficulty: 'Zor'
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Kolay': return 'bg-green-100 text-green-800';
      case 'Orta': return 'bg-yellow-100 text-yellow-800';
      case 'Zor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">12. Sınıf Matematik</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          İntegral ve YKS hazırlığı ile matematik serüveninizi tamamlayın
        </p>
        <div className="flex justify-center gap-4">
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {topics.length} Konu
          </Badge>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {topics.reduce((sum, topic) => sum + topic.lessons, 0)} Ders
          </Badge>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {topics.reduce((sum, topic) => sum + topic.exercises, 0)} Soru
          </Badge>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map((topic, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <BookOpen className="h-8 w-8 text-primary" />
                <Badge className={getDifficultyColor(topic.difficulty)}>
                  {topic.difficulty}
                </Badge>
              </div>
              <CardTitle className="text-xl">{topic.title}</CardTitle>
              <CardDescription className="text-sm">
                {topic.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{topic.lessons} Ders</span>
                <span>{topic.exercises} Soru</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" variant="outline" asChild>
                  <Link to={`/math-topics/12/${index}/lessons`}>
                    <PlayCircle className="h-4 w-4 mr-1" />
                    Ders
                  </Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link to={`/math-topics/12/${index}/exercises`}>
                    <FileText className="h-4 w-4 mr-1" />
                    Soru
                  </Link>
                </Button>
              </div>
              
              <Button className="w-full" asChild>
                <Link to={`/math-topics/12/${index}`}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Konuya Başla
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Back to Topics */}
      <div className="text-center">
        <Button variant="outline" size="lg" asChild>
          <Link to="/math-topics">
            ← Tüm Sınıflara Dön
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default Grade12Topics;