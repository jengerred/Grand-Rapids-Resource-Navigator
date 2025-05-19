import os
import subprocess
import json
from typing import Dict, List, Optional
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class SecurityScanner:
    def __init__(self):
        """Initialize security scanner"""
        # Security scan configuration
        self.scan_config = {
            'sast': {
                'enabled': os.getenv('ENABLE_SAST', 'true').lower() == 'true',
                'tools': ['bandit', 'pylint'],
                'excludes': ['tests', 'docs', 'venv']
            },
            'dependency_check': {
                'enabled': os.getenv('ENABLE_DEPENDENCY_CHECK', 'true').lower() == 'true',
                'tools': ['snyk', 'dependency-check'],
                'excludes': ['dev-dependencies']
            },
            'secret_scan': {
                'enabled': os.getenv('ENABLE_SECRET_SCAN', 'true').lower() == 'true',
                'tools': ['trufflehog', 'git-secrets'],
                'excludes': ['.git', '.env']
            },
            'network_scan': {
                'enabled': os.getenv('ENABLE_NETWORK_SCAN', 'true').lower() == 'true',
                'tools': ['nmap', 'masscan'],
                'excludes': ['localhost', '127.0.0.1']
            }
        }
        
        # Set up logger
        self.logger = logging.getLogger(__name__)

    def run_sast_scan(self) -> Dict:
        """Run Static Application Security Testing"""
        results = {}
        
        if not self.scan_config['sast']['enabled']:
            self.logger.info("SAST scanning disabled")
            return results
            
        for tool in self.scan_config['sast']['tools']:
            try:
                if tool == 'bandit':
                    result = subprocess.run(
                        ['bandit', '-r', '.', '-f', 'json'],
                        capture_output=True,
                        text=True
                    )
                    results['bandit'] = json.loads(result.stdout)
                    
                elif tool == 'pylint':
                    result = subprocess.run(
                        ['pylint', '--output-format=json', '.'],
                        capture_output=True,
                        text=True
                    )
                    results['pylint'] = json.loads(result.stdout)
                    
                self.logger.info(
                    "SAST scan completed",
                    tool=tool,
                    issues_found=len(results.get(tool, {}).get('results', []))
                )
                
            except Exception as e:
                self.logger.error(
                    "Error running SAST scan",
                    tool=tool,
                    error=str(e)
                )
                
        return results

    def run_dependency_check(self) -> Dict:
        """Run dependency security checks"""
        results = {}
        
        if not self.scan_config['dependency_check']['enabled']:
            self.logger.info("Dependency checking disabled")
            return results
            
        for tool in self.scan_config['dependency_check']['tools']:
            try:
                if tool == 'snyk':
                    result = subprocess.run(
                        ['snyk', 'test', '--json'],
                        capture_output=True,
                        text=True
                    )
                    results['snyk'] = json.loads(result.stdout)
                    
                elif tool == 'dependency-check':
                    result = subprocess.run(
                        ['mvn', 'org.owasp:dependency-check-maven:check'],
                        capture_output=True,
                        text=True
                    )
                    results['dependency-check'] = {
                        'output': result.stdout,
                        'exit_code': result.returncode
                    }
                    
                self.logger.info(
                    "Dependency check completed",
                    tool=tool,
                    issues_found=len(results.get(tool, {}).get('vulnerabilities', []))
                )
                
            except Exception as e:
                self.logger.error(
                    "Error running dependency check",
                    tool=tool,
                    error=str(e)
                )
                
        return results

    def run_secret_scan(self) -> Dict:
        """Scan for secrets in codebase"""
        results = {}
        
        if not self.scan_config['secret_scan']['enabled']:
            self.logger.info("Secret scanning disabled")
            return results
            
        for tool in self.scan_config['secret_scan']['tools']:
            try:
                if tool == 'trufflehog':
                    result = subprocess.run(
                        ['trufflehog', '--regex', '--entropy=False', '.'],
                        capture_output=True,
                        text=True
                    )
                    results['trufflehog'] = {
                        'output': result.stdout,
                        'exit_code': result.returncode
                    }
                    
                elif tool == 'git-secrets':
                    result = subprocess.run(
                        ['git', 'secrets', '--scan'],
                        capture_output=True,
                        text=True
                    )
                    results['git-secrets'] = {
                        'output': result.stdout,
                        'exit_code': result.returncode
                    }
                    
                self.logger.info(
                    "Secret scan completed",
                    tool=tool,
                    issues_found=len(results.get(tool, {}).get('secrets', []))
                )
                
            except Exception as e:
                self.logger.error(
                    "Error running secret scan",
                    tool=tool,
                    error=str(e)
                )
                
        return results

    def run_network_scan(self) -> Dict:
        """Scan network for vulnerabilities"""
        results = {}
        
        if not self.scan_config['network_scan']['enabled']:
            self.logger.info("Network scanning disabled")
            return results
            
        for tool in self.scan_config['network_scan']['tools']:
            try:
                if tool == 'nmap':
                    result = subprocess.run(
                        ['nmap', '-sV', '-O', os.getenv('TARGET_HOST', 'localhost')],
                        capture_output=True,
                        text=True
                    )
                    results['nmap'] = {
                        'output': result.stdout,
                        'exit_code': result.returncode
                    }
                    
                elif tool == 'masscan':
                    result = subprocess.run(
                        ['masscan', '-p1-65535', os.getenv('TARGET_HOST', 'localhost')],
                        capture_output=True,
                        text=True
                    )
                    results['masscan'] = {
                        'output': result.stdout,
                        'exit_code': result.returncode
                    }
                    
                self.logger.info(
                    "Network scan completed",
                    tool=tool,
                    ports_found=len(results.get(tool, {}).get('ports', []))
                )
                
            except Exception as e:
                self.logger.error(
                    "Error running network scan",
                    tool=tool,
                    error=str(e)
                )
                
        return results

    def generate_report(self, scan_results: Dict) -> str:
        """Generate comprehensive security report"""
        try:
            report = {
                'timestamp': datetime.now().isoformat(),
                'scan_results': scan_results,
                'summary': {}
            }
            
            # Calculate summary statistics
            for scan_type, results in scan_results.items():
                total_issues = 0
                for tool, tool_results in results.items():
                    issues = len(tool_results.get('results', [])) + \
                           len(tool_results.get('vulnerabilities', [])) + \
                           len(tool_results.get('secrets', [])) + \
                           len(tool_results.get('ports', []))
                    total_issues += issues
                    
                report['summary'][scan_type] = {
                    'total_issues': total_issues,
                    'status': 'PASS' if total_issues == 0 else 'FAIL'
                }
            
            # Save report
            report_file = os.getenv('SECURITY_REPORT_FILE', 'security_report.json')
            with open(report_file, 'w') as f:
                json.dump(report, f, indent=2)
            
            self.logger.info(
                "Security report generated",
                report_file=report_file,
                summary=report['summary']
            )
            
            return report_file
            
        except Exception as e:
            self.logger.error(
                "Error generating security report",
                error=str(e)
            )
            return ""

    def run_full_scan(self) -> Dict:
        """Run all security scans"""
        results = {}
        
        # Run all scans
        results['sast'] = self.run_sast_scan()
        results['dependency_check'] = self.run_dependency_check()
        results['secret_scan'] = self.run_secret_scan()
        results['network_scan'] = self.run_network_scan()
        
        # Generate report
        report_file = self.generate_report(results)
        
        return {
            'scan_results': results,
            'report_file': report_file
        }

if __name__ == "__main__":
    # Example usage
    scanner = SecurityScanner()
    
    # Run full security scan
    scan_results = scanner.run_full_scan()
    
    # Print results
    print(f"Security scan completed. Report saved to: {scan_results['report_file']}")
