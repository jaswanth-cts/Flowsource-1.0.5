resource "aws_db_parameter_group" "postgres_db_parameter_group" {
  name   = "${var.db-name}-parameter-group"
  family = "postgres16"

  parameter {
    name  = "log_connections"
    value = "1"
  }
}

resource "aws_db_subnet_group" "postgres_db_subnet_group" {
  name       = "${var.db-name}-subnet-group"
  subnet_ids = var.db_subnet_ids
}

resource "aws_db_subnet_group" "postgres_db_subnet_group_replica" {
  count = var.enable_read_replica ? 1 : 0
  
  name       = "${var.db-name}-subnet-group-replica"
  subnet_ids = var.replica_db_subnet_ids

  provider = aws.replica
}

resource "aws_db_instance" "postgres_db" {
  depends_on                 = [aws_db_subnet_group.postgres_db_subnet_group, aws_db_parameter_group.postgres_db_parameter_group]
  allocated_storage          = 100
  storage_type               = "gp3"
  engine                     = "postgres"
  engine_version             = "16.8"
  instance_class             = var.db-instance-class
  db_subnet_group_name       = aws_db_subnet_group.postgres_db_subnet_group.name
  identifier                 = var.db-identifier-name
  db_name                    = var.db-name
  username                   = var.db-user
  password                   = var.db-password
  publicly_accessible        = false
  parameter_group_name       = aws_db_parameter_group.postgres_db_parameter_group.name
  apply_immediately          = true
  vpc_security_group_ids     = var.security_group_ids
  storage_encrypted          = true # Enable encryption at rest
  auto_minor_version_upgrade = true # Enable minor version upgrades automatically
  skip_final_snapshot        = var.skip_final_snapshot
  backup_retention_period    = var.backup_retention_period
  multi_az                   = var.multi_az
  maintenance_window         = var.maintenance_window != "" ?  var.maintenance_window : null
  backup_window              = var.backup_window != "" ?  var.backup_window : null
  final_snapshot_identifier  = "${var.db-identifier-name}-final-snapshot-${md5(timestamp())}"


  # prevent the possibility of accidental data loss
  lifecycle {
    prevent_destroy = true
  }

}

resource "aws_db_instance" "postgres_db_replica" {

  count = var.enable_read_replica ? 1 : 0

  replicate_source_db         = aws_db_instance.postgres_db.arn

  storage_type               = "gp3"
  instance_class             = var.db-instance-class
  db_subnet_group_name       = aws_db_subnet_group.postgres_db_subnet_group_replica[0].name
  identifier                 = "${var.db-identifier-name}-replica"
  publicly_accessible        = false
  apply_immediately          = true
  vpc_security_group_ids     = var.replica_security_group_ids
  storage_encrypted          = true # Enable encryption at rest
  auto_minor_version_upgrade = true # Enable minor version upgrades automatically
  skip_final_snapshot        = true
  backup_retention_period    = var.backup_retention_period
  multi_az                   = var.replica-multi-az
  maintenance_window         = var.maintenance_window != "" ?  var.maintenance_window : null
  backup_window              = var.backup_window != "" ?  var.backup_window : null
  kms_key_id                 = var.replica_kms_key_arn != "" ? var.replica_kms_key_arn : null

  depends_on                 = [aws_db_subnet_group.postgres_db_subnet_group_replica, aws_db_parameter_group.postgres_db_parameter_group]

  # prevent the possibility of accidental data loss
  lifecycle {
    prevent_destroy = true
  }

  provider = aws.replica

}