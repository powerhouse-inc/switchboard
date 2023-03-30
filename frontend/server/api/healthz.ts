const startupTime = new Date()

export default eventHandler(() => {
  return {
    status: 'healthy',
    time: new Date(),
    startupTime
  }
})
