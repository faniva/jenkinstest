export const cuid = (req) => {
    const ip = req.connection.remoteAddress
    console.log('ip:', ip)
    const processId = process.pid
    console.log('process id: ', processId)
    return Date.now() + processId + ip
}