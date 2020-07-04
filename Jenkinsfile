pipeline {
  agent { dockerfile true }
  stages {
    stage('Test') {
      steps {
        sh 'ls node_modules/.bin'
      }
    }
  }
}
