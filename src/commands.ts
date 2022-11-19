import { Client, ConnectConfig } from 'ssh2'
import * as core from '@actions/core'

export function checkDockerContainer(client: Client, name: string) {
  return new Promise<boolean>((resolve, reject) => {
    client.exec(
      `docker inspect ${name}`,
      { allowHalfOpen: true },
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
      { allowHalfOpen: true },
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
      { allowHalfOpen: true },
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
      { allowHalfOpen: true },
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
      { allowHalfOpen: true },
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
      { allowHalfOpen: true },
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
      { allowHalfOpen: true },
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

export function connect(options: ConnectConfig) {
  const conn = new Client()
  return new Promise<Client>((resolve, reject) => {
    conn
      .connect(options)
      .on('error', () => {
        reject('连接异常')
      })
      .on('close', () => {
        reject('连接关闭')
      })
      .on('ready', () => {
        resolve(conn)
      })
  })
}

// 启动
export async function start(
  options: ConnectConfig,
  name: string,
  image: string,
  args: string = ''
) {
  const client = await connect(options)
  core.info('开始检查docker容器')
  let container = await checkDockerContainer(client, name)
  if (container) {
    core.info('存在正在启动的容器，准备停止')
    await stopDockerContainer(client, name)
    core.info('删除已经停止的容器')
    await deleteDockerContainer(client, name)
  }
  core.info('检查镜像')
  let imagecode = await checkDockerImage(client, image)
  if (imagecode) {
    core.info('删除已存在的镜像')
    imagecode = await deleteDockerImage(client, imagecode)
  }
  core.info('进行镜像拉取')
  imagecode = await pullDockerImage(client, image)
  core.info('启动docker镜像')
  await startDockerImage(client, name, image, args)
  core.info('启动成功')
  client.end();
  client.destroy();
  core.info('关闭连接');
}
