
import { GearApi, decodeAddress } from '@gear-js/api';
import { TypeRegistry } from '@polkadot/types';
import { TransactionBuilder, getServiceNamePrefix, getFnNamePrefix, ZERO_ADDRESS } from 'sails-js';

export type ActorId = string;

export interface Config {
  gas_to_delete_session: number | string | bigint;
  minimum_session_duration_ms: number | string | bigint;
  ms_per_block: number | string | bigint;
}

export interface VstreetStateConfig {
  decimals_factor: number | string | bigint;
  year_in_seconds: number | string | bigint;
  base_rate: number | string | bigint;
  risk_multiplier: number | string | bigint;
  one_tvara: number | string | bigint;
  vara_price: number | string | bigint;
  dev_fee: number | string | bigint;
  max_loan_amount: number | string | bigint;
  max_collateral_withdraw: number | string | bigint;
  max_liquidity_deposit: number | string | bigint;
  max_liquidity_withdraw: number | string | bigint;
  min_rewards_withdraw: number | string | bigint;
}

export interface VstreetState {
  owner: ActorId;
  admins: ActorId[];
  vft_contract_id: ActorId | null;
  total_deposited: number | string | bigint;
  total_borrowed: number | string | bigint;
  available_rewards_pool: number | string | bigint;
  total_rewards_distributed: number | string | bigint;
  users: Record<ActorId, UserInfo>;
  utilization_factor: number | string | bigint;
  interest_rate: number | string | bigint;
  apr: number | string | bigint;
  ltv: number | string | bigint;
  config: VstreetStateConfig;
}

export interface UserInfo {
  balance: number | string | bigint;
  rewards: number | string | bigint;
  rewards_withdrawn: number | string | bigint;
  liquidity_last_updated: number | string | bigint;
  borrow_last_updated: number | string | bigint;
  balance_usdc: number | string | bigint;
  rewards_usdc: number | string | bigint;
  rewards_usdc_withdrawn: number | string | bigint;
  balance_vara: number | string | bigint;
  mla: number | string | bigint;
  cv: number | string | bigint;
  available_to_withdraw_vara: number | string | bigint;
  loan_amount: number | string | bigint;
  loan_amount_usdc: number | string | bigint;
  is_loan_active: boolean;
  ltv: number | string | bigint;
}

export interface SignatureData {
  key: ActorId;
  duration: number | string | bigint;
  allowed_actions: ActionsForSession[];
}

export type ActionsForSession =
  | 'AddAdmin'
  | 'RemoveAdmin'
  | 'SetVftContractId'
  | 'SetLtv'
  | 'ModifyAvailableRewardsPool'
  | 'SetVaraPrice'
  | 'DepositLiquidity'
  | 'WithdrawLiquidity'
  | 'WithdrawRewards'
  | 'DepositCollateral'
  | 'WithdrawCollateral'
  | 'TakeLoan'
  | 'PayAllLoan'
  | 'PayLoan';

export interface SessionData {
  key: ActorId;
  expires: number | string | bigint;
  allowed_actions: ActionsForSession[];
  expires_at_block: number;
}

