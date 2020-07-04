pipeline {
  agent { dockerfile true }
  stages {
    stage('Build') {
      sh 'npm ci'
    }
    stage('Test') {
      steps {
        sh 'npm test'
      }
    }
  }
}
