node {
  def container 
  stage('Build') {
    checkout scm
    container = docker.build("amadek/cake-recipes-api:${env.BUILD_ID}")
  }
  stage('Test') {
    container.inside {
      sh 'npm test'
    }
  }
  stage('Publish') {
    docker.withRegistry('https://registry.hub.docker.com/', '37b58f9a-df07-4839-80fe-13ac9ba5e539') {
      container.push("${env.BUILD_ID}")
    }
  }
}
