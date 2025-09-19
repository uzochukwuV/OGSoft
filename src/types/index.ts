export interface FileInfo {
  name: string;
  size: number;
}

export interface FeeInfo {
  storageFee: string;
  networkFee: string;
  totalFee: string;
  rawTotalFee: bigint;
}