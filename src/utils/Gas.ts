import { Logger } from './Logger';

const DEFAULT_GAS_BUFFER_PCT = 20n;

const parseEnvBigInt = (value: string | undefined): bigint | undefined => {
  if (!value) return undefined;
  if (!/^\d+$/.test(value)) return undefined;
  try {
    return BigInt(value);
  } catch {
    return undefined;
  }
};

export const getGasBufferPct = (fallbackPct: bigint = DEFAULT_GAS_BUFFER_PCT): bigint => {
  const parsed = parseEnvBigInt(process.env.GAS_LIMIT_BUFFER_PCT);
  return parsed ?? fallbackPct;
};

export const applyGasBuffer = (
  estimate: bigint,
  bufferPct: bigint = getGasBufferPct()
): bigint => {
  return (estimate * (100n + bufferPct)) / 100n;
};

export const estimateGasWithBuffer = async (
  estimateFn: () => Promise<bigint>,
  fallbackGasLimit: bigint,
  logger?: Logger,
  label?: string
): Promise<bigint> => {
  try {
    const estimate = await estimateFn();
    return applyGasBuffer(estimate);
  } catch (error) {
    if (logger) {
      logger.warn(
        `Gas estimate failed${label ? ` for ${label}` : ''}, using fallback`,
        error
      );
    }
    return fallbackGasLimit;
  }
};
