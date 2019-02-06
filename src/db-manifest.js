
const { DAGNode } = require('ipld-dag-pb')

// Creates a DB manifest file and saves it in IPFS
const createDBManifest = async (ipfs, name, type, accessControllerAddress, onlyHash) => {
  const manifest = {
    name: name,
    type: type,
    accessController: '/ipfs' + '/' + accessControllerAddress,
  }
  let dag
  const manifestJSON = JSON.stringify(manifest)
  if (onlyHash) {
    dag = await new Promise(resolve => {
      DAGNode.create(Buffer.from(manifestJSON), (err, n) => {
        if (err) {
          throw err
        }
        resolve(n)
      })
    })
  } else {
    dag = await ipfs.object.put(Buffer.from(manifestJSON))
  }
  return dag.toJSON().multihash.toString()
}

module.exports = createDBManifest