const types = {
  VstreetAppConfig: {
    gas_to_delete_session: 'u64',
    minimum_session_duration_ms: 'u64',
    ms_per_block: 'u64',
  },
  VstreetStateConfig: {
    decimals_factor: 'u128',
    year_in_seconds: 'u128',
    base_rate: 'u128',
    risk_multiplier: 'u128',
    one_tvara: 'u128',
    vara_price: 'u128',
    dev_fee: 'u128',
    max_loan_amount: 'u128',
    max_collateral_withdraw: 'u128',
    max_liquidity_deposit: 'u128',
    max_liquidity_withdraw: 'u128',
    min_rewards_withdraw: 'u128',
  },
  VstreetState: {
    owner: '[u8;32]',
    admins: 'Vec<[u8;32]>',
    vft_contract_id: 'Option<[u8;32]>',
    total_deposited: 'u128',
    total_borrowed: 'u128',
    available_rewards_pool: 'u128',
    total_rewards_distributed: 'u128',
    users: 'BTreeMap<[u8;32], UserInfo>',
    utilization_factor: 'u128',
    interest_rate: 'u128',
    apr: 'u128',
    ltv: 'u128',
    config: 'VstreetStateConfig',
  },
  UserInfo: {
    balance: 'u128',
    rewards: 'u128',
    rewards_withdrawn: 'u128',
    liquidity_last_updated: 'u128',
    borrow_last_updated: 'u128',
    balance_usdc: 'u128',
    rewards_usdc: 'u128',
    rewards_usdc_withdrawn: 'u128',
    balance_vara: 'u128',
    mla: 'u128',
    cv: 'u128',
    available_to_withdraw_vara: 'u128',
    loan_amount: 'u128',
    loan_amount_usdc: 'u128',
    is_loan_active: 'bool',
    ltv: 'u128',
  },
  SignatureData: {
    key: '[u8;32]',
    duration: 'u64',
    allowed_actions: 'Vec<ActionsForSession>',
  },
  ActionsForSession: {
    _enum: [
      'AddAdmin',
      'RemoveAdmin',
      'SetVftContractId',
      'SetLtv',
      'ModifyAvailableRewardsPool',
      'SetVaraPrice',
      'DepositLiquidity',
      'WithdrawLiquidity',
      'WithdrawRewards',
      'DepositCollateral',
      'WithdrawCollateral',
      'TakeLoan',
      'PayAllLoan',
      'PayLoan',
    ],
  },
  SessionData: {
    key: '[u8;32]',
    expires: 'u64',
    allowed_actions: 'Vec<ActionsForSession>',
    expires_at_block: 'u32',
  },
  Deposit: {
    amount: 'u128',
  },
  WithdrawLiquidity: {
    amount: 'u128',
  },
  WithdrawRewards: {
    amount_withdrawn: 'u128',
  },
  TotalBorrowedModified: {
    borrowed: 'u128',
  },
  AvailableRewardsPoolModified: {
    pool: 'u128',
  },
  DepositedVara: {
    amount: 'u128',
  },
  WithdrawnVara: {
    amount: 'u128',
  },
  LoanTaken: {
    amount: 'u128',
  },
  LoanPayed: {
    amount: 'u128',
  },
};

export class Program {
  public readonly registry: TypeRegistry;
  public readonly service: Service;
  public readonly session: Session;

  constructor(
    public api: GearApi,
    private _programId?: `0x${string}`,
  ) {
    this.registry = new TypeRegistry();
    this.registry.setKnownTypes({ types });
    this.registry.register(types);

    this.service = new Service(this);
    this.session = new Session(this);
  }

  public get programId(): `0x${string}` {
    if (!this._programId) throw new Error('Program ID is not set');
    return this._programId;
  }

  newCtorFromCode(
    code: Uint8Array | Buffer,
    owner: ActorId,
    admins: ActorId[],
    vft_contract_id: ActorId | null,
    total_deposited: number | string | bigint,
    total_borrowed: number | string | bigint,
    available_rewards_pool: number | string | bigint,
    total_rewards_distributed: number | string | bigint,
    utilization_factor: number | string | bigint,
    interest_rate: number | string | bigint,
    apr: number | string | bigint,
    ltv: number | string | bigint,
    config: Config,
    vstreetConfig: VstreetStateConfig,
  ): TransactionBuilder<null> {
    const builder = new TransactionBuilder<null>(
      this.api,
      this.registry,
      'upload_program',
      [
        'New',
        owner,
        admins,
        vft_contract_id,
        total_deposited,
        total_borrowed,
        available_rewards_pool,
        total_rewards_distributed,
        utilization_factor,
        interest_rate,
        apr,
        ltv,
        config,
        vstreetConfig,
      ],
      '(String, [u8;32], Vec<[u8;32]>, Option<[u8;32]>, u128, u128, u128, u128, u128, u128, u128, u128, VstreetAppConfig, VstreetStateConfig)',
      'String',
      code,
    );
    this._programId = builder.programId;
    return builder;
  }

