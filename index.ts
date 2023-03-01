const main = async () => {
  console.info('GM MakerDao');
};

main().catch((err) => {
  console.error('Shutting down...');
  if (err instanceof Error) {
    console.error(err);
  } else {
    console.error('An unknown error has occurred. Please open an issue on github (https://github.com/makerdao-ses/switchboard-boilerplate/issues/new) with the below context:');
    console.info(err);
  }
  process.exit(1);
});
