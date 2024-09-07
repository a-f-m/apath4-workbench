import * as ch from 'child_process'
import fs from 'fs'

function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

const dir = '.'

fs.copyFileSync(`${dir}/tsconfig-bundle-1.json`, `${dir}/tsconfig.json`)

console.log('wait for CommonJS/Node compilation');
await sleep(5000)

ch.execSync(`browserify workbench/apath-wrapper.js > workbench/bundle.js`)

console.log('bundle building (browserify)');
// await sleep(10000)

fs.copyFileSync(`${dir}/tsconfig-orig.json`, `${dir}/tsconfig.json`)

console.log('ready');
