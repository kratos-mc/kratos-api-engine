const fse = require("fs-extra");
const { hideBin } = require("yargs/helpers");

const shortenArgv = hideBin(process.argv);
if (shortenArgv.length === 0) {
  throw new Error(`Directory has not provided, using ./rm-scripts <path>`);
}

const willRemoveDirectory = shortenArgv[0];
if (fse.existsSync(willRemoveDirectory)) {
  // Empty the directory
  fse.emptyDirSync(willRemoveDirectory);
  fse.rmSync(willRemoveDirectory, { force: true, recursive: true });

  console.log(`Eliminated ${willRemoveDirectory}`);
} else {
  console.log(`warn: not found ${willRemoveDirectory}`);
}
