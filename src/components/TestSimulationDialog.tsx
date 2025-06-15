
import { useState } from "react";
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
  const testQuestions = questions.filter(q => test.questionIds.includes(q.id));
  const total = testQuestions.length;
  const currentIdx = Object.keys(answers).length;
  const currentQuestion = testQuestions[currentIdx];

  const handleOptionSelect = (qid: string, idx: number) => {
    setAnswers(a => ({ ...a, [qid]: idx }));
  };

  const handleNext = () => {
    if (currentIdx + 1 < total) {
      // ilerle
    } else {
      setStep("result");
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
      if (q.options && typeof q.correctAnswer === "number" && answers[q.id] === q.correctAnswer) {
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
            <div>
              <span className="font-bold">{currentIdx + 1}. Soru</span>
              <Badge variant="secondary" className="ml-3">{(categories.find(cat => cat.id === currentQuestion.categoryId)?.name) || "Kategori yok"}</Badge>
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
                    disabled={currentQuestion.id in answers}
                  >
                    <span className="mr-3">{String.fromCharCode(65+idx)}</span>
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
                disabled={!(currentQuestion.id in answers)}
              >
                {currentIdx + 1 === total ? "Bitir ve Sonucu Göster" : "Sonraki Soru"}
              </Button>
            </div>
          </div>
        ) : (
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
                    <span>{i+1}.</span>
                    <span>{q.title}</span>
                    {typeof q.correctAnswer === "number" && (
                      <Badge variant={answers[q.id] === q.correctAnswer ? "secondary" : "destructive"} className="ml-2">
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
        )}
      </DialogContent>
    </Dialog>
  );
}
