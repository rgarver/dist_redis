/*process.mixin(GLOBAL, require('../vendor/ntest/ntest'));*/
require(__dirname + '/../vendor/lib/underscore')
require(__dirname + '/../vendor/ntest/ntest')
_(process.argv).chain().rest(2).each(function(f){
	require(f)
})