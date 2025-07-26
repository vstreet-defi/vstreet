import { GearApi, HexString, IUpdateVoucherParams } from "@gear-js/api";
import { waitReady } from "@polkadot/wasm-crypto";
import { hexToU8a } from "@polkadot/util";
import BN from "bn.js";
import { Keyring } from "@polkadot/api";

const secondsToBlock = 3;
const voucherInfoStorage: Record<HexString, VoucherInfo> = {};

type VoucherInfo = {
  durationInSec: number;
  amount: number;
};

export interface IVoucherDetails {
  id: HexString;
  enabled: boolean;
  varaToIssue: number;
  duration: number;
}

export class GaslessService {
  private api: GearApi;
  private readonly voucherAccount;

  constructor() {
    this.api = new GearApi({ providerAddress: process.env.NODE_URL });
    this.voucherAccount = this.getVoucherAccount();
  }

  async issueIfNeeded(
    account: HexString,
    programId: HexString,
    amount: number,
    durationInSec: number
  ): Promise<HexString> {
    await Promise.all([this.api.isReadyOrError, waitReady()]);

    const all = await this.api.voucher.getAllForAccount(account);
    const existing = Object.entries(all).find(
      ([, v]) => Array.isArray(v.programs) && v.programs.includes(programId)
    );

    if (existing) {
      console.log("⚠️ Voucher already exists:", existing[0]);
      return existing[0] as HexString;
    }

    return this.issue(account, programId, amount, durationInSec);
  }

  async getVoucherDetailsForProgram(
    account: string,
    programId: HexString
  ): Promise<{
    id: HexString;
    enabled: boolean;
    varaToIssue: number;
    duration: number;
  }> {
    const vouchersRecord = await this.api.voucher.getAllForAccount(account);

    for (const [voucherIdHex, details] of Object.entries(vouchersRecord)) {
      if (
        Array.isArray(details.programs) &&
        details.programs.includes(programId)
      ) {
        const voucherId = voucherIdHex as HexString;
        const status = await this.getVoucherStatus(voucherId);

        if (!status.exists) {
          throw new Error("Voucher exists but is not valid");
        }

        const info = await this.getVoucherInfo(voucherId);

        return {
          id: voucherId,
          enabled: status.enabled,
          varaToIssue: info.amount,
          duration: info.durationInSec,
        };
      }
    }

    throw new Error("Voucher not found for this account and program");
  }

  public async getVoucherInfo(voucherId: HexString): Promise<{
    durationInSec: number;
    amount: number;
  }> {
    const stored = voucherInfoStorage[voucherId];
    if (stored) return stored;

    const info = await this.api.balance.findOut(voucherId);
    const balance = info.toBn();

    return {
      durationInSec: 3600,
      amount: balance.toNumber(),
    };
  }

  public async getVoucherStatus(voucherId: HexString): Promise<{
    enabled: boolean;
    exists: boolean;
    rawBalance?: String;
  }> {
    try {
      const info = await this.api.balance.findOut(voucherId);
      const balance = info.toBn();

      console.log("IdVoucher balance:", info.toHuman());

      const infoVoucherAccount = await this.api.balance.findOut(
        this.voucherAccount.address
      );
      console.log(
        "Balance",
        infoVoucherAccount.toHuman(),
        "VoucherAccount:",
        this.voucherAccount.address
      );
      console.log("Account Voucher balance:", infoVoucherAccount.toHuman());

      return {
        enabled: true,
        exists: true,
        rawBalance: info.toHuman(),
      };
    } catch (error) {
      console.warn("⚠️ Failed to find voucher:", error);

      return {
        enabled: false,
        exists: false,
      };
    }
  }

