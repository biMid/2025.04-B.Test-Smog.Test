PROJECT_DIR := /home/o0o/Project/2025.04-B.Test

web:
	cd $(PROJECT_DIR)/smog-web && npm run dev

back:
	cd $(PROJECT_DIR)/smog-back && . venv/bin/activate && python3 app.py

.PHONY: web back