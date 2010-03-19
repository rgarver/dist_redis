desc "Test"
task :test do
  system("node test/test_helper.js #{Dir['./test/*_test.js'].map{|n| File.expand_path(n).gsub(/.js$/, '')}.join(" ")}")
end