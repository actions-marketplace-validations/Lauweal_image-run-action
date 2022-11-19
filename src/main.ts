import * as core from '@actions/core'
import {Client, ConnectConfig} from 'ssh2'
import {
  checkDockerContainer,
  checkDockerImage,
  deleteDockerContainer,
  deleteDockerImage,
  pullDockerImage,
  startDockerImage,
  stopDockerContainer
} from './commands'

const argsMap = new Map([['PORT', 'p']])
function connect(options: ConnectConfig) {
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
async function start(
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
}

async function run(): Promise<void> {
  try {
    const host = core.getInput('host') ?? ''
    const port = core.getInput('port') ?? ''
    const username = core.getInput('username')
    const password = core.getInput('password')
    const image = core.getInput('image')
    const name = core.getInput('name')
    const args = core.getInput('args') ?? ''
    if (!username) throw new Error('请输入用户名')
    if (!password) throw new Error('请输入密码')
    if (!host) throw new Error('请输入ip')
    if (!image) throw new Error('请输入镜像')
    if (!name) throw new Error('请输入容器名')
    if (!port) throw new Error('请输入端口')
    const hosts = host.split('\n')
    const _args = port.split('\n').reduce((a, b) => `${a} -p ${b}:${b}`, args)
    core.info(`IP: ${JSON.stringify(hosts)}`)
    core.info(`args: ${_args}`)
    Promise.all(
      hosts.map(item =>
        start(
          {
            host: item,
            username,
            password
          },
          name,
          image,
          _args
        )
      )
    ).catch(message => {
      core.setFailed(message.message)
    })
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
