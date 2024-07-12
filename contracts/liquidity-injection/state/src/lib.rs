#![no_std]

use gmeta::{Metadata, metawasm, Out};
use gstd::prelude::*;

use io::*;

#[cfg(feature = "binary-vendor")]
include!(concat!(env!("OUT_DIR"), "/wasm_binary.rs"));

#[metawasm]
pub mod metafns {
    pub type State = <ContractMetadata as Metadata>::State;

    pub fn state(state: State) -> Out<LiquidityPool> {
        state
    }
}