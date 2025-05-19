import logging
import structlog
import os
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_logger(name):
    """Get a configured logger instance"""
    # Configure structlog
    structlog.configure(
        processors=[
            structlog.stdlib.add_log_level,
            structlog.stdlib.add_logger_name,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.JSONRenderer()
        ],
        wrapper_class=structlog.stdlib.BoundLogger,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True
    )

    # Create logger
    logger = structlog.get_logger(name)

    # Add Sentry handler if configured
    sentry_dsn = os.getenv('SENTRY_DSN')
    if sentry_dsn:
        import sentry_sdk
        from sentry_sdk.integrations.logging import LoggingIntegration
        
        sentry_logging = LoggingIntegration(
            level=logging.INFO,
            event_level=logging.ERROR
        )
        
        sentry_sdk.init(
            dsn=sentry_dsn,
            integrations=[sentry_logging],
            traces_sample_rate=1.0
        )

    return logger

def setup_file_logging():
    """Set up file logging"""
    log_dir = os.getenv('LOG_DIR', 'logs')
    os.makedirs(log_dir, exist_ok=True)
    
    # Create handlers
    file_handler = logging.FileHandler(
        os.path.join(log_dir, f"app_{datetime.now().strftime('%Y%m%d')}.log"),
        encoding='utf-8'
    )
    
    console_handler = logging.StreamHandler()
    
    # Create formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Set formatter for handlers
    file_handler.setFormatter(formatter)
    console_handler.setFormatter(formatter)
    
    # Add handlers to root logger
    root_logger = logging.getLogger()
    root_logger.addHandler(file_handler)
    root_logger.addHandler(console_handler)
    
    # Set log level
    log_level = os.getenv('LOG_LEVEL', 'INFO').upper()
    root_logger.setLevel(log_level)

    return root_logger

def setup_monitoring():
    """Set up monitoring configuration"""
    # Set up file logging
    root_logger = setup_file_logging()
    
    # Get configured logger
    logger = get_logger('monitoring')
    
    # Log monitoring setup
    logger.info(
        "Monitoring setup",
        log_level=root_logger.getEffectiveLevel(),
        log_dir=os.getenv('LOG_DIR', 'logs'),
        sentry_enabled=bool(os.getenv('SENTRY_DSN'))
    )
    
    return logger

# Initialize monitoring
logger = setup_monitoring()
