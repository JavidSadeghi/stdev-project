import NodeCache from "node-cache";

export default new NodeCache({
  stdTTL: 0,
  deleteOnExpire: true,
  useClones: false
});