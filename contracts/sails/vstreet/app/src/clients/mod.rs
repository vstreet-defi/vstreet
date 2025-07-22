pub mod extended_vft_client;

use extended_vft_client::Vft;
use sails_rs::gstd::calls::GStdRemoting;

// Define a concrete VftClient type
pub type VftClient = Vft<sails_rs::gstd::calls::GStdRemoting>;

impl Default for VftClient {
    fn default() -> Self {
        Vft::new(sails_rs::gstd::calls::GStdRemoting)
    }
}
