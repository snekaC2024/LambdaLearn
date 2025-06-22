import { Quiz, QuizSubmission, QuizSession } from '../types';

// Simulating AWS Lambda + DynamoDB services
class QuizService {
  private quizzes: Quiz[] = [
    {
      id: 'quiz-1',
      title: 'Introduction to React',
      description: 'Test your knowledge of React fundamentals',
      teacherId: 'teacher-1',
      isActive: true,
      timeLimit: 15,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      questions: [
        {
          id: 'q1',
          question: 'What is JSX?',
          options: ['JavaScript XML', 'Java Syntax Extension', 'JSON XML', 'JavaScript Extension'],
          correctAnswer: 0,
          points: 10,
        },
        {
          id: 'q2',
          question: 'Which hook is used for state management in functional components?',
          options: ['useEffect', 'useState', 'useContext', 'useReducer'],
          correctAnswer: 1,
          points: 10,
        },
        {
          id: 'q3',
          question: 'What is the virtual DOM?',
          options: [
            'A database technology',
            'A CSS framework',
            'A copy of the real DOM kept in memory',
            'A new web standard'
          ],
          correctAnswer: 2,
          points: 15,
        },
        {
          id: 'q4',
          question: 'What does the useEffect hook do?',
          options: [
            'Manages component state',
            'Handles form submissions',
            'Creates context providers',
            'Performs side effects in functional components'
          ],
          correctAnswer: 3,
          points: 12,
        },
      ],
    },
    {
      id: 'quiz-2',
      title: 'JavaScript Fundamentals',
      description: 'Basic JavaScript concepts and syntax',
      teacherId: 'teacher-1',
      isActive: true,
      timeLimit: 20,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date(Date.now() - 172800000).toISOString(),
      questions: [
        {
          id: 'q5',
          question: 'What is the difference between let and var?',
          options: ['No difference', 'let has block scope, var has function scope', 'var is newer', 'let is faster'],
          correctAnswer: 1,
          points: 10,
        },
        {
          id: 'q6',
          question: 'What does === operator do?',
          options: ['Assignment', 'Comparison without type checking', 'Strict equality comparison', 'Mathematical operation'],
          correctAnswer: 2,
          points: 10,
        },
        {
          id: 'q7',
          question: 'Which of the following is NOT a JavaScript data type?',
          options: ['String', 'Boolean', 'Integer', 'Undefined'],
          correctAnswer: 2,
          points: 8,
        },
        {
          id: 'q8',
          question: 'What is a closure in JavaScript?',
          options: [
            'A way to close browser windows',
            'A method to end functions',
            'A loop termination technique',
            'A function that has access to variables in its outer scope'
          ],
          correctAnswer: 3,
          points: 15,
        },
      ],
    },
    {
      id: 'quiz-3',
      title: 'Web Development Basics',
      description: 'HTML, CSS, and general web development concepts',
      teacherId: 'teacher-1',
      isActive: true,
      timeLimit: 25,
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      updatedAt: new Date(Date.now() - 259200000).toISOString(),
      questions: [
        {
          id: 'q9',
          question: 'Which HTML tag is used for the largest heading?',
          options: ['<h1>', '<h6>', '<header>', '<title>'],
          correctAnswer: 0,
          points: 5,
        },
        {
          id: 'q10',
          question: 'What does CSS stand for?',
          options: ['Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style Sheets', 'Colorful Style Sheets'],
          correctAnswer: 1,
          points: 5,
        },
        {
          id: 'q11',
          question: 'Which CSS property is used to change the text color?',
          options: ['text-color', 'font-color', 'color', 'text-style'],
          correctAnswer: 2,
          points: 8,
        },
        {
          id: 'q12',
          question: 'What is the correct way to link an external CSS file?',
          options: [
            '<style src="style.css">',
            '<css>style.css</css>',
            '<stylesheet>style.css</stylesheet>',
            '<link rel="stylesheet" href="style.css">'
          ],
          correctAnswer: 3,
          points: 10,
        },
      ],
    },
  ];

