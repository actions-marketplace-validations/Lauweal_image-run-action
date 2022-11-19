import * as core from '@actions/core'
import {
  start,
} from './commands'

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
