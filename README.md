# Simple Student Information System 🎓

Manage students, programs, and colleges in a clean desktop UI with CSV-backed storage.

## Overview ✨

Simple Student Information System is a lightweight app built with Neutralino, Bootstrap, and DataTables. It provides three directories (Students, Programs, and Colleges) and supports full CRUD operations using local CSV files.

## Features ✅

- Students, Programs, and Colleges tables
- Create, read, update, and delete records
- CSV-backed data storage
- Fast, searchable tables with DataTables
- Lightweight Neutralino desktop runtime

## Data Model 🧾

- Students: ID, First Name, Last Name, Program Code, Year, Gender
- Programs: Code, Name, College
- Colleges: Code, Name

## Tech Stack 🧰

- Neutralino
- Bootstrap
- jQuery
- DataTables

## Project Structure 🗂️

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
```

## Notes 📌

- CSV headers are validated on load to prevent schema mismatches.
- Empty datasets are handled gracefully in the UI.