  private submissions: QuizSubmission[] = [
    {
      id: 'sub-1',
      quizId: 'quiz-1',
      studentId: 'student-1',
      studentName: 'Alex Rodriguez',
      answers: { 'q1': 0, 'q2': 1, 'q3': 2, 'q4': 3 },
      score: 47,
      totalPoints: 47,
      submittedAt: new Date(Date.now() - 3600000).toISOString(),
      timeSpent: 720,
    },
    {
      id: 'sub-2',
      quizId: 'quiz-2',
      studentId: 'student-1',
      studentName: 'Alex Rodriguez',
      answers: { 'q5': 1, 'q6': 2, 'q7': 1, 'q8': 3 },
      score: 35,
      totalPoints: 43,
      submittedAt: new Date(Date.now() - 7200000).toISOString(),
      timeSpent: 480,
    },
    {
      id: 'sub-3',
      quizId: 'quiz-3',
      studentId: 'student-1',
      studentName: 'Alex Rodriguez',
      answers: { 'q9': 0, 'q10': 1, 'q11': 2, 'q12': 3 },
      score: 28,
      totalPoints: 28,
      submittedAt: new Date(Date.now() - 10800000).toISOString(),
      timeSpent: 360,
    },
  ];

  private sessions: QuizSession[] = [];

  constructor() {
    // Load data from localStorage if it exists
    const savedQuizzes = localStorage.getItem('lambdallearn_quizzes');
    const savedSubmissions = localStorage.getItem('lambdallearn_submissions');
    
    if (savedQuizzes) {
      this.quizzes = JSON.parse(savedQuizzes);
    }
    if (savedSubmissions) {
      this.submissions = JSON.parse(savedSubmissions);
    }
  }

  private saveData() {
    localStorage.setItem('lambdallearn_quizzes', JSON.stringify(this.quizzes));
    localStorage.setItem('lambdallearn_submissions', JSON.stringify(this.submissions));
  }

  async createQuiz(quiz: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>): Promise<Quiz> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newQuiz: Quiz = {
      ...quiz,
      id: `quiz-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    this.quizzes.push(newQuiz);
    this.saveData();
    return newQuiz;
  }

  async getQuizzes(teacherId?: string): Promise<Quiz[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (teacherId) {
      return this.quizzes.filter(quiz => quiz.teacherId === teacherId);
    }
    return this.quizzes.filter(quiz => quiz.isActive);
  }

  async getQuiz(id: string): Promise<Quiz | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return this.quizzes.find(quiz => quiz.id === id) || null;
  }

  async submitAnswers(submission: Omit<QuizSubmission, 'id' | 'submittedAt' | 'score' | 'totalPoints'>): Promise<QuizSubmission> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const quiz = await this.getQuiz(submission.quizId);
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    let score = 0;
    let totalPoints = 0;

    quiz.questions.forEach(question => {
      totalPoints += question.points;
      const userAnswer = submission.answers[question.id];
      if (userAnswer === question.correctAnswer) {
        score += question.points;
      }
    });

    const newSubmission: QuizSubmission = {
      ...submission,
      id: `submission-${Date.now()}`,
      score,
      totalPoints,
      submittedAt: new Date().toISOString(),
    };

    this.submissions.push(newSubmission);
    this.saveData();
    
    // Update session if exists
    const session = this.sessions.find(s => s.quizId === submission.quizId && s.isLive);
    if (session) {
      session.submissions.push(newSubmission);
    }

    return newSubmission;
  }

  async getResults(quizId: string): Promise<QuizSubmission[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return this.submissions.filter(submission => submission.quizId === quizId);
  }

  async getStudentSubmissions(studentId: string): Promise<QuizSubmission[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return this.submissions.filter(submission => submission.studentId === studentId);
  }

  async startLiveSession(quizId: string, teacherId: string): Promise<QuizSession> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const session: QuizSession = {
      id: `session-${Date.now()}`,
      quizId,
      teacherId,
      isLive: true,
      startedAt: new Date().toISOString(),
      participants: [],
      submissions: [],
    };

    this.sessions.push(session);
    return session;
  }

  async getLiveSession(quizId: string): Promise<QuizSession | null> {
    return this.sessions.find(s => s.quizId === quizId && s.isLive) || null;
  }

  async updateQuiz(id: string, updates: Partial<Quiz>): Promise<Quiz> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const quizIndex = this.quizzes.findIndex(quiz => quiz.id === id);
    if (quizIndex === -1) {
      throw new Error('Quiz not found');
    }

    this.quizzes[quizIndex] = {
      ...this.quizzes[quizIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.saveData();
    return this.quizzes[quizIndex];
  }

  async deleteQuiz(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = this.quizzes.findIndex(quiz => quiz.id === id);
    if (index !== -1) {
      this.quizzes.splice(index, 1);
      this.saveData();
    }
  }
}

export const quizService = new QuizService();