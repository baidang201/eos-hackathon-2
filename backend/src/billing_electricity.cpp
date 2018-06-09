//
// Created by Eenae on 09.06.2018.
//

#include <eosiolib/eosio.hpp>
#include <eosiolib/asset.hpp>
#include <eosiolib/currency.hpp>

#include <string>
#include <sstream>
#include <algorithm>
#include <iterator>

#include "billing.hpp"

using eosio::asset;
using eosio::const_mem_fun;
using eosio::indexed_by;
using std::string;
using std::istringstream;


class billing_electricity : /*public billing,*/ public eosio::contract {
public:
    billing_electricity(account_name self) :
            contract(self) {}

    // @abi action
    void bill(uint64_t device_data, account_name user2bill, string user_meta, string billing_meta) {
        // device_data is a number of measurements sent
        // billing_meta: <float: watts/hour per measurement>\t<uint: payment per kWt/hour>

        istringstream iss(billing_meta);

        float wattPerMeasurement;
        iss >> wattPerMeasurement;

        uint64_t paymentPerKWT;
        iss >> paymentPerKWT;

        eosio::print( "wattPerMeasurement = ", wattPerMeasurement, "  paymentPerKWT = ", paymentPerKWT, "\n" );
    }
};

EOSIO_ABI( billing_electricity, (bill) )


int main(int argc, char **argv) {
    billing_electricity(N("self")).bill(1U, N("foo"), string(), string("0.3125 2"));

    return 0;
}
