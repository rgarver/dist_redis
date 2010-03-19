# ntest

A little test framework I wrote to get a handle on this whole asynchronous
javascript thing.  I don't really know what I'm doing here, other than trying
to mold javascript to fit my tiny ruby brain.

## Installation

There's no packaging system for node.js yet, so I've just been creating symlinks
in my `~/.node_libraries` path.

    $ ln -s /path/to/ntest/lib ~/.node_libraries/ntest

## Usage

Mix the library into GLOBAL and start defining tests. Use whatever asserts
library you like.

    process.mixin(GLOBAL, require('ntest'));

    var assert = require('assert') # comes with node.js

    describe("an empty array")
      it("has zero length", function() {
        assert.equal(0, [].length);
      })

## Influences

Ryan Tomayko's test lib for bert:  
http://github.com/rtomayko/node-bertrpc/blob/master/test/test.js

Dan Webb and FreeRange's nodetest:  
http://github.com/freerange/nodetest/blob/master/nodetest.js

## Copyright

Copyright (c) 2010 rick. See LICENSE for details.
