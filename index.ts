const main = async () => {
 console.log('GM MakerDao')
}

main().catch((err) => {
  console.error("Shutting down...")
  if (err instanceof Error) {
    console.error(err)
  } else {
    console.error("An unknown error has occurred. Please open an issue on github with the below:")
    console.log(err)
  }
  process.exit(1)
})
