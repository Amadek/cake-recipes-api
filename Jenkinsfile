node {
  checkout scm
  docker.build("amadek/cake-recipes-api:${env.BUILD_ID}").inside {
    stage('Build') {
      sh 'ls -a'
      sh 'npm ci'
      sh 'ls -a'
      sh 'npm run build'
      sh 'ls -a'
    }
    stage('Test') {
      sh 'npm test'
    }
  }
}
