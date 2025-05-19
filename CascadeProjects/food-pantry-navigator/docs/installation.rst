Installation
============

Prerequisites
-------------

Before installing the Food Pantry Navigator, ensure you have the following prerequisites installed:

* Python 3.9 or higher
* PostgreSQL 12 or higher
* Git
* Node.js (for frontend development)

System Requirements
-------------------

* Minimum 4GB RAM
* Minimum 2GB free disk space
* Internet connection for API access

Installation Steps
------------------

1. Clone the repository:

.. code-block:: bash

   git clone https://github.com/yourusername/food-pantry-navigator.git
   cd food-pantry-navigator

2. Create and activate virtual environment:

.. code-block:: bash

   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate

3. Install dependencies:

.. code-block:: bash

   pip install -r requirements.txt

4. Set up environment variables:

Create a `.env` file in the project root directory with the following variables:

.. code-block:: text

   DATABASE_URL=postgresql://user:password@localhost:5432/social_services
   OPENWEATHERMAP_API_KEY=your_api_key_here
   MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
   GEOCODING_API_KEY=your_geocoding_key_here
   LOG_LEVEL=DEBUG
   CACHE_DIR=./cache

5. Initialize the database:

.. code-block:: bash

   python setup_database.py

6. Run the application:

.. code-block:: bash

   streamlit run app.py

Development Setup
----------------

For development purposes, you'll need to:

1. Install development dependencies:

.. code-block:: bash

   pip install -r requirements-dev.txt

2. Set up pre-commit hooks:

.. code-block:: bash

   pre-commit install

3. Run development server with hot reload:

.. code-block:: bash

   streamlit run app.py --server.port 8501 --server.address 0.0.0.0
