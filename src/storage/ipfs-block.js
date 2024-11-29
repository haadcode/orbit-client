/**
 * @namespace Storage-IPFS
 * @memberof module:Storage
 * @description
 * IPFSBlockStorage uses IPFS to store data as raw blocks.
 */
import { CID } from 'multiformats/cid'
import { base58btc } from 'multiformats/bases/base58'
import { TimeoutController } from 'timeout-abort-controller'
import drain from 'it-drain'

const DefaultTimeout = 10000 // 30 seconds

/**
 * Creates an instance of IPFSBlockStorage.
 * @function
 * @param {Object} params One or more parameters for configuring
 * IPFSBlockStorage.
 * @param {IPFS} params.ipfs An IPFS instance.
 * @param {boolean} [params.pin=false] True, if the block should be pinned,
 * false otherwise.
 * @param {number} [params.timeout=defaultTimeout] A timeout in ms.
 * @return {module:Storage.Storage-IPFS} An instance of IPFSBlockStorage.
 * @memberof module:Storage
 * @throw An instance of ipfs is required if params.ipfs is not specified.
 * @instance
 */
const IPFSBlockStorage = async ({ ipfs, pin, timeout } = {}) => {
  if (!ipfs) throw new Error('An instance of ipfs is required.')

  const signals = new Set()

  /**
   * Puts data to an IPFS block.
   * @function
   * @param {string} hash The hash of the block to put.
   * @param {*} data The data to store in the IPFS block.
   * @memberof module:Storage.Storage-IPFS
   * @instance
   */
  const put = async (hash, data) => {
    const cid = CID.parse(hash, base58btc)
    const { signal } = new TimeoutController(timeout || DefaultTimeout)
    await ipfs.blockstore.put(cid, data, { signal })

    if (pin && !(await ipfs.pins.isPinned(cid))) {
      await drain(ipfs.pins.add(cid))
    }
  }

  const del = async (hash) => {}

  /**
   * Gets data from an IPFS block.
   * @function
   * @param {string} hash The hash of the block to get.
   * @return {Uint8Array} The block.
   * @memberof module:Storage.Storage-IPFS
   * @instance
   */
  const get = async (hash) => {
    const cid = CID.parse(hash, base58btc)
    const { signal } = new TimeoutController(timeout || DefaultTimeout)
    signals.add(signal)
    const block = await ipfs.blockstore.get(cid, { signal })
    signals.delete(signal)
    if (block) {
      return block
    }
  }

  const iterator = async function * () {}

  const merge = async (other) => {}

  const clear = async () => {}

  const close = async () => {
    for (const s in signals) {
      s.abort()
    }
    signals.clear()
  }

  return {
    put,
    del,
    get,
    iterator,
    merge,
    clear,
    close
  }
}

export default IPFSBlockStorage
