const fs = require('fs')
const cp = require('child_process')
const yargs = require('yargs-parser')
const rimraf = require('rimraf')
const archiver = require('archiver')
const path = require('path')
const { findSteamAppById } = require('find-steam-app');

const release = path.join(__dirname, '../Release')

if (!fs.existsSync(release)) fs.mkdirSync(release)

function build(mod, dev, extra = []) {
    const outPath = path.join(release, mod)
    const proj = path.join(__dirname, '..', mod)
    const devPath = path.join('C:\\Program Files (x86)\\Steam\\steamapps\\common\\A Dance of Fire and Ice\\Mods', mod)

    const copyDist = (filename, root) => fs.copyFileSync(path.join(...root ? [proj] : [proj, 'bin/Release'], filename), path.join(devPath, filename))
    const copy = (filename, root) => {
        fs.copyFileSync(path.join(...root ? [proj] : [proj, 'bin/Release'], filename), path.join(outPath, filename))
        if (dev) copyDist(filename, root)
    }
    
    const info = require(path.join(proj, 'Info.json'))
    rimraf.sync(outPath)
    fs.mkdirSync(outPath)

    if (dev) {
        rimraf.sync(devPath)
        fs.mkdirSync(devPath)
    }
    
    cp.execSync('"C:\\Program Files\\JetBrains\\JetBrains Rider 2021.1.3\\tools\\MSBuild\\Current\\Bin\\MSBuild.exe" /p:Configuration=Release', {
        cwd: proj
    })
    
    copy(mod + '.dll')
    copy('Info.json', true)
    for (const ex of extra) {
        copy(ex.file, ex.root || false)
    }
}

const args = yargs(process.argv)

const dev = !args.release

build('AdofaiUtils2.Core', dev, [{
    file: 'UnityProject/Assets/AssetBundle/AssetBundle',
    root: true
}])

if (dev) {
    try {
        cp.execSync('explorer steam://rungameid/977950')
    } catch {}
}


// (async () => {
//     rimraf.sync('Release')
//
//     cp.execSync('"C:\\Program Files\\JetBrains\\JetBrains Rider 2021.1.3\\tools\\MSBuild\\Current\\Bin\\MSBuild.exe" /p:Configuration=Release')
//
//     fs.mkdirSync('Release')
//
//     fs.copyFileSync(`./bin/Release/${info.Id}.dll`, `./Release/${info.Id}.dll`)
//
//     fs.copyFileSync('./Info.json', './Release/Info.json')
//
//     const args = yargs(process.argv)
//
//     if (args.release) {
//         const zip = archiver('zip', {})
//         const stream = fs.createWriteStream(path.join(__dirname, `${info.Id}-${info.Version}.zip`))
//         zip.pipe(stream)
//         zip.directory('Release/', info.Id)
//         await zip.finalize()
//     } else {
//         const appPath = await findSteamAppById(977950)
//         const modPath = path.join(appPath, 'Mods', info.Id)
//         const r68ModPath = path.join('F:\\Programs\\Steam\\steamapps\\common\\R68 Dance of Fire and Ice', 'Mods', info.Id)
//         rimraf.sync(path.join(modPath, info.Id + '.dll'))
//         rimraf.sync(path.join(modPath, 'Info.json'))
//         rimraf.sync(path.join(r68ModPath, info.Id + '.dll'))
//         rimraf.sync(path.join(r68ModPath, 'Info.json'))
//
//         if (!fs.existsSync(modPath)) fs.mkdirSync(modPath)
//         if (!fs.existsSync(r68ModPath)) fs.mkdirSync(r68ModPath)
//         fs.copyFileSync(`Release/${info.Id}.dll`, path.join(modPath, info.Id + '.dll'))
//         fs.copyFileSync('Release/Info.json', path.join(modPath, 'Info.json'))
//         fs.copyFileSync(`Release/${info.Id}.dll`, path.join(r68ModPath, info.Id + '.dll'))
//         fs.copyFileSync('Release/Info.json', path.join(r68ModPath, 'Info.json'))
//     }
//     console.log('Successful.')
// })()