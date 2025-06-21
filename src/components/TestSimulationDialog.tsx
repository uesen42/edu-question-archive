
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MathRenderer } from "@/components/MathRenderer";
import { Test, Question, Category } from "@/types";

interface TestSimulationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  test: Test | null;
  questions: Question[];
  categories: Category[];
}

// Yardımcı: mm:ss format
function formatTimeLeft(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m < 10 ? "0" + m : m}:${s < 10 ? "0" + s : s}`;
}

export function TestSimulationDialog({
  open,
  onOpenChange,
  test,
  questions,
  categories,
}: TestSimulationDialogProps) {
  if (!open || !test) return null;

  const [step, setStep] = useState<"solve" | "result">("solve");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null); // Saniye olarak
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const testQuestions = questions.filter(q => test.questionIds.includes(q.id));
  const total = testQuestions.length;
  const currentIdx = Object.keys(answers).length;
  const currentQuestion = testQuestions[currentIdx];

  const timeLimit = test.settings.timeLimit ? test.settings.timeLimit * 60 : null; // dk => sn

  // Zamanlayıcı setup
  useEffect(() => {
    if (step === "solve" && timeLimit) {
      setTimeLeft(timeLimit);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t === null) return null;
          if (t <= 1) {
            clearInterval(timerRef.current!);
            setStep("result");
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    } else {
      setTimeLeft(null);
      if (timerRef.current) clearInterval(timerRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step, timeLimit]);

  const handleOptionSelect = (qid: string, idx: number) => {
    setAnswers(a => ({ ...a, [qid]: idx }));
  };

  const handleNext = () => {
    if (currentIdx + 1 < total) {
      // ilerle
    } else {
      setStep("result");
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setStep("solve");
  };

  // Sonuç analizi
  let correctCount = 0;
  let wrongCount = 0;
  if (step === "result") {
    correctCount = testQuestions.reduce((acc, q) => {
      if (
        q.options &&
        typeof q.correctAnswer === "number" &&
        answers[q.id] === q.correctAnswer
      ) {
        return acc + 1;
      }
      return acc;
    }, 0);
    wrongCount = total - correctCount;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {test.title} {step === "solve" ? "— Test Çöz" : "— Sonuçlar"}
          </DialogTitle>
        </DialogHeader>
        {step === "solve" && currentQuestion ? (
          <div className="space-y-5">
            {/* Zamanlayıcı varsa yukarıda göster */}
            {timeLimit && (
              <div className="flex items-center mb-2 gap-2">
                <Badge variant={timeLeft !== null && timeLeft <= 15 ? "destructive" : "secondary"}>
                  Süre: {typeof timeLeft === "number" ? formatTimeLeft(timeLeft) : formatTimeLeft(timeLimit)}
                </Badge>
                {typeof timeLeft === "number" && timeLeft <= 15 && (
                  <span className="text-destructive text-xs animate-pulse">Sona yaklaşıyor!</span>
                )}
              </div>
            )}

            <div>
              <span className="font-bold">{currentIdx + 1}. Soru</span>
              <Badge variant="secondary" className="ml-3">
                {categories.find(cat => cat.id === currentQuestion.categoryId)?.name || "Kategori yok"}
              </Badge>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <MathRenderer content={currentQuestion.content} />
            </div>
            {currentQuestion.options && (
              <div className="flex flex-col gap-2 mt-4">
                {currentQuestion.options.map((opt, idx) => (
                  <Button
                    key={idx}
                    variant={answers[currentQuestion.id] === idx ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => {
                      handleOptionSelect(currentQuestion.id, idx);
                    }}
                    disabled={
                      currentQuestion.id in answers ||
                      step === "result" ||
                      (typeof timeLeft === "number" && timeLeft <= 0)
                    }
                  >
                    <span className="mr-3">{String.fromCharCode(65 + idx)}</span>
                    {opt}
                  </Button>
                ))}
              </div>
            )}
            {!currentQuestion.options && (
              <div className="text-gray-500 italic text-sm">Bu soru için cevap seçenekleri eklenmemiştir.</div>
            )}

            <div className="flex justify-end mt-4">
              <Button
                onClick={handleNext}
                disabled={
                  !(currentQuestion.id in answers) ||
                  step === "result" ||
                  (typeof timeLeft === "number" && timeLeft <= 0)
                }
              >
                {currentIdx + 1 === total ? "Bitir ve Sonucu Göster" : "Sonraki Soru"}
              </Button>
            </div>
            {(typeof timeLeft === "number" && timeLeft <= 0) && (
              <div className="text-destructive text-center text-xs mt-2">
                Süre doldu! Sonuçlar gösteriliyor.
              </div>
            )}
          </div>
        ) : step === "result" ? (
          <div className="space-y-3">
            <div className="mb-3">
              <div className="text-lg font-bold">Test Sonucu</div>
              <div>
                <Badge variant="default" className="mr-2">Doğru: {correctCount}</Badge>
                <Badge variant="destructive" className="mr-2">Yanlış: {wrongCount}</Badge>
                <Badge variant="secondary">Toplam: {total}</Badge>
              </div>
            </div>
            <div>
              <ul className="text-sm space-y-1">
                {testQuestions.map((q, i) => (
                  <li key={q.id} className="flex items-start gap-2">
                    <span>{i + 1}.</span>
                    <span>{q.title}</span>
                    {typeof q.correctAnswer === "number" && (
                      <Badge
                        variant={answers[q.id] === q.correctAnswer ? "secondary" : "destructive"}
                        className="ml-2"
                      >
                        {answers[q.id] === q.correctAnswer ? "Doğru" : "Yanlış"}
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-between mt-4">
              <Button onClick={handleRetry} variant="outline">Tekrar Çöz</Button>
              <Button onClick={() => onOpenChange(false)}>Kapat</Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
