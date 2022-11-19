import {Client} from 'ssh2'

export function checkDockerContainer(client: Client, name: string) {
  return new Promise<boolean>((resolve, reject) => {
    client.exec(
      `docker inspect ${name}`,
      {allowHalfOpen: true},
      (err, channel) => {
        let _data = ''
        channel
          .on('exit', code => {
            if (code) return reject('检查docker容器执行异常')
            if (!_data) {
              resolve(false)
            } else {
              resolve(!!JSON.parse(_data).length)
            }
          })
          .on('data', (data: any) => {
            _data += data.toString()
          })
          .stderr.on('data', data => {
            resolve(false)
          })
      }
    )
  })
}

export function stopDockerContainer(client: Client, name: string) {
  return new Promise<boolean>((resolve, reject) => {
    client.exec(
      `docker stop ${name}`,
      {allowHalfOpen: true},
      (err, channel) => {
        let _data = ''
        channel
          .on('exit', code => {
            if (code) return reject('停止docker容器执行异常')
            resolve(true)
          })
          .on('data', (data: any) => {
            _data += data.toString()
          })
          .stderr.on('data', data => {
            reject('停止docker容器执行异常')
          })
      }
    )
  })
}

export function deleteDockerContainer(client: Client, name: string) {
  return new Promise<boolean>((resolve, reject) => {
    client.exec(
      `docker rm ${name} --force`,
      {allowHalfOpen: true},
      (err, channel) => {
        let _data = ''
        channel
          .on('exit', code => {
            if (code) return reject('删除docker容器执行异常')
            resolve(true)
          })
          .on('data', (data: any) => {
            _data += data.toString()
          })
          .stderr.on('data', data => {
            reject('删除docker容器执行异常')
          })
      }
    )
  })
}

export function checkDockerImage(client: Client, image: string) {
  return new Promise<string>((resolve, reject) => {
    client.exec(
      `docker images -q ${image}`,
      {allowHalfOpen: true},
      (err, channel) => {
        let _data = ''
        channel
          .on('exit', code => {
            if (code) return reject('检查docker镜像执行异常')
            if (!!_data) {
              resolve(image)
            } else {
              resolve('')
            }
          })
          .on('data', (data: any) => {
            _data += data.toString()
          })
          .stderr.on('data', (data: any) => {
            reject('检查docker镜像执行异常')
          })
      }
    )
  })
}

export function deleteDockerImage(client: Client, image: string) {
  return new Promise<string>((resolve, reject) => {
    client.exec(
      `docker rmi ${image}`,
      {allowHalfOpen: true},
      (err, channel) => {
        let _data = ''
        channel
          .on('exit', code => {
            if (code) return reject('删除docker镜像执行异常')
            if (!!_data) {
              resolve(image)
            } else {
              resolve('')
            }
          })
          .stderr.on('data', data => {
            reject('删除docker镜像执行异常')
          })
      }
    )
  })
}

export function pullDockerImage(client: Client, image: string) {
  return new Promise<string>((resolve, reject) => {
    client.exec(
      `docker pull ${image}`,
      {allowHalfOpen: true},
      (err, channel) => {
        let _data = ''
        channel
          .on('exit', code => {
            if (code) return reject('拉取docker镜像执行异常')
            if (!!_data) {
              resolve(image)
            } else {
              resolve('')
            }
          })
          .on('data', (data: any) => {
            _data += data.toString()
          })
          .stderr.on('data', (data: any) => {
            reject('拉取docker镜像执行异常')
          })
      }
    )
  })
}

export function startDockerImage(
  client: Client,
  name: string,
  image: string,
  args: string
) {
  return new Promise<string>((resolve, reject) => {
    client.exec(
      `docker run ${args} --name ${name} -d ${image}`,
      {allowHalfOpen: true},
      (err, channel) => {
        let _data = ''
        channel
          .on('exit', code => {
            if (code) return reject('启动docker镜像执行异常')
            if (!!_data) {
              resolve(_data)
            } else {
              resolve('')
            }
          })
          .on('data', (data: any) => {
            _data += data.toString()
          })
          .stderr.on('data', data => {
            console.log(data.toString())
            reject('启动docker镜像执行异常')
          })
      }
    )
  })
}
