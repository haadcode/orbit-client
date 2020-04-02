'use strict'

const IPFS = require('ipfs')
const OrbitDB = require('orbit-db')

const creatures = ['🐙', '🐷', '🐬', '🐞', '🐈', '🙉', '🐸', '🐓']

const initIPFSInstance = async () => {
  return await IPFS.create({ repo: './keyvalue-ipfs-repo' });
};

initIPFSInstance().then(async (ipfs) => {
  
  let db
  try {
    const orbitdb = await OrbitDB.createInstance(ipfs, {
      directory: './orbitdb/examples/keyvalue'
    })
    db = await orbitdb.eventlog('example', { overwrite: true })
    await db.load()
    // Query immediately after loading
  } catch (e) {
    console.error(e)
    process.exit(1)
  }

  const query = async () => {
    const index = Math.floor(Math.random() * creatures.length)
    const userId = Math.floor(Math.random() * 900 + 100)

    try {
      await db.add({ avatar: creatures[index], userId: userId })
      const latest = db.iterator({ limit: 5 }).collect()
      let output = ``
      output += `[Latest Visitors]\n`
      output += `--------------------\n`
      output += `ID  | Visitor\n`
      output += `--------------------\n`
      output += latest.reverse().map((e) => e.payload.value.userId + ' | ' + e.payload.value.avatar).join('\n') + `\n`
      console.log(output)
    } catch (e) {
      console.error(e)
      process.exit(1)
    }
  }

  setInterval(query, 1000)
})
