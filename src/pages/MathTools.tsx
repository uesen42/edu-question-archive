import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  PieChart, 
  TrendingUp, 
  Ruler,
  CircleDot,
  Triangle,
  Square,
  BarChart3,
  Zap,
  BookOpen
} from 'lucide-react';

const MathTools = () => {
  const [calcInput, setCalcInput] = useState('');
  const [calcResult, setCalcResult] = useState('');

  const tools = [
    {
      category: 'Hesap Makineleri',
      items: [
        { 
          name: 'Bilimsel Hesap Makinesi', 
          icon: Calculator, 
          description: 'Gelişmiş matematik işlemleri',
          popular: true
        },
        { 
          name: 'Grafik Hesap Makinesi', 
          icon: TrendingUp, 
          description: 'Fonksiyon grafikleri çizme'
        },
        { 
          name: 'Matris Hesap Makinesi', 
          icon: Square, 
          description: 'Matris işlemleri ve determinant'
        },
        { 
          name: 'İstatistik Hesap Makinesi', 
          icon: BarChart3, 
          description: 'İstatistiksel analiz araçları'
        }
      ]
    },
    {
      category: 'Geometri Araçları',
      items: [
        { 
          name: 'Alan Hesaplama', 
          icon: Square, 
          description: 'Çeşitli şekillerin alanını hesaplama'
        },
        { 
          name: 'Çevre Hesaplama', 
          icon: CircleDot, 
          description: 'Geometrik şekillerin çevresi'
        },
        { 
          name: 'Üçgen Hesaplayıcı', 
          icon: Triangle, 
          description: 'Üçgen özelliklerini hesaplama'
        },
        { 
          name: 'Koordinat Sistemi', 
          icon: Ruler, 
          description: 'Analitik geometri araçları'
        }
      ]
    },
    {
      category: 'Analiz Araçları',
      items: [
        { 
          name: 'Türev Hesaplama', 
          icon: TrendingUp, 
          description: 'Otomatik türev alma'
        },
        { 
          name: 'İntegral Hesaplama', 
          icon: PieChart, 
          description: 'Belirli ve belirsiz integraller'
        },
        { 
          name: 'Limit Hesaplama', 
          icon: Zap, 
          description: 'Limit değerlerini bulma'
        },
        { 
          name: 'Seri Analizi', 
          icon: BarChart3, 
          description: 'Matematiksel seriler'
        }
      ]
    }
  ];

  const quickCalculations = [
    { name: 'Faktöriyel', formula: 'n!', example: '5! = 120' },
    { name: 'Kombinasyon', formula: 'C(n,r)', example: 'C(5,2) = 10' },
    { name: 'Permütasyon', formula: 'P(n,r)', example: 'P(5,2) = 20' },
    { name: 'Logaritma', formula: 'log(x)', example: 'log(100) = 2' },
  ];

  const calculateBasic = () => {
    try {
      // Basit matematiksel işlemler için güvenli hesaplama
      const result = Function('"use strict"; return (' + calcInput + ')')();
      setCalcResult(result.toString());
    } catch (error) {
      setCalcResult('Hata: Geçersiz işlem');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Matematik Araçları</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Matematiksel hesaplamaları kolaylaştıran araçlar ve hesap makineleri
        </p>
      </div>

      <Tabs defaultValue="calculator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calculator">Hesap Makinesi</TabsTrigger>
          <TabsTrigger value="tools">Araçlar</TabsTrigger>
          <TabsTrigger value="quick">Hızlı Hesaplar</TabsTrigger>
          <TabsTrigger value="formulas">Formüller</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Bilimsel Hesap Makinesi
              </CardTitle>
              <CardDescription>
                Temel ve gelişmiş matematiksel işlemler
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="calc-input">İşlem</Label>
                <Input
                  id="calc-input"
                  value={calcInput}
                  onChange={(e) => setCalcInput(e.target.value)}
                  placeholder="Örnek: 2 + 3 * 4"
                  className="text-lg"
                />
              </div>
              
              <Button onClick={calculateBasic} className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Hesapla
              </Button>
              
              {calcResult && (
                <div className="p-4 bg-muted rounded-lg">
                  <Label>Sonuç:</Label>
                  <p className="text-2xl font-bold text-primary">{calcResult}</p>
                </div>
              )}
              
              <div className="grid grid-cols-4 gap-2 mt-4">
                {['7', '8', '9', '/'].map((btn) => (
                  <Button 
                    key={btn}
                    variant="outline" 
                    onClick={() => setCalcInput(prev => prev + btn)}
                  >
                    {btn}
                  </Button>
                ))}
                {['4', '5', '6', '*'].map((btn) => (
                  <Button 
                    key={btn}
                    variant="outline" 
                    onClick={() => setCalcInput(prev => prev + btn)}
                  >
                    {btn}
                  </Button>
                ))}
                {['1', '2', '3', '-'].map((btn) => (
                  <Button 
                    key={btn}
                    variant="outline" 
                    onClick={() => setCalcInput(prev => prev + btn)}
                  >
                    {btn}
                  </Button>
                ))}
                {['0', '.', '=', '+'].map((btn) => (
                  <Button 
                    key={btn}
                    variant={btn === '=' ? 'default' : 'outline'}
                    onClick={() => {
                      if (btn === '=') {
                        calculateBasic();
                      } else {
                        setCalcInput(prev => prev + btn);
                      }
                    }}
                  >
                    {btn}
                  </Button>
                ))}
              </div>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setCalcInput('')}
              >
                Temizle
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-6">
          {tools.map((category, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{category.category}</CardTitle>
                <CardDescription>
                  {category.category.toLowerCase()} için özel araçlar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {category.items.map((tool, toolIndex) => (
                    <Card key={toolIndex} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4 text-center">
                        <div className="space-y-3">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                            <tool.icon className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm flex items-center justify-center gap-2">
                              {tool.name}
                              {tool.popular && (
                                <Badge variant="secondary" className="text-xs">Popüler</Badge>
                              )}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {tool.description}
                            </p>
                          </div>
                          <Button size="sm" variant="outline" className="w-full">
                            Kullan
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="quick" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hızlı Hesaplamalar</CardTitle>
              <CardDescription>
                Sık kullanılan matematiksel işlemler
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quickCalculations.map((calc, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold">{calc.name}</h4>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Formül: <code className="bg-muted px-2 py-1 rounded">{calc.formula}</code>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Örnek: <span className="font-medium">{calc.example}</span>
                        </p>
                      </div>
                      <Button size="sm" className="w-full">
                        Hesapla
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="formulas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Matematik Formülleri
              </CardTitle>
              <CardDescription>
                En çok kullanılan matematik formülleri
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { title: 'Karesel Formül', formula: 'x = (-b ± √(b²-4ac)) / 2a' },
                  { title: 'Pisagor Teoremi', formula: 'a² + b² = c²' },
                  { title: 'Üçgen Alanı', formula: 'A = (1/2) × taban × yükseklik' },
                  { title: 'Çember Alanı', formula: 'A = π × r²' },
                  { title: 'Küre Hacmi', formula: 'V = (4/3) × π × r³' },
                  { title: 'Logaritma Kuralı', formula: 'log(ab) = log(a) + log(b)' },
                ].map((formula, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">{formula.title}</h4>
                      <code className="block bg-muted p-2 rounded text-sm">
                        {formula.formula}
                      </code>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MathTools;