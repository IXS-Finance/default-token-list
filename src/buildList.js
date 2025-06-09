const got = require("got");
const { version } = require("../package.json");
const mainnet = require("./tokens/mainnet.json");
const kovan = require("./tokens/kovan.json");
const polygon = require("./tokens/polygon.json");
const mumbai = require("./tokens/mumbai.json");
const amoy = require("./tokens/amoy.json");
const base = require("./tokens/base.json");
const baseSepolia = require("./tokens/base_sepolia.json");
const kaia = require("./tokens/kaia.json");
const kaiaTestnet = require("./tokens/kaia_testnet.json");
const ozeanTestnet = require("./tokens/ozean_testnet.json");
const redBellyTestnet = require("./tokens/red_belly_testnet.json");
const redBellyMainnet = require("./tokens/red_belly_mainnet.json");

module.exports = async function buildList() {
  let dedupe = { n: [], s: [], a: [] };
  let i = 0;
  let {
    body: { tokens },
  } = await got.get(
    "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/tokenlist.json",
    { responseType: "json" }
  );
  tokens = tokens
    .map(({ name, chainId, address, symbol, decimals, logoURI }) => {
      const n = `${chainId || 1}#${name}`;
      const s = `${chainId || 1}#${symbol}`;
      const a = `${chainId || 1}#${address}`;

      if (dedupe.n.includes(n) || dedupe.s.includes(s) || dedupe.a.includes(a))
        return null;
      else if (
        !name ||
        !symbol ||
        !address ||
        !decimals ||
        decimals <= 0 ||
        !logoURI
      )
        return null;
      else if (
        !/^[a-zA-Z0-9+\-%/\$]+$/.test(symbol) ||
        !/^[ \w.'+\-%/À-ÖØ-öø-ÿ:]+$/.test(name)
      )
        return null;
      dedupe.n.push(n);
      dedupe.s.push(s);
      dedupe.a.push(a);

      // remove non checksummed tokens
      if (address.toLowerCase() === address) return null;

      return {
        name,
        address,
        symbol,
        decimals,
        chainId: chainId || 1,
        logoURI,
      };
    })
    .filter(Boolean);
  dedupe = null;

  const parsed = version.split(".");
  return {
    name: "IXS Default List",
    timestamp: new Date().toISOString(),
    version: {
      major: +parsed[0],
      minor: +parsed[1],
      patch: +parsed[2],
    },
    tags: {},
    keywords: ["ixs", "default"],
    tokens: [
      ...tokens,
      ...mainnet,
      ...kovan,
      ...polygon,
      ...mumbai,
      ...amoy,
      ...base,
      ...baseSepolia,
      ...kaia,
      ...kaiaTestnet,
      ...ozeanTestnet,
      ...redBellyTestnet,
      ...redBellyMainnet,
    ]
      // sort them by symbol for easy readability
      .sort((t1, t2) => {
        if (t1.chainId === t2.chainId) {
          return t1.symbol.toLowerCase() < t2.symbol.toLowerCase() ? -1 : 1;
        }
        return t1.chainId < t2.chainId ? -1 : 1;
      }),
  };
};
