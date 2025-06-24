
export interface Exam {
  id: string;
  title: string;
  schoolName: string;
  className: string;
  subject: string;
  date: string;
  duration?: number;
  questionIds: string[];
  settings: {
    showOptions: boolean;
    showAnswers: boolean;
    randomizeOrder: boolean;
    timeLimit?: number;
  };
  createdAt: Date;
  createdBy: string;
  createdByName: string;
}
