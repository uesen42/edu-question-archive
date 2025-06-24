
// src/pages/TestDetailPage.tsx

import React from 'react';
import { PdfExportButton } from '@/components/PdfExportButton';
import { Test, Question, Category } from '@/types';

export default function TestDetailPage() {
  // Mock data for demonstration - in a real app, this would come from props or API
  const mockTest: Test = {
    id: '1',
    title: "Deneme Testi - Matematik",
    description: "Matematik konularında deneme testi",
    questionIds: ['q1', 'q2'],
    settings: {
      showOptions: true,
      showAnswers: true,
      randomizeOrder: false,
      timeLimit: 60
    },
    createdAt: new Date(),
    createdBy: 'user1',
    createdByName: 'Test Kullanıcısı'
  };

  const mockQuestions: Question[] = [
    {
      id: 'q1',
      title: 'Matematik Denklemi',
      content: 'Bu bir örnek matematik sorusudur: $x^2 + 2x + 1 = 0$ denkleminin çözümü nedir?',
      imageUrls: [],
      options: ['x = -1', 'x = 1', 'x = 0', 'x = 2'],
      correctAnswer: 0,
      categoryId: 'cat1',
      grade: 9,
      difficultyLevel: 'orta',
      tags: ['matematik', 'denklem'],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdByName: 'Test Kullanıcısı'
    },
    {
      id: 'q2',
      title: 'Pi Sayısı',
      content: 'Aşağıdaki ifadelerden hangisi doğrudur? $\\pi \\approx 3.14$',
      imageUrls: [],
      options: ['Pi sayısı rasyonel bir sayıdır', 'Pi sayısı irrasyonel bir sayıdır', 'Pi = 3', 'Pi < 3'],
      correctAnswer: 1,
      categoryId: 'cat1',
      grade: 9,
      difficultyLevel: 'kolay',
      tags: ['matematik', 'pi'],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdByName: 'Test Kullanıcısı'
    }
  ];

  const mockCategories: Category[] = [
    {
      id: 'cat1',
      name: 'Matematik',
      description: 'Matematik soruları',
      color: '#3b82f6',
      createdAt: new Date()
    }
  ];

  return (
    <div style={{ padding: '40px' }}>
      <h1>{mockTest.title}</h1>
      <p>Bu sayfada test detayları yer alıyor.</p>

      <div style={{ marginTop: '20px' }}>
        <PdfExportButton 
          test={mockTest}
          questions={mockQuestions}
          categories={mockCategories}
        />
      </div>
    </div>
  );
}
