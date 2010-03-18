desc "Test"
task :test do
  Dir['./test/*_test.js'].each do |test_file|
    `node #{test_file}`
  end
end