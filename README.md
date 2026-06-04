notes
- all commands are done on cmd
- must be cd'd into C:/../../../quantum_ledger
- "-" = verbal step and "*" = terminal command.

prerequisites
- python 3.11 (best)
- two powershell tabs
- other versions of 3.1x are fine as well.

step 1: virtual environment and dependencies
* python -m venv .venv
* .venv\Scripts\activate
- confirm a (env) next to your C:/Users/...
* pip install -r requirements.txt
- venvs prevent dependency clashes on a global level. they are discardable which is great too.

step 2: running the backend
* uvicorn backend.main:app --reload --port 8000
- this doesn't really open anything but it "switches on" the backend and FastAPI.

step 3: running the frontend
- open a second cmd tab
- confirm a (env) next to your C:/Users/...
* python -m http.server 5500 
* navigate to port 5500 through the browser or click the link below.
- http://localhost:5500

step 4: cleanup
- ctrl c on both cmd tabs. do not delete them ye.
* deactivate
- confirm that the (env) signature is gone.
* you are now free to delete the tabs.

