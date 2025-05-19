import os
import time
import logging
from typing import Dict, List, Optional
import locust
from locust import HttpUser, task, between
from locust.env import Environment
from locust.stats import stats_printer, stats_history
from locust.log import setup_logging
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

# Set up logging
setup_logging("INFO", None)

class PerformanceTester:
    def __init__(self):
        """Initialize performance tester"""
        # Performance test configuration
        self.test_config = {
            'api': {
                'enabled': os.getenv('ENABLE_API_TESTS', 'true').lower() == 'true',
                'endpoints': json.loads(os.getenv('API_TEST_ENDPOINTS', '[]')),
                'concurrent_users': int(os.getenv('API_TEST_USERS', 100)),
                'spawn_rate': int(os.getenv('API_TEST_SPAWN_RATE', 10)),
                'duration_seconds': int(os.getenv('API_TEST_DURATION', 300))
            },
            'load': {
                'enabled': os.getenv('ENABLE_LOAD_TESTS', 'true').lower() == 'true',
                'max_requests': int(os.getenv('LOAD_TEST_REQUESTS', 10000)),
                'ramp_up_time': int(os.getenv('LOAD_TEST_RAMP_UP', 60)),
                'target_rps': int(os.getenv('LOAD_TEST_RPS', 100))
            },
            'stress': {
                'enabled': os.getenv('ENABLE_STRESS_TESTS', 'true').lower() == 'true',
                'max_users': int(os.getenv('STRESS_TEST_MAX_USERS', 500)),
                'duration': int(os.getenv('STRESS_TEST_DURATION', 600)),
                'step_load': int(os.getenv('STRESS_TEST_STEP_LOAD', 50))
            },
            'database': {
                'enabled': os.getenv('ENABLE_DATABASE_TESTS', 'true').lower() == 'true',
                'query_sets': json.loads(os.getenv('DATABASE_TEST_QUERIES', '[]')),
                'concurrent_queries': int(os.getenv('DATABASE_TEST_QUERIES', 10)),
                'duration': int(os.getenv('DATABASE_TEST_DURATION', 300))
            }
        }
        
        # Set up logger
        self.logger = logging.getLogger(__name__)

    def create_test_user(self, user_class: type):
        """Create a test user class"""
        class TestUser(HttpUser):
            wait_time = between(1, 5)
            
            @task(1)
            def test_api(self):
                for endpoint in self.test_config['api']['endpoints']:
                    with self.client.get(endpoint['path'], 
                                       name=endpoint['name'],
                                       catch_response=True) as response:
                        if response.status_code != 200:
                            response.failure(f"Got wrong response code {response.status_code}")
                            
            @task(2)
            def test_route_optimization(self):
                with self.client.post(
                    '/api/route/optimization',
                    json={
                        'start_location': '42.9634,-85.6681',
                        'end_location': '42.9646,-85.6678',
                        'service_types': ['food_pantry', 'shelter']
                    },
                    catch_response=True
                ) as response:
                    if response.status_code != 200:
                        response.failure(f"Route optimization failed: {response.status_code}")
                        
            @task(3)
            def test_service_search(self):
                with self.client.get(
                    '/api/services/search?q=food+pantry',
                    catch_response=True
                ) as response:
                    if response.status_code != 200:
                        response.failure(f"Service search failed: {response.status_code}")
        
        return TestUser

    def run_load_test(self) -> Dict:
        """Run load test"""
        if not self.test_config['load']['enabled']:
            self.logger.info("Load testing disabled")
            return {}
            
        try:
            # Create test environment
            env = Environment(user_classes=[self.create_test_user(HttpUser)])
            env.create_local_runner()
            
            # Start a greenlet that periodically outputs the current stats
            stats_printer(env)
            
            # Start the test
            env.runner.start(
                self.test_config['load']['target_rps'],
                spawn_rate=self.test_config['load']['spawn_rate']
            )
            
            # Run for duration
            time.sleep(self.test_config['load']['duration_seconds'])
            
            # Stop the test
            env.runner.quit()
            
            # Get results
            results = {
                'requests': env.stats.total.num_requests,
                'failures': env.stats.total.num_failures,
                'avg_response_time': env.stats.total.avg_response_time,
                'max_response_time': env.stats.total.max_response_time,
                'min_response_time': env.stats.total.min_response_time,
                'requests_per_second': env.stats.total.total_rps
            }
            
            self.logger.info(
                "Load test completed",
                results=results
            )
            
            return results
            
        except Exception as e:
            self.logger.error(
                "Error running load test",
                error=str(e)
            )
            return {}

    def run_stress_test(self) -> Dict:
        """Run stress test"""
        if not self.test_config['stress']['enabled']:
            self.logger.info("Stress testing disabled")
            return {}
            
        try:
            results = []
            current_users = 0
            step = self.test_config['stress']['step_load']
            
            while current_users <= self.test_config['stress']['max_users']:
                # Run test with current user count
                env = Environment(user_classes=[self.create_test_user(HttpUser)])
                env.create_local_runner()
                
                env.runner.start(current_users, spawn_rate=step)
                time.sleep(self.test_config['stress']['duration'])
                env.runner.quit()
                
                # Record results
                results.append({
                    'users': current_users,
                    'requests': env.stats.total.num_requests,
                    'failures': env.stats.total.num_failures,
                    'avg_response_time': env.stats.total.avg_response_time,
                    'max_response_time': env.stats.total.max_response_time,
                    'min_response_time': env.stats.total.min_response_time,
                    'requests_per_second': env.stats.total.total_rps
                })
                
                current_users += step
                
            self.logger.info(
                "Stress test completed",
                final_results=results[-1]
            )
            
            return results
            
        except Exception as e:
            self.logger.error(
                "Error running stress test",
                error=str(e)
            )
            return []

    def run_database_test(self) -> Dict:
        """Run database performance test"""
        if not self.test_config['database']['enabled']:
            self.logger.info("Database testing disabled")
            return {}
            
        try:
            results = []
            
            for query_set in self.test_config['database']['query_sets']:
                # Execute queries concurrently
                start_time = time.time()
                for _ in range(self.test_config['database']['concurrent_queries']):
                    # Simulate query execution
                    time.sleep(0.1)  # Replace with actual query execution
                
                end_time = time.time()
                
                results.append({
                    'query_set': query_set['name'],
                    'execution_time': end_time - start_time,
                    'queries_per_second': self.test_config['database']['concurrent_queries'] / (end_time - start_time)
                })
                
            self.logger.info(
                "Database test completed",
                results=results
            )
            
            return results
            
        except Exception as e:
            self.logger.error(
                "Error running database test",
                error=str(e)
            )
            return []

    def generate_performance_report(self, test_results: Dict) -> str:
        """Generate performance test report"""
        try:
            report = {
                'timestamp': datetime.now().isoformat(),
                'test_results': test_results,
                'summary': {
                    'load_test': {
                        'avg_response_time': test_results.get('load_test', {}).get('avg_response_time', 0),
                        'requests_per_second': test_results.get('load_test', {}).get('requests_per_second', 0),
                        'failure_rate': test_results.get('load_test', {}).get('failures', 0) / \
                                      (test_results.get('load_test', {}).get('requests', 0) or 1)
                    },
                    'stress_test': {
                        'max_users': test_results.get('stress_test', [{}])[-1].get('users', 0),
                        'max_requests_per_second': test_results.get('stress_test', [{}])[-1].get('requests_per_second', 0),
                        'max_response_time': test_results.get('stress_test', [{}])[-1].get('max_response_time', 0)
                    },
                    'database_test': {
                        'avg_execution_time': sum(
                            r.get('execution_time', 0) for r in test_results.get('database_test', [])
                        ) / len(test_results.get('database_test', []))
                    }
                }
            }
            
            # Save report
            report_file = os.getenv('PERFORMANCE_REPORT_FILE', 'performance_report.json')
            with open(report_file, 'w') as f:
                json.dump(report, f, indent=2)
            
            self.logger.info(
                "Performance report generated",
                report_file=report_file,
                summary=report['summary']
            )
            
            return report_file
            
        except Exception as e:
            self.logger.error(
                "Error generating performance report",
                error=str(e)
            )
            return ""

    def run_full_test(self) -> Dict:
        """Run all performance tests"""
        results = {}
        
        # Run all tests
        results['load_test'] = self.run_load_test()
        results['stress_test'] = self.run_stress_test()
        results['database_test'] = self.run_database_test()
        
        # Generate report
        report_file = self.generate_performance_report(results)
        
        return {
            'test_results': results,
            'report_file': report_file
        }

if __name__ == "__main__":
    # Example usage
    tester = PerformanceTester()
    
    # Run full performance test
    test_results = tester.run_full_test()
    
    # Print results
    print(f"Performance test completed. Report saved to: {test_results['report_file']}")
