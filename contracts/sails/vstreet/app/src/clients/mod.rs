pub mod extended_vft_client;

use extended_vft_client::Vft;
use sails_rs::calls::Remoting;

// Define a concrete VftClient type
pub type VftClient = Vft<sails_rs::calls::ProgramRemoting>;

impl Default for VftClient {
    fn default() -> Self {
        Vft::new(sails_rs::calls::ProgramRemoting::default())
    }
}
