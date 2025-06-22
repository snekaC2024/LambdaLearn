import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Quiz, QuizSubmission } from '../../types';
import { quizService } from '../../services/quizService';
import { BarChart3, Users, Clock, Award } from 'lucide-react';

interface QuizResultsProps {
  quizzes: Quiz[];
}

export const QuizResults: React.FC<QuizResultsProps> = ({ quizzes }) => {
  const [results, setResults] = useState<Record<string, QuizSubmission[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, [quizzes]);

  const loadResults = async () => {
    setLoading(true);
    const allResults: Record<string, QuizSubmission[]> = {};
    
    for (const quiz of quizzes) {
      try {
        const quizResults = await quizService.getResults(quiz.id);
        allResults[quiz.id] = quizResults;
      } catch (error) {
        console.error(`Failed to load results for quiz ${quiz.id}:`, error);
        allResults[quiz.id] = [];
      }
    }
    
    setResults(allResults);
    setLoading(false);
  };

  const getQuizStats = (quiz: Quiz, submissions: QuizSubmission[]) => {
    if (submissions.length === 0) {
      return {
        averageScore: 0,
        averagePercentage: 0,
        averageTime: 0,
        participantCount: 0,
      };
    }

    const totalScore = submissions.reduce((sum, s) => sum + s.score, 0);
    const totalTime = submissions.reduce((sum, s) => sum + s.timeSpent, 0);
    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);

    return {
      averageScore: totalScore / submissions.length,
      averagePercentage: (totalScore / (submissions.length * totalPoints)) * 100,
      averageTime: totalTime / submissions.length,
      participantCount: submissions.length,
    };
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {quizzes.length === 0 ? (
        <Card className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No quiz data available</h3>
          <p className="text-gray-600">Create some quizzes to see analytics and results</p>
        </Card>
      ) : (
        quizzes.map((quiz) => {
          const submissions = results[quiz.id] || [];
          const stats = getQuizStats(quiz, submissions);

          return (
            <Card key={quiz.id}>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{quiz.title}</h3>
                <p className="text-gray-600">{quiz.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-900">{stats.participantCount}</div>
                  <div className="text-sm text-purple-700">Participants</div>
                </div>

                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Award className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-900">{stats.averagePercentage.toFixed(1)}%</div>
                  <div className="text-sm text-blue-700">Average Score</div>
                </div>

                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-emerald-900">{stats.averageScore.toFixed(1)}</div>
                  <div className="text-sm text-emerald-700">Avg Points</div>
                </div>

                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-900">{Math.round(stats.averageTime / 60)}m</div>
                  <div className="text-sm text-orange-700">Avg Time</div>
                </div>
              </div>

              {submissions.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Recent Submissions</h4>
                  <div className="space-y-2">
                    {submissions
                      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                      .slice(0, 5)
                      .map((submission) => (
                        <div key={submission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">{submission.studentName}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(submission.submittedAt).toLocaleDateString()} at{' '}
                              {new Date(submission.submittedAt).toLocaleTimeString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">
                              {submission.score}/{submission.totalPoints}
                            </div>
                            <div className="text-sm text-gray-500">
                              {((submission.score / submission.totalPoints) * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </Card>
          );
        })
      )}
    </div>
  );
};