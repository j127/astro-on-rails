# frozen_string_literal: true

# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# Create two articles
Article.find_or_create_by!(title: "First Article") do |article|
  article.body = "This is the content of the first article."
end

Article.find_or_create_by!(title: "Second Article") do |article|
  article.body = "This is the content of the second article."
end
