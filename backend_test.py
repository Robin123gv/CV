import requests
import sys
import json
from datetime import datetime

class ResumeAPITester:
    def __init__(self, base_url="https://profile-forge-52.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}" if not endpoint.startswith('http') else endpoint
        request_headers = {'Content-Type': 'application/json'}
        if self.token:
            request_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            request_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        print(f"   Method: {method}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=request_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=request_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=request_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=request_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                self.test_results.append({"test": name, "status": "PASSED", "expected": expected_status, "actual": response.status_code})
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                self.test_results.append({"test": name, "status": "FAILED", "expected": expected_status, "actual": response.status_code, "error": response.text[:200]})

            return success, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.test_results.append({"test": name, "status": "ERROR", "expected": expected_status, "actual": "Exception", "error": str(e)})
            return False, {}

    def test_health_check(self):
        """Test API health check"""
        return self.run_test("API Health Check", "GET", "", 200)

    def test_admin_login(self, password="admin123"):
        """Test admin login and get token"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "admin/login",
            200,
            data={"password": password}
        )
        if success and 'token' in response:
            self.token = response['token']
            print(f"   Token acquired: {self.token[:20]}...")
            return True
        return False

    def test_invalid_login(self):
        """Test login with invalid credentials"""
        return self.run_test(
            "Invalid Login",
            "POST",
            "admin/login",
            401,
            data={"password": "wrongpassword"}
        )[0]

    def test_get_profile(self):
        """Get profile (public endpoint)"""
        return self.run_test("Get Profile", "GET", "profile", 200)

    def test_update_profile(self):
        """Update profile (admin endpoint)"""
        profile_data = {
            "name": "Test User",
            "title": "Software Engineer",
            "about": "This is a test profile updated via API testing."
        }
        return self.run_test("Update Profile", "PUT", "admin/profile", 200, data=profile_data)

    def test_get_experiences(self):
        """Get experiences (public endpoint)"""
        return self.run_test("Get Experiences", "GET", "experience", 200)

    def test_create_experience(self):
        """Create new experience"""
        exp_data = {
            "company": "Test Company",
            "position": "Test Engineer",
            "start_date": "Jan 2020",
            "end_date": "Dec 2023",
            "is_current": False,
            "description": "Test experience created via API",
            "location": "Remote"
        }
        success, response = self.run_test("Create Experience", "POST", "admin/experience", 200, data=exp_data)
        if success and 'id' in response:
            return response['id']
        return None

    def test_get_projects(self):
        """Get projects (public endpoint)"""
        return self.run_test("Get Projects", "GET", "projects", 200)

    def test_create_project(self):
        """Create new project"""
        project_data = {
            "title": "Test Project",
            "description": "A test project created via API",
            "tech_stack": ["React", "Node.js", "MongoDB"]
        }
        success, response = self.run_test("Create Project", "POST", "admin/projects", 200, data=project_data)
        if success and 'id' in response:
            return response['id']
        return None

    def test_get_skills(self):
        """Get skills (public endpoint)"""
        return self.run_test("Get Skills", "GET", "skills", 200)

    def test_create_skill(self):
        """Create new skill category"""
        skill_data = {
            "category": "Programming",
            "skills": ["JavaScript", "Python", "React"]
        }
        success, response = self.run_test("Create Skill", "POST", "admin/skills", 200, data=skill_data)
        if success and 'id' in response:
            return response['id']
        return None

    def test_get_contact(self):
        """Get contact info (public endpoint)"""
        return self.run_test("Get Contact", "GET", "contact", 200)

    def test_update_contact(self):
        """Update contact info"""
        contact_data = {
            "email": "test@example.com",
            "phone": "+1 (555) 123-4567",
            "location": "San Francisco, CA"
        }
        return self.run_test("Update Contact", "PUT", "admin/contact", 200, data=contact_data)

    def test_get_full_resume(self):
        """Get complete resume data"""
        return self.run_test("Get Full Resume", "GET", "resume", 200)

    def test_unauthorized_access(self):
        """Test access without token"""
        old_token = self.token
        self.token = None
        success = self.run_test("Unauthorized Profile Update", "PUT", "admin/profile", 401, data={"name": "Test"})[0]
        self.token = old_token
        return success

def main():
    print("🚀 Starting Resume API Testing...")
    print("=" * 50)
    
    # Setup
    tester = ResumeAPITester()
    
    # Basic connectivity tests
    print("\n📡 CONNECTIVITY TESTS")
    print("-" * 30)
    
    if not tester.test_health_check():
        print("❌ API health check failed - stopping tests")
        return 1

    # Authentication tests
    print("\n🔐 AUTHENTICATION TESTS")
    print("-" * 30)
    
    if not tester.test_invalid_login():
        print("❌ Invalid login test failed")
    
    if not tester.test_admin_login():
        print("❌ Admin login failed - stopping authenticated tests")
        return 1

    if not tester.test_unauthorized_access():
        print("❌ Unauthorized access test failed")

    # Public endpoints tests
    print("\n🌐 PUBLIC ENDPOINTS TESTS")
    print("-" * 30)
    
    tester.test_get_profile()
    tester.test_get_experiences()
    tester.test_get_projects()
    tester.test_get_skills()
    tester.test_get_contact()
    tester.test_get_full_resume()

    # Admin endpoints tests
    print("\n🔧 ADMIN CRUD TESTS")
    print("-" * 30)
    
    tester.test_update_profile()
    tester.test_update_contact()
    
    exp_id = tester.test_create_experience()
    project_id = tester.test_create_project()
    skill_id = tester.test_create_skill()

    # Additional CRUD operations
    if exp_id:
        print(f"✅ Experience created with ID: {exp_id}")
    
    if project_id:
        print(f"✅ Project created with ID: {project_id}")
        
    if skill_id:
        print(f"✅ Skill category created with ID: {skill_id}")

    # Print final results
    print("\n" + "=" * 50)
    print("📊 FINAL RESULTS")
    print("=" * 50)
    print(f"Tests run: {tester.tests_run}")
    print(f"Tests passed: {tester.tests_passed}")
    print(f"Tests failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    # Show failed tests
    failed_tests = [test for test in tester.test_results if test['status'] == 'FAILED']
    if failed_tests:
        print(f"\n❌ FAILED TESTS ({len(failed_tests)}):")
        for test in failed_tests:
            print(f"   - {test['test']}: Expected {test['expected']}, got {test['actual']}")
    
    error_tests = [test for test in tester.test_results if test['status'] == 'ERROR']
    if error_tests:
        print(f"\n🚫 ERROR TESTS ({len(error_tests)}):")
        for test in error_tests:
            print(f"   - {test['test']}: {test['error']}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())