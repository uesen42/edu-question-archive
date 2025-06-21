
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle, XCircle, RotateCcw, Trophy } from 'lucide-react';
import { Test, Question, Category } from '@/types';
import { MathRenderer } from './MathRenderer';

interface TestSimulationDialogProps {
  test: Test | null;
  questions: Question[];
  categories: Category[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SimulationStep = 'solve' | 'result';

export function TestSimulationDialog({
  test,
  questions,
  categories,
  open,
  onOpenChange
}: TestSimulationDialogProps) {
  const [step, setStep] = useState<SimulationStep>('solve');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Timer effect
  useEffect(() => {
    if (!isTimerActive || timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          setIsTimerActive(false);
          setStep('result');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerActive, timeRemaining]);

  // Reset when dialog opens
  useEffect(() => {
    if (open && test) {
      setStep('solve');
      setCurrentQuestionIndex(0);
      setAnswers({});
      
      if (test.settings.timeLimit) {
        setTimeRemaining(test.settings.timeLimit * 60);
        setIsTimerActive(true);
      } else {
        setTimeRemaining(null);
        setIsTimerActive(false);
      }
    }
  }, [open, test]);

  if (!test || questions.length === 0) return null;

  const testQuestions = questions.filter(q => test.questionIds.includes(q.id));
  const currentQuestion = testQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / testQuestions.length) * 100;

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < testQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleFinishTest = () => {
    setStep('result');
    setIsTimerActive(false);
  };

  const handleRestart = () => {
    setStep('solve');
    setCurrentQuestionIndex(0);
    setAnswers({});
    
    if (test.settings.timeLimit) {
      setTimeRemaining(test.settings.timeLimit * 60);
      setIsTimerActive(true);
    }
  };

  const getCategoryById = (id: string) => {
    return categories.find(cat => cat.id === id);
  };

  const getAnsweredCount = () => {
    return testQuestions.filter(q => answers[q.id]).length;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{test.title}</span>
            {timeRemaining !== null && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span className={timeRemaining < 300 ? 'text-red-600 font-bold' : ''}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        {step === 'solve' && (
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Soru {currentQuestionIndex + 1} / {testQuestions.length}</span>
                <span>Cevaplanmış: {getAnsweredCount()} / {testQuestions.length}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Current Question */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Soru {currentQuestionIndex + 1}</span>
                  {getCategoryById(currentQuestion.categoryId) && (
                    <Badge 
                      style={{ 
                        backgroundColor: getCategoryById(currentQuestion.categoryId)?.color || '#gray'
                      }}
                    >
                      {getCategoryById(currentQuestion.categoryId)?.name}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">{currentQuestion.title}</h3>
                  <MathRenderer content={currentQuestion.content} />
                </div>

                {/* Question Images */}
                {currentQuestion.imageUrls && currentQuestion.imageUrls.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {currentQuestion.imageUrls.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Soru görseli ${index + 1}`}
                        className="w-full h-auto rounded border"
                      />
                    ))}
                  </div>
                )}

                {/* Answer Options */}
                {test.settings.showOptions && currentQuestion.options && (
                  <div className="space-y-2">
                    <p className="font-medium">Seçenekler:</p>
                    {currentQuestion.options.map((option, index) => (
                      <label
                        key={index}
                        className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestion.id}`}
                          value={option}
                          checked={answers[currentQuestion.id] === option}
                          onChange={(e) => handleAnswerSelect(currentQuestion.id, e.target.value)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <span className="font-medium">{String.fromCharCode(65 + index)}) </span>
                          <MathRenderer content={option} />
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {/* Free Text Answer */}
                {!test.settings.showOptions && (
                  <div className="space-y-2">
                    <p className="font-medium">Cevabınız:</p>
                    <textarea
                      value={answers[currentQuestion.id] || ''}
                      onChange={(e) => handleAnswerSelect(currentQuestion.id, e.target.value)}
                      placeholder="Cevabınızı buraya yazın..."
                      className="w-full p-3 border rounded-lg"
                      rows={4}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Önceki Soru
              </Button>
              
              <div className="flex gap-2">
                {currentQuestionIndex === testQuestions.length - 1 ? (
                  <Button onClick={handleFinishTest} className="bg-green-600 hover:bg-green-700">
                    Testi Bitir
                  </Button>
                ) : (
                  <Button onClick={handleNextQuestion}>
                    Sonraki Soru
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 'result' && (
          <div className="space-y-6">
            <div className="text-center">
              <Trophy className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Test Tamamlandı!</h2>
              <p className="text-gray-600">Tebrikler, testi başarıyla tamamladınız.</p>
            </div>

            {/* Test Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Test Özeti</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {getAnsweredCount()}
                    </div>
                    <div className="text-sm text-gray-600">Cevaplanmış Soru</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">
                      {testQuestions.length - getAnsweredCount()}
                    </div>
                    <div className="text-sm text-gray-600">Cevaplanmamış Soru</div>
                  </div>
                </div>
                
                {timeRemaining !== null && (
                  <div className="text-center pt-4 border-t">
                    <div className="text-lg font-medium">
                      Süre: {test.settings.timeLimit ? 
                        `${Math.floor((test.settings.timeLimit * 60 - timeRemaining) / 60)}:${((test.settings.timeLimit * 60 - timeRemaining) % 60).toString().padStart(2, '0')}` : 
                        'Sınırsız'
                      }
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Answered Questions */}
            <Card>
              <CardHeader>
                <CardTitle>Verilen Cevaplar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {testQuestions.map((question, index) => {
                  const category = getCategoryById(question.categoryId);
                  const userAnswer = answers[question.id];
                  
                  return (
                    <div key={question.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">
                          {index + 1}. {question.title}
                        </h4>
                        {category && (
                          <Badge style={{ backgroundColor: category.color || '#gray' }}>
                            {category.name}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {userAnswer ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm">
                              Cevap: <strong>{userAnswer}</strong>
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span className="text-sm text-gray-600">Cevaplanmadı</span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        )}

        <DialogFooter>
          {step === 'result' && (
            <Button variant="outline" onClick={handleRestart} className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Tekrar Çöz
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Kapat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
