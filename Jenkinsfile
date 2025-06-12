// Jenkinsfile
pipeline {
    agent any // or specify a specific agent/node if you have multiple

    environment {
        // Optional: Define environment variables for your build
        // CI = 'true' // Recommended for React testing to prevent watch mode
    }

    stages {
        stage('Checkout') {
            steps {
                git 'YOUR_REPOSITORY_URL' // e.g., 'https://github.com/your-org/your-react-app.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install' // or 'yarn install'
            }
        }

        stage('Run Tests') {
            steps {
                // Assuming you have tests configured with Jest/React Testing Library
                sh 'npm test -- --ci --watchAll=false' // or 'yarn test --ci --watchAll=false'
                // The --ci flag ensures tests run in CI mode and exit after completion
                // --watchAll=false prevents watch mode which would hang the pipeline
            }
        }

        stage('Build React App') {
            steps {
                sh 'npm run build' // or 'yarn build'
            }
        }

        stage('Deploy (Optional)') {
            steps {
                // Example: Deploy to a static hosting service or a web server
                // This stage will highly depend on your deployment strategy
                // sh 'scp -r build/* user@your-server:/var/www/html/your-app'
                // Or use a more sophisticated deployment tool/script
            }
        }
    }

    post {
        always {
            // Actions to perform after every build (success or failure)
            // e.g., clean workspace, send notifications
            cleanWs()
        }
        failure {
            // Actions to perform only on build failure
            // e.g., send failure notification
        }
        success {
            // Actions to perform only on build success
            // e.g., send success notification
        }
    }
}
