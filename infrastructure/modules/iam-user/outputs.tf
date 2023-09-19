output "user_access_key" {
  value = aws_iam_access_key.service_user.id
}

output "user_secret_access_key" {
  value = aws_iam_access_key.service_user.encrypted_secret
}
