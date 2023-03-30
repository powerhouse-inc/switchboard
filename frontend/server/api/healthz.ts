const startupTime = new Date()

export default eventHandler(async () => {
  return {
    status: 'healthy',
    time: new Date(),
    startupTime,
  }
})