  newCtorFromCodeId(
    codeId: `0x${string}`,
    owner: ActorId,
    admins: ActorId[],
    vft_contract_id: ActorId | null,
    total_deposited: number | string | bigint,
    total_borrowed: number | string | bigint,
    available_rewards_pool: number | string | bigint,
    total_rewards_distributed: number | string | bigint,
    utilization_factor: number | string | bigint,
    interest_rate: number | string | bigint,
    apr: number | string | bigint,
    ltv: number | string | bigint,
    config: Config,
    vstreetConfig: VstreetStateConfig,
  ): TransactionBuilder<null> {
    const builder = new TransactionBuilder<null>(
      this.api,
      this.registry,
      'create_program',
      [
        'New',
        owner,
        admins,
        vft_contract_id,
        total_deposited,
        total_borrowed,
        available_rewards_pool,
        total_rewards_distributed,
        utilization_factor,
        interest_rate,
        apr,
        ltv,
        config,
        vstreetConfig,
      ],
      '(String, [u8;32], Vec<[u8;32]>, Option<[u8;32]>, u128, u128, u128, u128, u128, u128, u128, u128, VstreetAppConfig, VstreetStateConfig)',
      'String',
      codeId,
    );
    this._programId = builder.programId;
    return builder;
  }
}

export class Service {
  constructor(private _program: Program) {}

