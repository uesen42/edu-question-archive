
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MathRenderer } from './MathRenderer';

interface LaTeXEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const commonSymbols = [
  { label: 'Kesir', latex: '\\frac{a}{b}', display: '\\frac{a}{b}' },
  { label: 'Kare kök', latex: '\\sqrt{x}', display: '\\sqrt{x}' },
  { label: 'Üs', latex: 'x^{2}', display: 'x^{2}' },
  { label: 'Alt simge', latex: 'x_{1}', display: 'x_{1}' },
  { label: 'Pi', latex: '\\pi', display: '\\pi' },
  { label: 'Alpha', latex: '\\alpha', display: '\\alpha' },
  { label: 'Beta', latex: '\\beta', display: '\\beta' },
  { label: 'Gamma', latex: '\\gamma', display: '\\gamma' },
  { label: 'Theta', latex: '\\theta', display: '\\theta' },
  { label: 'Toplam', latex: '\\sum_{i=1}^{n}', display: '\\sum_{i=1}^{n}' },
  { label: 'İntegral', latex: '\\int_{a}^{b}', display: '\\int_{a}^{b}' },
  { label: 'Sınır', latex: '\\lim_{x \\to \\infty}', display: '\\lim_{x \\to \\infty}' },
  { label: 'Eşittir', latex: '=', display: '=' },
  { label: 'Küçük eşit', latex: '\\leq', display: '\\leq' },
  { label: 'Büyük eşit', latex: '\\geq', display: '\\geq' },
  { label: 'Eşit değil', latex: '\\neq', display: '\\neq' },
  { label: 'Artı/Eksi', latex: '\\pm', display: '\\pm' },
  { label: 'Çarpma', latex: '\\times', display: '\\times' },
  { label: 'Bölme', latex: '\\div', display: '\\div' },
  { label: 'Nokta çarpım', latex: '\\cdot', display: '\\cdot' },
  { label: 'Sonsuz', latex: '\\infty', display: '\\infty' },
];

export function LaTeXEditor({ value, onChange, placeholder }: LaTeXEditorProps) {
  const [cursorPosition, setCursorPosition] = useState(0);

  const insertLatex = (latex: string) => {
    const before = value.substring(0, cursorPosition);
    const after = value.substring(cursorPosition);
    const newValue = before + latex + after;
    onChange(newValue);
    
    // Update cursor position to after the inserted text
    setTimeout(() => setCursorPosition(cursorPosition + latex.length), 0);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    setCursorPosition(e.target.selectionStart);
  };

  const handleTextareaSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    setCursorPosition(target.selectionStart);
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="editor">Editör</TabsTrigger>
          <TabsTrigger value="preview">Önizleme</TabsTrigger>
        </TabsList>
        
        <TabsContent value="editor" className="space-y-4">
          <div className="space-y-2">
            <Textarea
              value={value}
              onChange={handleTextareaChange}
              onSelect={handleTextareaSelect}
              placeholder={placeholder || 'Metninizi buraya yazın... LaTeX için $ veya $$ kullanın'}
              rows={6}
              className="font-mono"
            />
            <p className="text-xs text-gray-500">
              İpucu: Inline matematik için $x^2$ veya blok matematik için $$\\frac{a}{b}$$ kullanın
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Yaygın Semboller</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {commonSymbols.map((symbol, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => insertLatex(symbol.latex)}
                    className="h-auto p-2 flex flex-col items-center"
                    title={symbol.label}
                  >
                    <div className="text-xs mb-1">{symbol.label}</div>
                    <div className="math-preview">
                      <MathRenderer content={`$${symbol.display}$`} />
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Canlı Önizleme</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="min-h-[150px] p-4 border rounded bg-white">
                {value ? (
                  <MathRenderer content={value} />
                ) : (
                  <p className="text-gray-400 italic">Önizleme için metin girin...</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
