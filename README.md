# LambdaLearn – Real-Time Quiz Platform (Powered by AWS)

LambdaLearn is a real-time classroom quiz platform built entirely using AWS serverless architecture. It allows teachers to create and manage quizzes, and students to participate instantly with automatic scoring and live analytics.

## 🌐 Live Demo

[https://lambdalearnaws.netlify.app](https://lambdalearnaws.netlify.app)

## 📌 Features

- Real-time quiz creation and participation
- Instant auto-scoring and feedback
- Teacher and student login using AWS Cognito
- Serverless backend with AWS Lambda + API Gateway
- No setup needed for backend – it's fully cloud-native
- Responsive and modern UI

## ⚙️ Technologies Used

### Frontend

- Vite + React
- TailwindCSS
- Hosted on Netlify

### Backend

- AWS Lambda (Quiz evaluation & API logic)
- Amazon API Gateway (Triggers Lambda functions)
- Amazon DynamoDB (Quiz data and scores)
- AWS Cognito (Authentication for teachers/students)
- AWS SNS + EventBridge (Real-time notifications)

## 🧪 Local Setup

1. Clone the repository:
   
```bash
   git clone https://github.com/your-username/lambdalearn.git
```

2. Install frontend dependencies:

```bash
  npm install
```

3. Start the development server:

```bash
   npm run dev
```


## 📈 Future Improvements

- Real-time leaderboards using WebSocket APIs.
- AI-based quiz generation using Amazon Bedrock.
- Detailed analytics via Amazon QuickSight.
- Mobile app with AWS Amplify support.

---

## 📄 License

This project is open-source under the MIT License.