  public addAdmin(new_admin: ActorId, session_for_account: ActorId | null): TransactionBuilder<[null, string]> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<[null, string]>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['Service', 'AddAdmin', new_admin, session_for_account],
      '(String, String, [u8;32], Option<[u8;32]>)',
      'Result<Null, String>',
      this._program.programId,
    );
  }

  public calculateAllLoanInterestRateAmounts(): TransactionBuilder<[null, string]> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<[null, string]>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['Service', 'CalculateAllLoanInterestRateAmounts'],
      '(String, String)',
      'Result<Null, String>',
      this._program.programId,
    );
  }

  public calculateApr(): TransactionBuilder<bigint> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<bigint>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['Service', 'CalculateApr'],
      '(String, String)',
      'u128',
      this._program.programId,
    );
  }

  public calculateCv(user: ActorId): TransactionBuilder<string> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<string>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['Service', 'CalculateCv', user],
      '(String, String, [u8;32])',
      'String',
      this._program.programId,
    );
  }

  public calculateMla(user: ActorId): TransactionBuilder<string> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<string>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['Service', 'CalculateMla', user],
      '(String, String, [u8;32])',
      'String',
      this._program.programId,
    );
  }

  public calculateUtilizationFactor(): TransactionBuilder<bigint> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<bigint>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['Service', 'CalculateUtilizationFactor'],
      '(String, String)',
      'u128',
      this._program.programId,
    );
  }

  public depositCollateral(user_id: ActorId, session_for_account: ActorId | null): TransactionBuilder<[null, string]> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<[null, string]>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['Service', 'DepositCollateral', user_id, session_for_account],
      '(String, String, [u8;32], Option<[u8;32]>)',
      'Result<Null, String>',
      this._program.programId,
    );
  }

  public depositLiquidity(amount: number | string | bigint, session_for_account: ActorId | null): TransactionBuilder<[null, string]> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<[null, string]>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['Service', 'DepositLiquidity', amount, session_for_account],
      '(String, String, u128, Option<[u8;32]>)',
      'Result<Null, String>',
      this._program.programId,
    );
  }

  public liquidateUserLoan(user: ActorId): TransactionBuilder<[null, string]> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<[null, string]>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['Service', 'LiquidateUserLoan', user],
      '(String, String, [u8;32])',
      'Result<Null, String>',
      this._program.programId,
    );
  }

  public modifyAvailableRewardsPool(amount: number | string | bigint, session_for_account: ActorId | null): TransactionBuilder<[null, string]> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<[null, string]>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['Service', 'ModifyAvailableRewardsPool', amount, session_for_account],
      '(String, String, u128, Option<[u8;32]>)',
      'Result<Null, String>',
      this._program.programId,
    );
  }

  public payAllLoan(session_for_account: ActorId | null): TransactionBuilder<[null, string]> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<[null, string]>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['Service', 'PayAllLoan', session_for_account],
      '(String, String, Option<[u8;32]>)',
      'Result<Null, String>',
      this._program.programId,
    );
  }

  public payLoan(amount: number | string | bigint, session_for_account: ActorId | null): TransactionBuilder<[null, string]> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<[null, string]>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['Service', 'PayLoan', amount, session_for_account],
      '(String, String, u128, Option<[u8;32]>)',
      'Result<Null, String>',
      this._program.programId,
    );
  }

  public removeAdmin(admin: ActorId, session_for_account: ActorId | null): TransactionBuilder<[null, string]> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<[null, string]>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['Service', 'RemoveAdmin', admin, session_for_account],
      '(String, String, [u8;32], Option<[u8;32]>)',
      'Result<Null, String>',
      this._program.programId,
    );
  }

  public setLtv(ltv: number | string | bigint, session_for_account: ActorId | null): TransactionBuilder<string> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<string>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['Service', 'SetLtv', ltv, session_for_account],
      '(String, String, u128, Option<[u8;32]>)',
      'String',
      this._program.programId,
    );
  }

  public setVaraPrice(vara_price: number | string | bigint, session_for_account: ActorId | null): TransactionBuilder<string> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<string>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['Service', 'SetVaraPrice', vara_price, session_for_account],
      '(String, String, u128, Option<[u8;32]>)',
      'String',
      this._program.programId,
    );
  }

  public setVftContractId(vft_contract_id: ActorId, session_for_account: ActorId | null): TransactionBuilder<string> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<string>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['Service', 'SetVftContractId', vft_contract_id, session_for_account],
      '(String, String, [u8;32], Option<[u8;32]>)',
      'String',
      this._program.programId,
    );
  }

  public takeLoan(amount: number | string | bigint, user_id: ActorId, session_for_account: ActorId | null): TransactionBuilder<[null, string]> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<[null, string]>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['Service', 'TakeLoan', amount, user_id, session_for_account],
      '(String, String, u128, [u8;32], Option<[u8;32]>)',
      'Result<Null, String>',
      this._program.programId,
    );
  }

  public transferTokens(from: ActorId, to: ActorId, amount: number | string | bigint): TransactionBuilder<[null, string]> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<[null, string]>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['Service', 'TransferTokens', from, to, amount],
      '(String, String, [u8;32], [u8;32], u128)',
      'Result<Null, String>',
      this._program.programId,
    );
  }

  public updateAllCollateralAvailableToWithdraw(): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['Service', 'UpdateAllCollateralAvailableToWithdraw'],
      '(String, String)',
      'Null',
      this._program.programId,
    );
  }

  public updateAllRewards(): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['Service', 'UpdateAllRewards'],
      '(String, String)',
      'Null',
      this._program.programId,
    );
  }

  public updateUserLtv(user: ActorId): TransactionBuilder<string> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<string>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['Service', 'UpdateUserLtv', user],
      '(String, String, [u8;32])',
      'String',
      this._program.programId,
    );
  }

  public withdrawCollateral(user_id: ActorId, amount: number | string | bigint, session_for_account: ActorId | null): TransactionBuilder<[null, string]> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<[null, string]>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['Service', 'WithdrawCollateral', user_id, amount, session_for_account],
      '(String, String, [u8;32], u128, Option<[u8;32]>)',
      'Result<Null, String>',
      this._program.programId,
    );
  }

  public withdrawLiquidity(amount: number | string | bigint, session_for_account: ActorId | null): TransactionBuilder<[null, string]> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<[null, string]>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['Service', 'WithdrawLiquidity', amount, session_for_account],
      '(String, String, u128, Option<[u8;32]>)',
      'Result<Null, String>',
      this._program.programId,
    );
  }

  public withdrawRewards(session_for_account: ActorId | null): TransactionBuilder<[null, string]> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<[null, string]>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['Service', 'WithdrawRewards', session_for_account],
      '(String, String, Option<[u8;32]>)',
      'Result<Null, String>',
      this._program.programId,
    );
  }

  public async allUsers(
    originAddress?: string,
    value?: number | string | bigint,
    atBlock?: `0x${string}`,
  ): Promise<string> {
    const payload = this._program.registry.createType('(String, String)', ['Service', 'AllUsers']).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, String)', reply.payload);
    return result[2].toString();
  }

  public async contractInfo(
    originAddress?: string,
    value?: number | string | bigint,
    atBlock?: `0x${string}`,
  ): Promise<string> {
    const payload = this._program.registry.createType('(String, String)', ['Service', 'ContractInfo']).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, String)', reply.payload);
    return result[2].toString();
  }

  public async contractOwner(
    originAddress?: string,
    value?: number | string | bigint,
    atBlock?: `0x${string}`,
  ): Promise<string> {
    const payload = this._program.registry.createType('(String, String)', ['Service', 'ContractOwner']).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, String)', reply.payload);
    return result[2].toString();
  }

  public async stateMut(
    originAddress?: string,
    value?: number | string | bigint,
    atBlock?: `0x${string}`,
  ): Promise<VstreetState> {
    const payload = this._program.registry.createType('(String, String)', ['Service', 'StateMut']).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, VstreetState)', reply.payload);
    return result[2].toJSON() as unknown as VstreetState;
  }

  public async totalDeposited(
    originAddress?: string,
    value?: number | string | bigint,
    atBlock?: `0x${string}`,
  ): Promise<string> {
    const payload = this._program.registry.createType('(String, String)', ['Service', 'TotalDeposited']).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, String)', reply.payload);
    return result[2].toString();
  }

  public async userBalance(
    user: ActorId,
    originAddress?: string,
    value?: number | string | bigint,
    atBlock?: `0x${string}`,
  ): Promise<string> {
    const payload = this._program.registry.createType('(String, String, [u8;32])', ['Service', 'UserBalance', user]).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, String)', reply.payload);
    return result[2].toString();
  }

  public async userInfo(
    user: ActorId,
    originAddress?: string,
    value?: number | string | bigint,
    atBlock?: `0x${string}`,
  ): Promise<string> {
    const payload = this._program.registry.createType('(String, String, [u8;32])', ['Service', 'UserInfo', user]).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, String)', reply.payload);
    return result[2].toString();
  }

  public async userRewards(
    user: ActorId,
    originAddress?: string,
    value?: number | string | bigint,
    atBlock?: `0x${string}`,
  ): Promise<string> {
    const payload = this._program.registry.createType('(String, String, [u8;32])', ['Service', 'UserRewards', user]).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, String)', reply.payload);
    return result[2].toString();
  }

  public async vftContractId(
    originAddress?: string,
    value?: number | string | bigint,
    atBlock?: `0x${string}`,
  ): Promise<string> {
    const payload = this._program.registry.createType('(String, String)', ['Service', 'VftContractId']).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, String)', reply.payload);
    return result[2].toString();
  }

  public subscribeToDepositEvent(
    callback: (data: { amount: number | string | bigint }) => void | Promise<void>,
  ): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) return;
      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Service' && getFnNamePrefix(payload) === 'Deposit') {
        void Promise.resolve(callback(
          this._program.registry.createType('(String, String, Deposit)', message.payload)[2].toJSON() as { amount: number | string | bigint }
        )).catch(console.error);
      }
    });
  }

  public subscribeToVFTsetedEvent(
    callback: (data: ActorId) => void | Promise<void>,
  ): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) return;
      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Service' && getFnNamePrefix(payload) === 'VFTseted') {
        void Promise.resolve(callback(
          this._program.registry.createType('(String, String, [u8;32])', message.payload)[2].toJSON() as ActorId
        )).catch(console.error);
      }
    });
  }

  public subscribeToWithdrawLiquidityEvent(
    callback: (data: { amount: number | string | bigint }) => void | Promise<void>,
  ): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) return;
      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Service' && getFnNamePrefix(payload) === 'WithdrawLiquidity') {
        void Promise.resolve(callback(
          this._program.registry.createType('(String, String, WithdrawLiquidity)', message.payload)[2].toJSON() as { amount: number | string | bigint }
        )).catch(console.error);
      }
    });
  }

  public subscribeToWithdrawRewardsEvent(
    callback: (data: { amount_withdrawn: number | string | bigint }) => void | Promise<void>,
  ): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) return;
      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Service' && getFnNamePrefix(payload) === 'WithdrawRewards') {
        void Promise.resolve(callback(
          this._program.registry.createType('(String, String, WithdrawRewards)', message.payload)[2].toJSON() as { amount_withdrawn: number | string | bigint }
        )).catch(console.error);
      }
    });
  }

  public subscribeToErrorEvent(
    callback: (data: string) => void | Promise<void>,
  ): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) return;
      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Service' && getFnNamePrefix(payload) === 'Error') {
        void Promise.resolve(callback(
          this._program.registry.createType('(String, String, String)', message.payload)[2].toString()
        )).catch(console.error);
      }
    });
  }

  public subscribeToTotalBorrowedModifiedEvent(
    callback: (data: { borrowed: number | string | bigint }) => void | Promise<void>,
  ): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) return;
      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Service' && getFnNamePrefix(payload) === 'TotalBorrowedModified') {
        void Promise.resolve(callback(
          this._program.registry.createType('(String, String, TotalBorrowedModified)', message.payload)[2].toJSON() as { borrowed: number | string | bigint }
        )).catch(console.error);
      }
    });
  }

  public subscribeToAvailableRewardsPoolModifiedEvent(
    callback: (data: { pool: number | string | bigint }) => void | Promise<void>,
  ): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) return;
      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Service' && getFnNamePrefix(payload) === 'AvailableRewardsPoolModified') {
        void Promise.resolve(callback(
          this._program.registry.createType('(String, String, AvailableRewardsPoolModified)', message.payload)[2].toJSON() as { pool: number | string | bigint }
        )).catch(console.error);
      }
    });
  }

  public subscribeToDepositedVaraEvent(
    callback: (data: { amount: number | string | bigint }) => void | Promise<void>,
  ): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) return;
      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Service' && getFnNamePrefix(payload) === 'DepositedVara') {
        void Promise.resolve(callback(
          this._program.registry.createType('(String, String, DepositedVara)', message.payload)[2].toJSON() as { amount: number | string | bigint }
        )).catch(console.error);
      }
    });
  }

  public subscribeToWithdrawnVaraEvent(
    callback: (data: { amount: number | string | bigint }) => void | Promise<void>,
  ): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) return;
      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Service' && getFnNamePrefix(payload) === 'WithdrawnVara') {
        void Promise.resolve(callback(
          this._program.registry.createType('(String, String, WithdrawnVara)', message.payload)[2].toJSON() as { amount: number | string | bigint }
        )).catch(console.error);
      }
    });
  }

  public subscribeToLoanTakenEvent(
    callback: (data: { amount: number | string | bigint }) => void | Promise<void>,
  ): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) return;
      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Service' && getFnNamePrefix(payload) === 'LoanTaken') {
        void Promise.resolve(callback(
          this._program.registry.createType('(String, String, LoanTaken)', message.payload)[2].toJSON() as { amount: number | string | bigint }
        )).catch(console.error);
      }
    });
  }

  public subscribeToLoanPayedEvent(
    callback: (data: { amount: number | string | bigint }) => void | Promise<void>,
  ): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) return;
      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Service' && getFnNamePrefix(payload) === 'LoanPayed') {
        void Promise.resolve(callback(
          this._program.registry.createType('(String, String, LoanPayed)', message.payload)[2].toJSON() as { amount: number | string | bigint }
        )).catch(console.error);
      }
    });
  }
}

