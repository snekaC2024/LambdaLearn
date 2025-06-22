import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Quiz, Question } from '../../types';
import { quizService } from '../../services/quizService';
import { useAuth } from '../../context/AuthContext';
import { Plus, Trash2, Save, X } from 'lucide-react';

interface QuizFormProps {
  quiz?: Quiz | null;
  onSave: (quiz: Quiz) => void;
  onCancel: () => void;
}

interface ExtendedQuestion extends Question {
  shuffledOptions: { opt: string; originalIndex: number }[];
}

export const QuizForm: React.FC<QuizFormProps> = ({ quiz, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState<number | undefined>(undefined);
  const [questions, setQuestions] = useState<ExtendedQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (quiz) {
      const extendedQuestions: ExtendedQuestion[] = quiz.questions.map((q) => ({
        ...q,
        shuffledOptions: q.options
          .map((opt, i) => ({ opt, originalIndex: i }))
          .sort(() => Math.random() - 0.5),
      }));
      setTitle(quiz.title);
      setDescription(quiz.description);
      setTimeLimit(quiz.timeLimit);
      setQuestions(extendedQuestions);
    } else {
      resetForm();
    }
  }, [quiz]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTimeLimit(undefined);
    setQuestions([]);
  };

  const addQuestion = () => {
    const options = ['', '', '', ''];
    const shuffledOptions = options
      .map((opt, i) => ({ opt, originalIndex: i }))
      .sort(() => Math.random() - 0.5);

    const newQuestion: ExtendedQuestion = {
      id: `q${Date.now()}`,
      question: '',
      options,
      correctAnswer: 0,
      points: 10,
      shuffledOptions,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, updates: Partial<ExtendedQuestion>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...updates };
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const quizData = {
        title,
        description,
        timeLimit,
        questions: questions.map(({ shuffledOptions, ...q }) => q).filter(q => q.question.trim() && q.options.some(opt => opt.trim())),
        teacherId: user.id,
        isActive: true,
      };

      let savedQuiz: Quiz;
      if (quiz) {
        savedQuiz = await quizService.updateQuiz(quiz.id, quizData);
      } else {
        savedQuiz = await quizService.createQuiz(quizData);
      }

      onSave(savedQuiz);
      if (!quiz) resetForm();
    } catch (error) {
      console.error('Failed to save quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {quiz ? 'Edit Quiz' : 'Create New Quiz'}
          </h2>
          {quiz && (
            <Button variant="ghost" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Quiz Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Enter quiz title"
          />
          <Input
            label="Time Limit (minutes)"
            type="number"
            value={timeLimit || ''}
            onChange={(e) =>
              setTimeLimit(e.target.value ? parseInt(e.target.value) : undefined)
            }
            placeholder="Optional"
            helperText="Leave empty for no time limit"
          />
        </div>

        <Input
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          placeholder="Brief description of this quiz"
          helperText="Help students understand what this quiz covers"
        />
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Questions</h3>
          <Button type="button" onClick={addQuestion} variant="secondary" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No questions added yet. Click "Add Question" to get started.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((question, index) => (
              <Card key={question.id} className="border-l-4 border-l-purple-500">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Question {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQuestion(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Input
                    label="Question Text"
                    value={question.question}
                    onChange={(e) =>
                      updateQuestion(index, { question: e.target.value })
                    }
                    required
                    placeholder="Enter your question"
                  />
                  <Input
                    label="Points"
                    type="number"
                    value={question.points}
                    onChange={(e) =>
                      updateQuestion(index, { points: parseInt(e.target.value) })
                    }
                    required
                    min="1"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Answer Options
                  </label>
                  {question.shuffledOptions.map(({ originalIndex }, optionIndex) => (
                    <div key={optionIndex} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name={`correct-${question.id}`}
                        checked={question.correctAnswer === originalIndex}
                        onChange={() =>
                          updateQuestion(index, { correctAnswer: originalIndex })
                        }
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <Input
                        value={question.options[originalIndex]}
                        onChange={(e) => {
                          const updatedOptions = [...question.options];
                          updatedOptions[originalIndex] = e.target.value;

                          const updatedShuffled = question.shuffledOptions.map((item) =>
                            item.originalIndex === originalIndex
                              ? { ...item, opt: e.target.value }
                              : item
                          );

                          updateQuestion(index, {
                            options: updatedOptions,
                            shuffledOptions: updatedShuffled,
                          });
                        }}
                        placeholder={`Option ${optionIndex + 1}`}
                        required
                      />
                      <span className="text-sm text-gray-500 whitespace-nowrap">
                        {question.correctAnswer === originalIndex && '(Correct)'}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      <div className="flex justify-end space-x-4">
        <Button
          type="submit"
          loading={loading}
          disabled={!title || !description || questions.length === 0}
          size="lg"
        >
          <Save className="w-4 h-4 mr-2" />
          {quiz ? 'Update Quiz' : 'Create Quiz'}
        </Button>
      </div>
    </form>
  );
};
