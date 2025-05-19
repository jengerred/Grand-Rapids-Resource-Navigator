import os
import boto3
import logging
from datetime import datetime, timedelta
from dotenv import load_dotenv
import json
from typing import Dict, List, Optional

# Load environment variables
load_dotenv()

class BackupManager:
    def __init__(self):
        """Initialize backup manager"""
        # AWS configuration
        self.aws_region = os.getenv('AWS_REGION', 'us-east-1')
        self.s3_bucket = os.getenv('S3_BUCKET', 'food-pantry-backups')
        
        # Initialize AWS clients
        self.s3 = boto3.client('s3', region_name=self.aws_region)
        self.rds = boto3.client('rds', region_name=self.aws_region)
        
        # Backup configuration
        self.backup_config = {
            'database': {
                'enabled': os.getenv('ENABLE_DATABASE_BACKUP', 'true').lower() == 'true',
                'retention_days': int(os.getenv('DATABASE_BACKUP_RETENTION', 30)),
                'schedule': os.getenv('DATABASE_BACKUP_SCHEDULE', 'daily'),
                'bucket_prefix': 'database-backups'
            },
            'files': {
                'enabled': os.getenv('ENABLE_FILE_BACKUP', 'true').lower() == 'true',
                'retention_days': int(os.getenv('FILE_BACKUP_RETENTION', 7)),
                'schedule': os.getenv('FILE_BACKUP_SCHEDULE', 'daily'),
                'bucket_prefix': 'file-backups',
                'directories': json.loads(os.getenv('BACKUP_DIRECTORIES', '[]'))
            },
            'configuration': {
                'enabled': os.getenv('ENABLE_CONFIG_BACKUP', 'true').lower() == 'true',
                'retention_days': int(os.getenv('CONFIG_BACKUP_RETENTION', 30)),
                'schedule': os.getenv('CONFIG_BACKUP_SCHEDULE', 'daily'),
                'bucket_prefix': 'config-backups'
            }
        }
        
        # Set up logger
        self.logger = logging.getLogger(__name__)

    def _get_backup_key(self, backup_type: str, prefix: str) -> str:
        """Generate S3 key for backup"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        return f"{prefix}/{backup_type}_{timestamp}.tar.gz"

    def create_database_backup(self) -> str:
        """Create database backup"""
        if not self.backup_config['database']['enabled']:
            self.logger.info("Database backup disabled")
            return ""
            
        try:
            # Get database instance name
            db_instance = os.getenv('RDS_INSTANCE_NAME')
            if not db_instance:
                raise ValueError("RDS_INSTANCE_NAME not configured")
                
            # Create backup
            backup_id = f"{db_instance}-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
            self.rds.create_db_snapshot(
                DBSnapshotIdentifier=backup_id,
                DBInstanceIdentifier=db_instance
            )
            
            # Wait for backup to complete
            waiter = self.rds.get_waiter('db_snapshot_available')
            waiter.wait(
                DBSnapshotIdentifier=backup_id,
                WaiterConfig={
                    'Delay': 30,
                    'MaxAttempts': 20
                }
            )
            
            self.logger.info(
                "Database backup created",
                backup_id=backup_id
            )
            
            return backup_id
            
        except Exception as e:
            self.logger.error(
                "Error creating database backup",
                error=str(e)
            )
            return ""

    def create_file_backup(self) -> List[str]:
        """Create file backups"""
        if not self.backup_config['files']['enabled']:
            self.logger.info("File backup disabled")
            return []
            
        backup_keys = []
        
        try:
            for directory in self.backup_config['files']['directories']:
                if not os.path.exists(directory):
                    self.logger.warning(
                        "Backup directory does not exist",
                        directory=directory
                    )
                    continue
                    
                # Create backup archive
                backup_key = self._get_backup_key(
                    'files',
                    self.backup_config['files']['bucket_prefix']
                )
                
                # Upload to S3
                self.s3.upload_file(
                    directory,
                    self.s3_bucket,
                    backup_key
                )
                
                backup_keys.append(backup_key)
                
                self.logger.info(
                    "File backup created",
                    directory=directory,
                    backup_key=backup_key
                )
                
        except Exception as e:
            self.logger.error(
                "Error creating file backup",
                error=str(e)
            )
            
        return backup_keys

    def create_config_backup(self) -> str:
        """Create configuration backup"""
        if not self.backup_config['configuration']['enabled']:
            self.logger.info("Configuration backup disabled")
            return ""
            
        try:
            # Collect configuration files
            config_files = {
                'environment': dict(os.environ),
                'database': {
                    'host': os.getenv('DATABASE_HOST'),
                    'port': os.getenv('DATABASE_PORT'),
                    'name': os.getenv('DATABASE_NAME')
                },
                'api_keys': {
                    'openweathermap': os.getenv('OPENWEATHERMAP_API_KEY', 'REDACTED'),
                    'mapbox': os.getenv('MAPBOX_ACCESS_TOKEN', 'REDACTED')
                }
            }
            
            # Create backup key
            backup_key = self._get_backup_key(
                'config',
                self.backup_config['configuration']['bucket_prefix']
            )
            
            # Upload to S3
            self.s3.put_object(
                Bucket=self.s3_bucket,
                Key=backup_key,
                Body=json.dumps(config_files, indent=2)
            )
            
            self.logger.info(
                "Configuration backup created",
                backup_key=backup_key
            )
            
            return backup_key
            
        except Exception as e:
            self.logger.error(
                "Error creating configuration backup",
                error=str(e)
            )
            return ""

    def cleanup_old_backups(self) -> int:
        """Clean up old backups"""
        try:
            # Get all backup keys
            response = self.s3.list_objects_v2(
                Bucket=self.s3_bucket,
                Prefix=self.backup_config['files']['bucket_prefix']
            )
            
            deleted_count = 0
            
            for obj in response.get('Contents', []):
                # Get object timestamp
                last_modified = obj['LastModified']
                retention_days = self.backup_config['files']['retention_days']
                
                # Delete if older than retention period
                if datetime.now() - last_modified > timedelta(days=retention_days):
                    self.s3.delete_object(
                        Bucket=self.s3_bucket,
                        Key=obj['Key']
                    )
                    deleted_count += 1
                    
            self.logger.info(
                "Old backups cleaned",
                deleted_count=deleted_count
            )
            
            return deleted_count
            
        except Exception as e:
            self.logger.error(
                "Error cleaning up old backups",
                error=str(e)
            )
            return 0

    def restore_database_backup(self, backup_id: str) -> bool:
        """Restore database from backup"""
        try:
            # Restore DB instance from snapshot
            self.rds.restore_db_instance_from_db_snapshot(
                DBInstanceIdentifier=os.getenv('RDS_INSTANCE_NAME'),
                DBSnapshotIdentifier=backup_id
            )
            
            # Wait for restore to complete
            waiter = self.rds.get_waiter('db_instance_available')
            waiter.wait(
                DBInstanceIdentifier=os.getenv('RDS_INSTANCE_NAME'),
                WaiterConfig={
                    'Delay': 30,
                    'MaxAttempts': 20
                }
            )
            
            self.logger.info(
                "Database restored from backup",
                backup_id=backup_id
            )
            
            return True
            
        except Exception as e:
            self.logger.error(
                "Error restoring database",
                backup_id=backup_id,
                error=str(e)
            )
            return False

    def get_backup_status(self) -> Dict:
        """Get current backup status"""
        try:
            status = {
                'database': {
                    'last_backup': None,
                    'status': 'UNKNOWN'
                },
                'files': {
                    'last_backup': None,
                    'status': 'UNKNOWN'
                },
                'configuration': {
                    'last_backup': None,
                    'status': 'UNKNOWN'
                }
            }
            
            # Check database backups
            if self.backup_config['database']['enabled']:
                try:
                    response = self.rds.describe_db_snapshots(
                        DBInstanceIdentifier=os.getenv('RDS_INSTANCE_NAME')
                    )
                    if response['DBSnapshots']:
                        last_backup = response['DBSnapshots'][0]
                        status['database'] = {
                            'last_backup': last_backup['SnapshotCreateTime'].isoformat(),
                            'status': 'OK'
                        }
                except:
                    pass
            
            # Check file backups
            if self.backup_config['files']['enabled']:
                try:
                    response = self.s3.list_objects_v2(
                        Bucket=self.s3_bucket,
                        Prefix=self.backup_config['files']['bucket_prefix']
                    )
                    if response.get('Contents'):
                        last_backup = response['Contents'][0]
                        status['files'] = {
                            'last_backup': last_backup['LastModified'].isoformat(),
                            'status': 'OK'
                        }
                except:
                    pass
            
            # Check config backups
            if self.backup_config['configuration']['enabled']:
                try:
                    response = self.s3.list_objects_v2(
                        Bucket=self.s3_bucket,
                        Prefix=self.backup_config['configuration']['bucket_prefix']
                    )
                    if response.get('Contents'):
                        last_backup = response['Contents'][0]
                        status['configuration'] = {
                            'last_backup': last_backup['LastModified'].isoformat(),
                            'status': 'OK'
                        }
                except:
                    pass
            
            self.logger.info(
                "Backup status retrieved",
                status=status
            )
            
            return status
            
        except Exception as e:
            self.logger.error(
                "Error getting backup status",
                error=str(e)
            )
            return {}

if __name__ == "__main__":
    # Example usage
    backup_manager = BackupManager()
    
    # Create backups
    db_backup_id = backup_manager.create_database_backup()
    file_backup_keys = backup_manager.create_file_backup()
    config_backup_key = backup_manager.create_config_backup()
    
    # Get backup status
    status = backup_manager.get_backup_status()
    print(f"Backup status: {status}")
