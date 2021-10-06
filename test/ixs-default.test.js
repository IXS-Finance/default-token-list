const { expect } = require('chai');
const { getAddress } = require('@ethersproject/address');
const Ajv = require('ajv');
const packageJson = require('../package.json');
const schema = require('./tokenlist.schema.json');
const buildList = require('../src/buildList');

const ajv = new Ajv({ allErrors: true, format: 'full' });
const validate  = ajv.compile(schema);

describe('buildList', () => {
  let defaultTokenList;

  before(async () => {
    defaultTokenList = await buildList();
  });

  it('validates', () => {
    const valid  = validate(defaultTokenList);

    if (!valid) {
      console.error(validate.errors);
    }

    expect(valid).to.equal(true);
  });

  it('contains no duplicate addresses', () => {
    const map = {};
    for (let token of defaultTokenList.tokens) {
      const key = `${token.chainId}-${token.address}`;
      expect(typeof map[ key ])
        .to.equal('undefined');
      map[ key ] = true;
    }
  });

  it('contains no duplicate symbols', () => {
    const map = {};
    for (let token of defaultTokenList.tokens) {
      const key = `${token.chainId}-${token.symbol.toLowerCase()}`;
      expect(typeof map[ key ])
        .to.equal('undefined');
      map[ key ] = true;
    }
  })

  it('contains no duplicate names', () => {
    const map = {};
    for (let token of defaultTokenList.tokens) {
      const key = `${token.chainId}-${token.name.toLowerCase()}`;
      expect(typeof map[ key ])
        .to.equal('undefined', `duplicate name: ${token.name}`);
      map[ key ] = true;
    }
  })

  it('all addresses are valid and checksummed', () => {
    for (let token of defaultTokenList.tokens) {
      expect(getAddress(token.address)).to.eq(token.address, `Non hashed address for token ${token.name}`);
    }
  });

  it('version matches package.json', () => {
    expect(packageJson.version).to.match(/^\d+\.\d+\.\d+$/);
    expect(packageJson.version).to.equal(`${defaultTokenList.version.major}.${defaultTokenList.version.minor}.${defaultTokenList.version.patch}`);
  });
});