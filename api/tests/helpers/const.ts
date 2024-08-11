import { providers, utils, Wallet } from 'ethers';

export const PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // Hardhat Account #0
export const PUBLIC_KEY = utils.computeAddress(PRIVATE_KEY);
export const SECOND_PRIVATE_KEY = '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';
export const SECOND_PUBLIC_KEY = utils.computeAddress(SECOND_PRIVATE_KEY);

export const provider = providers.getDefaultProvider();
export const signer = new Wallet(PRIVATE_KEY, provider);
