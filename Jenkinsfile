pipeline {
  agent { dockerfile true }
  stages {
    stage('Build') {
      steps {
        sh 'npm ci'
      }
    }
    stage('Test') {
      steps {
        sh 'npm test'
      }
    }
  }
}
