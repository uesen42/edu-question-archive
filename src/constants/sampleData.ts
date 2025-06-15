
import { Category } from '@/types';

export const DEFAULT_CATEGORIES = [
  { name: 'Matematik', description: 'Matematik soruları', color: '#3B82F6' },
  { name: 'Fizik', description: 'Fizik soruları', color: '#10B981' },
  { name: 'Kimya', description: 'Kimya soruları', color: '#F59E0B' },
  { name: 'Biyoloji', description: 'Biyoloji soruları', color: '#EF4444' },
];

export const getSampleQuestions = (categories: Category[]) => {
  const mathCat = categories.find(c => c.name === 'Matematik');
  const physicsCat = categories.find(c => c.name === 'Fizik');
  const chemistryCat = categories.find(c => c.name === 'Kimya');
  const biologyCat = categories.find(c => c.name === 'Biyoloji');

  return [
    // Matematik Soruları
    {
      title: "Toplama İşlemi",
      content: "$5 + 3 = ?$ işleminin sonucunu bulunuz.",
      imageUrls: [],
      categoryId: mathCat?.id || '',
      difficultyLevel: 'kolay' as const,
      grade: 1,
      tags: ['toplama', 'temel matematik']
    },
    {
      title: "Çarpım Tablosu",
      content: "$7 \\times 8 = ?$ işleminin sonucunu hesaplayınız.",
      imageUrls: [],
      categoryId: mathCat?.id || '',
      difficultyLevel: 'kolay' as const,
      grade: 3,
      tags: ['çarpma', 'çarpım tablosu']
    },
    {
      title: "Kesirler",
      content: "$\\frac{3}{4} + \\frac{1}{2}$ işleminin sonucunu bulunuz.",
      imageUrls: [],
      categoryId: mathCat?.id || '',
      difficultyLevel: 'orta' as const,
      grade: 5,
      tags: ['kesirler', 'toplama']
    },
    {
      title: "Denklem Çözme",
      content: "$2x + 5 = 13$ denklemini çözünüz.",
      imageUrls: [],
      categoryId: mathCat?.id || '',
      difficultyLevel: 'orta' as const,
      grade: 7,
      tags: ['denklem', 'bilinmeyen']
    },
    {
      title: "Kareköklü İfadeler",
      content: "$\\sqrt{16} + \\sqrt{25}$ işleminin sonucunu bulunuz.",
      imageUrls: [],
      categoryId: mathCat?.id || '',
      difficultyLevel: 'orta' as const,
      grade: 8,
      tags: ['karekök', 'kökler']
    },
    {
      title: "Trigonometri",
      content: "$\\sin(30°) + \\cos(60°)$ değerini hesaplayınız.",
      imageUrls: [],
      categoryId: mathCat?.id || '',
      difficultyLevel: 'zor' as const,
      grade: 10,
      tags: ['trigonometri', 'sinüs', 'kosinüs']
    },
    {
      title: "Türev",
      content: "$f(x) = x^3 + 2x^2 - 5x + 1$ fonksiyonunun türevini bulunuz.",
      imageUrls: [],
      categoryId: mathCat?.id || '',
      difficultyLevel: 'zor' as const,
      grade: 11,
      tags: ['türev', 'diferansiyel']
    },
    {
      title: "İntegral",
      content: "$\\int (3x^2 + 2x - 1) dx$ integralini hesaplayınız.",
      imageUrls: [],
      categoryId: mathCat?.id || '',
      difficultyLevel: 'zor' as const,
      grade: 12,
      tags: ['integral', 'belirsiz integral']
    },

    // Fizik Soruları
    {
      title: "Kuvvet ve Hareket",
      content: "Bir cisim $F = 10N$ kuvvet ile itildiğinde $a = 2 m/s^2$ ivme kazanıyor. Cismin kütlesi kaç kg'dır?",
      imageUrls: [],
      categoryId: physicsCat?.id || '',
      difficultyLevel: 'orta' as const,
      grade: 9,
      tags: ['kuvvet', 'kütle', 'ivme', 'newton yasaları']
    },
    {
      title: "Elektrik Akımı",
      content: "$V = 12V$ gerilim altında $R = 4Ω$ dirençten geçen akım şiddeti kaç amperdir?",
      imageUrls: [],
      categoryId: physicsCat?.id || '',
      difficultyLevel: 'orta' as const,
      grade: 10,
      tags: ['elektrik', 'ohm yasası', 'akım']
    },
    {
      title: "Dalga Boyu",
      content: "Frekansı $f = 500Hz$ olan ses dalgasının havadaki dalga boyu kaç metredir? (Ses hızı $v = 340 m/s$)",
      imageUrls: [],
      categoryId: physicsCat?.id || '',
      difficultyLevel: 'zor' as const,
      grade: 11,
      tags: ['dalga', 'frekans', 'dalga boyu']
    },
    {
      title: "Relativite",
      content: "Einstein'ın $E = mc^2$ denkleminde, $m = 2kg$ kütleli bir cismin enerjisi kaç joule'dur?",
      imageUrls: [],
      categoryId: physicsCat?.id || '',
      difficultyLevel: 'zor' as const,
      grade: 12,
      tags: ['relativite', 'einstein', 'kütle-enerji']
    },

    // Kimya Soruları
    {
      title: "Atom Yapısı",
      content: "Karbon atomunun elektron dizilişi nasıldır? (C: 6 elektron)",
      imageUrls: [],
      categoryId: chemistryCat?.id || '',
      difficultyLevel: 'orta' as const,
      grade: 9,
      tags: ['atom', 'elektron dizilişi', 'karbon']
    },
    {
      title: "Kimyasal Bağlar",
      content: "$H_2O$ molekülünde hangi tür kimyasal bağ bulunur?",
      imageUrls: [],
      categoryId: chemistryCat?.id || '',
      difficultyLevel: 'orta' as const,
      grade: 10,
      tags: ['kimyasal bağ', 'su molekülü', 'kovalent bağ']
    },
    {
      title: "Mol Kavramı",
      content: "$22g$ $CO_2$ gazında kaç mol molekül vardır? (C: 12, O: 16)",
      imageUrls: [],
      categoryId: chemistryCat?.id || '',
      difficultyLevel: 'orta' as const,
      grade: 11,
      tags: ['mol', 'molekül kütlesi', 'karbondioksit']
    },
    {
      title: "Denge Sabiti",
      content: "$N_2 + 3H_2 ⇌ 2NH_3$ tepkimesi için denge sabiti ifadesini yazınız.",
      imageUrls: [],
      categoryId: chemistryCat?.id || '',
      difficultyLevel: 'zor' as const,
      grade: 12,
      tags: ['kimyasal denge', 'denge sabiti', 'ammonyak']
    },

    // Biyoloji Soruları
    {
      title: "Hücre Yapısı",
      content: "Bitkisel hücrelerde bulunan ancak hayvansal hücrelerde bulunmayan organeller hangileridir?",
      imageUrls: [],
      categoryId: biologyCat?.id || '',
      difficultyLevel: 'kolay' as const,
      grade: 9,
      tags: ['hücre', 'organel', 'bitki hücresi']
    },
    {
      title: "Fotosentez",
      content: "$6CO_2 + 6H_2O + ışık → C_6H_{12}O_6 + 6O_2$ Fotosentez denkleminde hangi organelde gerçekleşir?",
      imageUrls: [],
      categoryId: biologyCat?.id || '',
      difficultyLevel: 'orta' as const,
      grade: 10,
      tags: ['fotosentez', 'kloroplast', 'glikoz']
    },
    {
      title: "Genetik",
      content: "AA x aa çaprazlamasından elde edilen F1 neslinin genotip oranı nedir?",
      imageUrls: [],
      categoryId: biologyCat?.id || '',
      difficultyLevel: 'orta' as const,
      grade: 11,
      tags: ['genetik', 'çaprazlama', 'mendel']
    },
    {
      title: "Protein Sentezi",
      content: "mRNA'dan protein sentezi hangi organelde gerçekleşir?",
      imageUrls: [],
      categoryId: biologyCat?.id || '',
      difficultyLevel: 'zor' as const,
      grade: 12,
      tags: ['protein sentezi', 'ribozom', 'mRNA']
    }
  ];
};
