pipeline {
    agent any

    tools {
        nodejs "NodeJS"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/adityayad01/lostandfoundplatform.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                dir('fullstack') {
                    sh 'npm install'
                }
            }
        }

        stage('Run Tests') {
            steps {
                dir('fullstack') {
                    sh 'npm test'
                }
            }
        }
    }
}
