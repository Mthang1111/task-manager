#Issue: running this from app.py directly causes conflict because models.py does app import, loading another instance of app.py on top as a different module
#Specific run entry point to avoid it from loading app.py the 2nd time

from app import create_app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)