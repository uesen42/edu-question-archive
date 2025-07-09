import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Calculator, TrendingUp, Users, Clock, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const MathTopics = () => {
  const gradeTopics = [
    {
      grade: '9. Sınıf',
      topics: [
        'Kümeler',
        'Sayılar ve Cebir',
        'Eşitsizlikler', 
        'Mutlak Değer',
        'Üçgenler',
        'Dörtgenler'
      ],
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      grade: '10. Sınıf',
      topics: [
        'Fonksiyonlar',
        'Polinomlar',
        'İkinci Dereceden Denklemler',
        'Trigonometri',
        'Çember ve Daire',
        'Katı Cisimler'
      ],
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      grade: '11. Sınıf',
      topics: [
        'Türev',
        'Logaritma',
        'Diziler',
        'Limit ve Süreklilik',
        'Analitik Geometri',
        'Olasılık'
      ],
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      grade: '12. Sınıf',
      topics: [
        'İntegral',
        'Diferansiyel Denklemler',
        'Karmaşık Sayılar',
        'Matrisler',
        'İstatistik',
        'Sınav Hazırlık'
      ],
      color: 'bg-red-500',
      textColor: 'text-red-600'
    }
  ];

  const studyStats = [
    { icon: BookOpen, label: 'Toplam Konu', value: '24', color: 'text-primary' },
    { icon: Users, label: 'Aktif Öğrenci', value: '1,234', color: 'text-blue-600' },
    { icon: Clock, label: 'Ortalama Çalışma', value: '2.5 saat', color: 'text-green-600' },
    { icon: Award, label: 'Başarı Oranı', value: '%87', color: 'text-purple-600' }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Matematik Konu Anlatımları</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          9-12. sınıf matematik konularını detaylı anlatımlarla öğrenin ve sorularla pekiştirin
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {studyStats.map((stat, index) => (
          <Card key={index} className="text-center">
            <CardContent className="p-6">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-muted mb-4`}>
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

      {/* Grade Topics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {gradeTopics.map((grade, index) => (
          <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold">{grade.grade}</CardTitle>
                <Badge variant="secondary" className={grade.textColor}>
                  {grade.topics.length} Konu
                </Badge>
              </div>
              <CardDescription>
                Temel matematik konularından ileri seviye konulara kadar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {grade.topics.map((topic, topicIndex) => (
                  <Button
                    key={topicIndex}
                    variant="outline"
                    size="sm"
                    className="justify-start h-auto p-3 text-left"
                    asChild
                  >
                    <Link to={`/math-topics/${index + 9}/${topicIndex}`}>
                      <div>
                        <BookOpen className="h-4 w-4 mr-2 inline" />
                        <span className="text-sm">{topic}</span>
                      </div>
                    </Link>
                  </Button>
                ))}
              </div>
              
              <div className="pt-4 border-t">
                <Button className="w-full" asChild>
                  <Link to={`/math-topics/${index + 9}`}>
                    <Calculator className="h-4 w-4 mr-2" />
                    {grade.grade} Konularını Gör
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Access Section */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardHeader>
          <CardTitle className="text-center">Hızlı Erişim</CardTitle>
          <CardDescription className="text-center">
            En popüler matematik araçlarına hızlıca erişin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button size="lg" variant="outline" className="h-auto p-6" asChild>
              <Link to="/problem-solving">
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                  <div>
                    <p className="font-semibold">Soru Çözme</p>
                    <p className="text-sm text-muted-foreground">Adım adım çözümler</p>
                  </div>
                </div>
              </Link>
            </Button>
            
            <Button size="lg" variant="outline" className="h-auto p-6" asChild>
              <Link to="/math-tools">
                <div className="text-center">
                  <Calculator className="h-8 w-8 mx-auto mb-2" />
                  <div>
                    <p className="font-semibold">Matematik Araçları</p>
                    <p className="text-sm text-muted-foreground">Hesap makineleri ve araçlar</p>
                  </div>
                </div>
              </Link>
            </Button>
            
            <Button size="lg" variant="outline" className="h-auto p-6" asChild>
              <Link to="/practice-tests">
                <div className="text-center">
                  <Award className="h-8 w-8 mx-auto mb-2" />
                  <div>
                    <p className="font-semibold">Deneme Sınavları</p>
                    <p className="text-sm text-muted-foreground">Kendinizi test edin</p>
                  </div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MathTopics;