import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
  question: {
    id: string;
    text: string;
    options: string[];
  };
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: number | null;
  onAnswerChange: (answerIndex: number) => void;
}

export const QuestionCard = ({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswerChange,
}: QuestionCardProps) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>
            Câu hỏi {questionNumber}/{totalQuestions}
          </span>
          {selectedAnswer !== null && (
            <span className="text-sm font-normal text-green-600">
              ✓ Đã trả lời
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-lg font-medium leading-relaxed">
          {question.text}
        </div>

        <RadioGroup
          value={selectedAnswer?.toString()}
          onValueChange={(value) => onAnswerChange(parseInt(value))}
        >
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center space-x-3 rounded-lg border p-4 transition-all hover:bg-accent",
                  selectedAnswer === index && "border-primary bg-primary/5"
                )}
              >
                <RadioGroupItem
                  value={index.toString()}
                  id={`${question.id}-${index}`}
                  className="mt-0.5"
                />
                <Label
                  htmlFor={`${question.id}-${index}`}
                  className="flex-1 cursor-pointer text-base leading-relaxed"
                >
                  <span className="font-semibold mr-2">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};
