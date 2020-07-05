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
    docker.withRegistry('https://hub.docker.com/', '	37b58f9a-df07-4839-80fe-13ac9ba5e539') {
      container.push("${env.BUILD_ID}")
    }
  }
}
