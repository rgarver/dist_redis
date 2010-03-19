desc "Test"
task :test do
  Dir['./test/*_test.js'].each do |test_file|
    system("node #{test_file}")
  end
end