export class Session {
  constructor(private _program: Program) {}

  public createSession(signature_data: SignatureData, signature: `0x${string}` | null): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['Session', 'CreateSession', signature_data, signature],
      '(String, String, SignatureData, Option<Vec<u8>>)',
      'Null',
      this._program.programId,
    );
  }

  public deleteSessionFromAccount(): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['Session', 'DeleteSessionFromAccount'],
      '(String, String)',
      'Null',
      this._program.programId,
    );
  }

  public deleteSessionFromProgram(session_for_account: ActorId): TransactionBuilder<null> {
    if (!this._program.programId) throw new Error('Program ID is not set');
    return new TransactionBuilder<null>(
      this._program.api,
      this._program.registry,
      'send_message',
      ['Session', 'DeleteSessionFromProgram', session_for_account],
      '(String, String, [u8;32])',
      'Null',
      this._program.programId,
    );
  }

  public async sessionForTheAccount(
    account: ActorId,
    originAddress?: string,
    value?: number | string | bigint,
    atBlock?: `0x${string}`,
  ): Promise<SessionData | null> {
    const payload = this._program.registry
      .createType('(String, String, [u8;32])', ['Session', 'SessionForTheAccount', account])
      .toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, Option<SessionData>)', reply.payload);
    return result[2].toJSON() as SessionData | null;
  }

  public async sessions(
    originAddress?: string,
    value?: number | string | bigint,
    atBlock?: `0x${string}`,
  ): Promise<Array<[ActorId, SessionData]>> {
    const payload = this._program.registry.createType('(String, String)', ['Session', 'Sessions']).toHex();
    const reply = await this._program.api.message.calculateReply({
      destination: this._program.programId,
      origin: originAddress ? decodeAddress(originAddress) : ZERO_ADDRESS,
      payload,
      value: value || 0,
      gasLimit: this._program.api.blockGasLimit.toBigInt(),
      at: atBlock,
    });
    if (!reply.code.isSuccess) throw new Error(this._program.registry.createType('String', reply.payload).toString());
    const result = this._program.registry.createType('(String, String, Vec<([u8;32], SessionData)>)', reply.payload);
    return result[2].toJSON() as Array<[ActorId, SessionData]>;
  }

  public subscribeToSessionCreatedEvent(callback: (data: null) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) return;
      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Session' && getFnNamePrefix(payload) === 'SessionCreated') {
        void Promise.resolve(callback(null)).catch(console.error);
      }
    });
  }

  public subscribeToSessionDeletedEvent(callback: (data: null) => void | Promise<void>): Promise<() => void> {
    return this._program.api.gearEvents.subscribeToGearEvent('UserMessageSent', ({ data: { message } }) => {
      if (!message.source.eq(this._program.programId) || !message.destination.eq(ZERO_ADDRESS)) return;
      const payload = message.payload.toHex();
      if (getServiceNamePrefix(payload) === 'Session' && getFnNamePrefix(payload) === 'SessionDeleted') {
        void Promise.resolve(callback(null)).catch(console.error);
      }
    });
  }
}
