import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Quiz, QuizSubmission } from '../../types';
import { quizService } from '../../services/quizService';
import { QuizTaking } from './QuizTaking';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Clock, Play, CheckCircle, Award, BarChart3, Calendar } from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'available' | 'records'>('available');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [activeQuizzes, studentSubmissions] = await Promise.all([
        quizService.getQuizzes(),
        quizService.getStudentSubmissions(user.id)
      ]);
      setQuizzes(activeQuizzes);
      setSubmissions(studentSubmissions);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizComplete = () => {
    setSelectedQuiz(null);
    loadData(); // Refresh data to show new submission
  };

  const getQuizTitle = (quizId: string) => {
    const quiz = quizzes.find(q => q.id === quizId);
    return quiz?.title || 'Unknown Quiz';
  };

  const hasAttempted = (quizId: string) => {
    return submissions.some(sub => sub.quizId === quizId);
  };

  const getAttemptScore = (quizId: string) => {
    const attempt = submissions.find(sub => sub.quizId === quizId);
    return attempt ? `${attempt.score}/${attempt.totalPoints}` : null;
  };

  const getOverallStats = () => {
    if (submissions.length === 0) {
      return { averageScore: 0, totalQuizzes: 0, totalPoints: 0 };
    }

    const totalScore = submissions.reduce((sum, sub) => sum + sub.score, 0);
    const totalPossible = submissions.reduce((sum, sub) => sum + sub.totalPoints, 0);
    
    return {
      averageScore: totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0,
      totalQuizzes: submissions.length,
      totalPoints: totalScore,
    };
  };

  if (selectedQuiz) {
    return (
      <QuizTaking
        quiz={selectedQuiz}
        onComplete={handleQuizComplete}
        onBack={() => setSelectedQuiz(null)}
      />
    );
  }

  const stats = getOverallStats();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Dashboard</h1>
        <p className="text-gray-600">Take quizzes and track your learning progress</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="text-center">
          <BookOpen className="w-8 h-8 text-purple-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900">{stats.totalQuizzes}</div>
          <div className="text-sm text-gray-600">Quizzes Completed</div>
        </Card>
        
        <Card className="text-center">
          <Award className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900">{stats.averageScore.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Average Score</div>
        </Card>
        
        <Card className="text-center">
          <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <div className="text-2xl font-bold text-gray-900">{stats.totalPoints}</div>
          <div className="text-sm text-gray-600">Total Points Earned</div>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('available')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
            activeTab === 'available'
              ? 'bg-white text-purple-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Available Quizzes
        </button>
        <button
          onClick={() => setActiveTab('records')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
            activeTab === 'records'
              ? 'bg-white text-purple-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Calendar className="w-4 h-4 inline mr-2" />
          My Records
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'available' && (
        <>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </Card>
              ))}
            </div>
          ) : quizzes.length === 0 ? (
            <Card className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes available</h3>
              <p className="text-gray-600">Check back later for new quizzes from your teachers</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz) => {
                const attempted = hasAttempted(quiz.id);
                const score = getAttemptScore(quiz.id);
                
                return (
                  <Card key={quiz.id} hover className="flex flex-col h-full">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                          {quiz.title}
                        </h3>
                        <div className="flex flex-col items-end space-y-1">
                          <span className="flex-shrink-0 ml-2 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                            Active
                          </span>
                          {attempted && (
                            <span className="flex-shrink-0 ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                              Completed
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{quiz.description}</p>
                      
                      <div className="space-y-2 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="w-4 h-4" />
                          <span>{quiz.questions.length} questions</span>
                        </div>
                        {quiz.timeLimit && (
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>{quiz.timeLimit} minutes</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4" />
                          <span>{quiz.questions.reduce((sum, q) => sum + q.points, 0)} total points</span>
                        </div>
                        {attempted && score && (
                          <div className="flex items-center space-x-2 text-blue-600">
                            <Award className="w-4 h-4" />
                            <span>Your score: {score}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <Button
                        onClick={() => setSelectedQuiz(quiz)}
                        className="w-full"
                        variant={attempted ? "outline" : "primary"}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {attempted ? 'Retake Quiz' : 'Start Quiz'}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {activeTab === 'records' && (
        <>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </Card>
              ))}
            </div>
          ) : submissions.length === 0 ? (
            <Card className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No quiz records yet</h3>
              <p className="text-gray-600 mb-6">Complete some quizzes to see your performance history</p>
              <Button onClick={() => setActiveTab('available')}>
                Browse Available Quizzes
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {submissions
                .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                .map((submission) => {
                  const percentage = (submission.score / submission.totalPoints) * 100;
                  
                  return (
                    <Card key={submission.id} hover>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {getQuizTitle(submission.quizId)}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(submission.submittedAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{Math.floor(submission.timeSpent / 60)}m {submission.timeSpent % 60}s</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center space-x-4">
                            <div>
                              <div className="text-2xl font-bold text-gray-900">
                                {submission.score}/{submission.totalPoints}
                              </div>
                              <div className="text-sm text-gray-500">points</div>
                            </div>
                            <div className={`text-right px-3 py-1 rounded-full text-sm font-medium ${
                              percentage >= 80 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : percentage >= 60 
                                ? 'bg-yellow-100 text-yellow-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {percentage.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
            </div>
          )}
        </>
      )}
    </div>
  );
};