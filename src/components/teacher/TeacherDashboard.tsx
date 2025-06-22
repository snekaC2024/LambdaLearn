import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
// import { Button } from '../ui/Button';
import { QuizList } from './QuizList';
import { QuizForm } from './QuizForm';
import { QuizResults } from './QuizResults';
import { Quiz } from '../../types';
import { quizService } from '../../services/quizService';
import { useAuth } from '../../context/AuthContext';
import { Plus, BarChart3, BookOpen, Users } from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'quizzes' | 'create' | 'results'>('quizzes');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadQuizzes();
  }, [user]);

  const loadQuizzes = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const teacherQuizzes = await quizService.getQuizzes(user.id);
      setQuizzes(teacherQuizzes);
    } catch (error) {
      console.error('Failed to load quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizCreated = (quiz: Quiz) => {
    setQuizzes(prev => [quiz, ...prev]);
    setActiveTab('quizzes');
  };

  const handleQuizUpdated = (updatedQuiz: Quiz) => {
    setQuizzes(prev => prev.map(q => q.id === updatedQuiz.id ? updatedQuiz : q));
    setSelectedQuiz(null);
  };

  const handleQuizDeleted = (quizId: string) => {
    setQuizzes(prev => prev.filter(q => q.id !== quizId));
  };

  const stats = {
    totalQuizzes: quizzes.length,
    activeQuizzes: quizzes.filter(q => q.isActive).length,
    totalQuestions: quizzes.reduce((sum, q) => sum + q.questions.length, 0),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Teacher Dashboard</h1>
        <p className="text-gray-600">Manage your quizzes and track student performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="text-center">
          <BookOpen className="w-8 h-8 text-purple-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900">{stats.totalQuizzes}</div>
          <div className="text-sm text-gray-600">Total Quizzes</div>
        </Card>
        
        <Card className="text-center">
          <Users className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900">{stats.activeQuizzes}</div>
          <div className="text-sm text-gray-600">Active Quizzes</div>
        </Card>
        
        <Card className="text-center">
          <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900">{stats.totalQuestions}</div>
          <div className="text-sm text-gray-600">Total Questions</div>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('quizzes')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
            activeTab === 'quizzes'
              ? 'bg-white text-purple-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          My Quizzes
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
            activeTab === 'create'
              ? 'bg-white text-purple-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Plus className="w-4 h-4 inline mr-2" />
          Create Quiz
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
            activeTab === 'results'
              ? 'bg-white text-purple-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Results & Analytics
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'quizzes' && (
        <QuizList
          quizzes={quizzes}
          loading={loading}
          onEdit={setSelectedQuiz}
          onDelete={handleQuizDeleted}
          onRefresh={loadQuizzes}
        />
      )}

      {activeTab === 'create' && (
        <QuizForm
          quiz={selectedQuiz}
          onSave={selectedQuiz ? handleQuizUpdated : handleQuizCreated}
          onCancel={() => setSelectedQuiz(null)}
        />
      )}

      {activeTab === 'results' && (
        <QuizResults quizzes={quizzes} />
      )}
    </div>
  );
};