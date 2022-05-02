const path = require('path');
const open = require('open');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers')
const { fs } = require('appium-support');

export async function openAppiumInspector ({
  sessionFile, stateJson, autoStart = false,
}) {
  let state = {};
  if (sessionFile) {
    if (!await fs.exists(sessionFile)) {
      throw new Error(`Session file ${sessionFile} does not exist`);
    }
    try {
      const sessionFileContents = JSON.parse(await fs.readFile(sessionfile, 'utf8'));
      state = {...state, ...sessionFileContents};
    } catch (e) {
      throw new Error(`Session file ${sessionFile} is not valid JSON`);
    }
  }

  if (stateJson) {
    try {
      state = {...state, ...JSON.parse(stateJson)};
    } catch (e) {
      throw new Error(`State JSON is not valid JSON`);
    }
  }

  return await open(
    path.join(
      __dirname, 
      `./dist-browser/index.html?state=${encodeURIComponent(JSON.stringify(state))}&autoStart=${autoStart}`
    )
  );
}

if (require.main === module) {
  yargs(hideBin(process.argv))
    .command('$0', 'opens an Appium Inspector', async (argv) => {
      await openAppiumInspector(argv);
    })
    .option('session-file', {
      alias: 's',
      type: 'string',
      description: '.appiumsession file to use for initial state',
    })
    .option('state-json', {
      alias: 'j',
      type: 'string',
      description: 'JSON string to use for initial state',
    })
    .option('auto-start', {
      alias: 'a',
      type: 'boolean',
      description: 'starts the inspector session automatically',
    })
    .parse();
}