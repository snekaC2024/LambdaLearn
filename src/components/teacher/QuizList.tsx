import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Quiz } from '../../types';
import { quizService } from '../../services/quizService';
import { Edit, Trash2, Play, Pause, Clock, Users, CheckCircle } from 'lucide-react';

interface QuizListProps {
  quizzes: Quiz[];
  loading: boolean;
  onEdit: (quiz: Quiz) => void;
  onDelete: (quizId: string) => void;
  onRefresh: () => void;
}

export const QuizList: React.FC<QuizListProps> = ({
  quizzes,
  loading,
  onEdit,
  onDelete,
  onRefresh,
}) => {
  const handleToggleActive = async (quiz: Quiz) => {
    try {
      await quizService.updateQuiz(quiz.id, { isActive: !quiz.isActive });
      onRefresh();
    } catch (error) {
      console.error('Failed to update quiz:', error);
    }
  };

  const handleDelete = async (quizId: string) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await quizService.deleteQuiz(quizId);
        onDelete(quizId);
      } catch (error) {
        console.error('Failed to delete quiz:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="flex space-x-2">
              <div className="h-8 bg-gray-200 rounded w-20"></div>
              <div className="h-8 bg-gray-200 rounded w-20"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <Card className="text-center py-12">
        <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes yet</h3>
        <p className="text-gray-600 mb-6">Create your first quiz to get started with LambdaLearn</p>
        <Button onClick={() => {}}>Create Your First Quiz</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {quizzes.map((quiz) => (
        <Card key={quiz.id} hover className="transition-all duration-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-xl font-semibold text-gray-900">{quiz.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  quiz.isActive 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {quiz.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4">{quiz.description}</p>
              
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{quiz.questions.length} questions</span>
                </div>
                {quiz.timeLimit && (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{quiz.timeLimit} minutes</span>
                  </div>
                )}
                <div className="text-xs">
                  Created {new Date(quiz.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToggleActive(quiz)}
                className={quiz.isActive ? 'text-orange-600 hover:text-orange-700' : 'text-emerald-600 hover:text-emerald-700'}
              >
                {quiz.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(quiz)}
                className="text-blue-600 hover:text-blue-700"
              >
                <Edit className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(quiz.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};