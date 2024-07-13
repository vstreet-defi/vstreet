#![no_std]

use gstd::{ActorId, collections::BTreeMap, debug, exec, msg, prelude::*};

use io::{BondEvent, BondAction, FTAction, FTEvent, Error, BondHolder, InitBond};

#[derive(Debug, Clone, Default, Encode)]
struct Bond {
    pub owner: ActorId,
    pub stablecoin_address: ActorId,
    pub bonds_emmited: u128,
    pub total_deposited: u128,
    pub bond_holders: BTreeMap<ActorId, BondHolder>,
    pub price: u128,
}

const DECIMALS_FACTOR: u128 = 10_u128.pow(6);

static mut BOND: Option<Bond> = None;


#[no_mangle]
extern fn init() {

let config: InitBond = msg::load().expect("Unable to decode InitConfig");

let bond = Bond {
    owner: msg::source(),
    stablecoin_address: config.stablecoin_address,
    price: config.price,
    ..Default::default()
};

unsafe {BOND = Some(bond) };

}

#[gstd::async_main]
async fn main() {
    let mut bond = unsafe { BOND.as_mut().expect("Bond not initialized") };

    let action: BondAction = msg::load().expect("Unable to decode BondAction");
    let msg_source = msg::source();

    let result = match action {
        BondAction::BuyBond(amount) => bond.buy_bond( msg_source, amount).await,
        // BondAction::LiberatePtokens(amount) => liberate_ptokens(&mut bond, amount).await,
    };

    msg::reply(result,0).expect("Unable to send BondEvent");

}

#[no_mangle]
extern fn state() {
    let mut bond = unsafe { BOND.take().expect("Unexpected error in taking state") };
   
    msg::reply::<Bond>(bond.clone(), 0)
        .expect("Failed to encode or reply with `LiquidityPool` from `state()`");
    unsafe { BOND = Some(bond) };
}

impl Bond {
    async fn buy_bond(&mut self, user: ActorId, amount_in_stablecoin: u128) -> Result<BondEvent, Error> {
        // if amount_in_stablecoin == 0 {
        //     return BondEvent::Err(Error::ZeroAmount);
        // }

        let bond_holder = self.bond_holders.entry(user).or_insert(BondHolder {
             p_balance: 0,
             emmited: false,
        });

        //crear logica para comprar bonos
        // if bond_holder.emmited {
        //     return BondEvent::Err(Error::AlreadyEmmited);
        // }
        bond_holder.p_balance = amount_in_stablecoin / self.price;


        

        let token_address = self.stablecoin_address;
        let result = self.transfer_tokens_to_contract(&token_address, amount_in_stablecoin).await?;
        msg::send(user, result, 0).expect("Msg failed");
        Ok(BondEvent::BondBought(amount_in_stablecoin))

    }

    async fn transfer_tokens_to_contract(
        &self,
        token_address: &ActorId,
        amount_in_stablecoin: u128,
    ) -> Result<(), Error> {
        let payload = FTAction::Transfer { from: msg::source(), to: exec::program_id(), amount: amount_in_stablecoin };
        let future = msg::send_for_reply_as(*token_address, payload, 0, 0)
            .map_err(|_| Error::TransferFailed)?;

        let result = future.await.map_err(|_| Error::TransferFailed)?;

        match result {
            FTEvent::Err => Err(Error::TransferFailed),
            _ => Ok(()),
        }
    }
}



   