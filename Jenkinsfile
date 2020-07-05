node {
  checkout scm
  def container = docker.build("amadek/cake-recipes-api:${env.BUILD_ID}")
  container.inside {
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
  stage('Publish') {
    container.publish("${env.BUILD_ID}")
  }
}
