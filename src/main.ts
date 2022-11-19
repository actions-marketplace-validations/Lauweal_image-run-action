import * as core from '@actions/core'
// import { Client, ConnectConfig } from 'ssh2';

// function connect(options: ConnectConfig) {
//   const conn = new Client();
//   return new Promise<Client>((resolve, reject) => {
//     conn.connect(options).on('error', () => {
//       reject('连接异常');
//     }).on('close', () => {
//       reject('连接关闭');
//     }).on('ready', () => {
//       resolve(conn);
//     });
//   })
// }

async function run(): Promise<void> {
  try {
    const host = core.getInput('host') ?? '';
    const username = core.getInput('username');
    const password = core.getInput('password');
    const image = core.getInput('image');
    const name = core.getInput('name');
    const args = core.getInput('args');
    if (!username) throw new Error('请输入用户名')
    if (!password) throw new Error('请输入密码')
    if (!host) throw new Error('请输入ip')
    if (!image) throw new Error('请输入镜像')
    if (!name) throw new Error('请输入容器名')
    core.info(JSON.stringify(args));
    // const client = await connect({ username, password, host });
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
