import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Quiz, QuizSubmission } from '../../types';
import { quizService } from '../../services/quizService';
import { useAuth } from '../../context/AuthContext';
import { Clock, ChevronLeft, ChevronRight, Check, AlertCircle } from 'lucide-react';

interface QuizTakingProps {
  quiz: Quiz;
  onComplete: () => void;
  onBack: () => void;
}

export const QuizTaking: React.FC<QuizTakingProps> = ({ quiz, onComplete, onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(
    quiz.timeLimit ? quiz.timeLimit * 60 : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuizSubmission | null>(null);
  const [startTime] = useState(Date.now());
  const { user } = useAuth();

  useEffect(() => {
    if (timeLeft === null) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex,
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const submission = await quizService.submitAnswers({
        quizId: quiz.id,
        studentId: user.id,
        studentName: user.name,
        answers,
        timeSpent,
      });
      setResult(submission);
    } catch (error) {
      console.error('Failed to submit quiz:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    const answeredQuestions = Object.keys(answers).length;
    return (answeredQuestions / quiz.questions.length) * 100;
  };

  if (result) {
    const percentage = (result.score / result.totalPoints) * 100;
    
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="text-center">
          <div className="mb-6">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
              percentage >= 80 ? 'bg-emerald-100' : percentage >= 60 ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              <Check className={`w-8 h-8 ${
                percentage >= 80 ? 'text-emerald-600' : percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Quiz Completed!</h2>
            <p className="text-gray-600">Here are your results for "{quiz.title}"</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-900">{result.score}</div>
              <div className="text-purple-700">Points Scored</div>
              <div className="text-sm text-purple-600">out of {result.totalPoints}</div>
            </div>

            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-900">{percentage.toFixed(1)}%</div>
              <div className="text-blue-700">Percentage</div>
              <div className={`text-sm ${
                percentage >= 80 ? 'text-emerald-600' : percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {percentage >= 80 ? 'Excellent!' : percentage >= 60 ? 'Good job!' : 'Keep practicing!'}
              </div>
            </div>

            <div className="text-center p-6 bg-emerald-50 rounded-lg">
              <div className="text-3xl font-bold text-emerald-900">{Math.floor(result.timeSpent / 60)}m</div>
              <div className="text-emerald-700">Time Taken</div>
              <div className="text-sm text-emerald-600">{result.timeSpent % 60}s</div>
            </div>
          </div>

          <div className="space-y-4">
            <Button onClick={onComplete} size="lg">
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const isLastQuestion = currentQuestion === quiz.questions.length - 1;
  const allQuestionsAnswered = quiz.questions.every(q => answers.hasOwnProperty(q.id));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={onBack}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Quizzes
          </Button>
          
          {timeLeft !== null && (
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${
              timeLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}>
              <Clock className="w-4 h-4" />
              <span className="font-medium">{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
            <span>{Object.keys(answers).length} answered</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <Card className="mb-6">
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex-1">
              {question.question}
            </h2>
            <span className="flex-shrink-0 ml-4 px-2 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
              {question.points} points
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(question.id, index)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                answers[question.id] === index
                  ? 'border-purple-500 bg-purple-50 text-purple-900'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  answers[question.id] === index
                    ? 'border-purple-500 bg-purple-500'
                    : 'border-gray-300'
                }`}>
                  {answers[question.id] === index && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <span className="font-medium text-gray-700">{String.fromCharCode(65 + index)}.</span>
                <span>{option}</span>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="flex space-x-3">
          {!isLastQuestion ? (
            <Button
              onClick={() => setCurrentQuestion(Math.min(quiz.questions.length - 1, currentQuestion + 1))}
              disabled={currentQuestion === quiz.questions.length - 1}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              loading={isSubmitting}
              variant="secondary"
              size="lg"
              disabled={!allQuestionsAnswered}
            >
              {!allQuestionsAnswered && <AlertCircle className="w-4 h-4 mr-2" />}
              Submit Quiz
            </Button>
          )}
        </div>
      </div>

      {!allQuestionsAnswered && isLastQuestion && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2 text-yellow-800">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Please answer all questions before submitting.</span>
          </div>
        </div>
      )}
    </div>
  );
};