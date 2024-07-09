
#![no_std]

use io::*;
use gmeta::{ Metadata, metawasm, Out};
use gstd::{ prelude::*};


#[cfg(feature = "binary-vendor")]
include!(concat!(env!("OUT_DIR"), "/wasm_binary.rs"));

#[metawasm]
pub mod metafns {
    pub type State = <ContractMetadata as Metadata>::State;


    // Add your State functions

    pub fn state(state: State) -> Out<IoGlobalState> {
        state
    }



}