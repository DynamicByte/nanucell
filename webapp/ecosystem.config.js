module.exports = {
  apps: [{
    name: 'nanucell',
    cwd: '/home/nanucell/htdocs/nanucell.science',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p 3002',
    env: {
      NODE_ENV: 'production',
      PORT: 3002
    }
  }]
}
