require "test_helper"

class PagesControllerTest < ActionDispatch::IntegrationTest
  test "should get rails" do
    get pages_rails_url
    assert_response :success
  end
end