  public async issue(
    spender: HexString,
    programId: HexString,
    amount: number,
    durationInSec: number
  ): Promise<HexString> {
    await Promise.all([this.api.isReadyOrError, waitReady()]);

    const durationInBlocks = Math.round(durationInSec / secondsToBlock);
    const accountId = this.api.createType("AccountId32", spender).toHex();

    const { extrinsic } = await this.api.voucher.issue(
      accountId,
      amount,
      durationInBlocks,
      [programId],
      false
    );

    const info = await this.api.balance.findOut(this.voucherAccount.address);
    console.log(
      "Saldo",
      info.toHuman(),
      "VoucherAccount:",
      this.voucherAccount.address
    );

    const nonce = await this.api.rpc.system.accountNextIndex(
      this.voucherAccount.address
    );

    const voucherId = await new Promise<HexString>((resolve, reject) => {
      extrinsic.signAndSend(
        this.voucherAccount,
        { nonce },
        ({ events, status }) => {
          if (status.isInBlock) {
            const viEvent = events.find(
              ({ event }) => event.method === "VoucherIssued"
            );

            if (viEvent) {
              const data = viEvent.event.data as any;
              const id = data.voucherId.toHex();
              voucherInfoStorage[id] = { durationInSec, amount };
              resolve(id);
            } else {
              const efEvent = events.find(
                ({ event }) => event.method === "ExtrinsicFailed"
              );
              console.error("❌ ExtrinsicFailed:", efEvent?.event.toHuman());
              reject(
                efEvent
                  ? this.api.getExtrinsicFailedError(efEvent.event)
                  : "VoucherIssued event not found"
              );
            }
          }
        }
      );
    });

    console.log("voucherID", voucherId);
    return voucherId;
  }

  public async prolong(
    voucherId: HexString,
    account: string,
    balance: number,
    prolongDurationInSec: number
  ) {
    const voucherBalance =
      (await this.api.balance.findOut(voucherId)).toBigInt() / BigInt(1e12);
    const durationInBlocks = Math.round(prolongDurationInSec / secondsToBlock);
    const topUp = BigInt(balance) - voucherBalance;

    const params: IUpdateVoucherParams = {};
    if (prolongDurationInSec) {
      params.prolongDuration = durationInBlocks;
    }

    if (topUp > 0) {
      params.balanceTopUp = topUp * BigInt(1e12);
    }

    const tx = this.api.voucher.update(account, voucherId, params);
    await new Promise<void>((resolve, reject) => {
      tx.signAndSend(this.voucherAccount, ({ events, status }) => {
        if (status.isInBlock) {
          const vuEvent = events.find(
            ({ event }) => event.method === "VoucherUpdated"
          );
          if (vuEvent) {
            resolve();
          } else {
            const efEvent = events.find(
              ({ event }) => event.method === "ExtrinsicFailed"
            );
            reject(
              efEvent
                ? JSON.stringify(
                    this.api.getExtrinsicFailedError(efEvent.event)
                  )
                : new Error("VoucherUpdated event not found")
            );
          }
        }
      });
    });
  }

  public async revoke(voucherId: HexString, account: string) {
    const tx = this.api.voucher.revoke(account, voucherId);
    await new Promise<void>((resolve, reject) => {
      tx.signAndSend(this.voucherAccount, ({ events, status }) => {
        if (status.isInBlock) {
          const vuEvent = events.find(
            ({ event }) => event.method === "VoucherRevoked"
          );
          if (vuEvent) {
            resolve();
          } else {
            const efEvent = events.find(
              ({ event }) => event.method === "ExtrinsicFailed"
            );
            reject(
              efEvent
                ? JSON.stringify(
                    this.api.getExtrinsicFailedError(efEvent.event)
                  )
                : new Error("VoucherRevoked event not found")
            );
          }
        }
      });
    });
  }

  private getVoucherAccount() {
    const seed = process.env.VOUCHER_ACCOUNT_SEED_HEX;
    const keyring = new Keyring({ type: "sr25519", ss58Format: 137 });
    return keyring.addFromSeed(hexToU8a(seed));
  }

  async getVouchersForAccount(account: string) {
    return this.api.voucher.getAllForAccount(account);
  }
}
