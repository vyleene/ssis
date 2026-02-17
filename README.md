# Simple Student Information System 🎓

A sleek, CSV-backed desktop app to manage Students, Programs, and Colleges with fast, searchable tables.

## At a Glance ✨

Simple Student Information System is a lightweight Neutralino app with a clean Bootstrap UI and DataTables-powered grids. It keeps data in local CSV files while supporting full CRUD for three core directories: Students, Programs, and Colleges.

## Highlights ✅

- Three directories with dedicated tables
- Full create, read, update, delete flows
- Local CSV storage with schema validation
- Fast search, sort, and pagination via DataTables
- Lightweight Neutralino runtime for desktop delivery

## Data Model 🧾

- Students: ID, First Name, Last Name, Program Code, Year, Gender
- Programs: Code, Name, College
- Colleges: Code, Name

## Tech Stack 🧰

- Neutralino
- Bootstrap
- jQuery
- DataTables

## Project Layout 🗂️

```
src/
	index.html
	css/
	js/
		core/
			csv.js
			students.js
			programs.js
			colleges.js
csv/
	students.csv
	programs.csv
	colleges.csv
```

## Notes 📌

- CSV headers are validated on load to prevent schema mismatches.
- Empty datasets are handled gracefully in the UI.
