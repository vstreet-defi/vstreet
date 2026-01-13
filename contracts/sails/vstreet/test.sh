#!/bin/bash
# Quick test script that skips WASM rebuild
# Usage: ./test.sh [test_name]

if [ -z "$1" ]; then
    # Run all tests
    __GEAR_WASM_BUILDER_NO_BUILD=1 cargo test --package vstreet --test gtest
else
    # Run specific test
    __GEAR_WASM_BUILDER_NO_BUILD=1 cargo test --package vstreet --test gtest "$1"
fi
