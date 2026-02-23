const csvPathCache = new Map();
const csvConfigs = [
    {
        tableId: 'studentsTable',
        csvPath: 'csv/students.csv',
        headerLine: 'id,firstname,lastname,programcode,year,gender',
        headers: ['id', 'firstname', 'lastname', 'programcode', 'year', 'gender'],
        columns: 6,
        tableColumns: [
            { data: 0 },
            { data: 1 },
            { data: 2 },
            { data: 3 },
            { data: 4 },
            { data: 5 },
            {
                data: null,
                orderable: false,
                searchable: false,
                className: 'text-center actions-col',
                render: (_, __, row) => renderStudentActions(row),
            },
        ],
    },
    {
        tableId: 'programsTable',
        csvPath: 'csv/programs.csv',
        headerLine: 'code,name,college',
        headers: ['code', 'name', 'college'],
        columns: 3,
        tableColumns: [
            { data: 0 },
            { data: 1 },
            { data: 2 },
            {
                data: null,
                orderable: false,
                searchable: false,
                className: 'text-center actions-col',
                render: (_, __, row) => renderProgramActions(row),
            },
        ],
        populateOptions: (records) => populateProgramOptions(records),
    },
    {
        tableId: 'collegesTable',
        csvPath: 'csv/colleges.csv',
        headerLine: 'code,name',
        headers: ['code', 'name'],
        columns: 2,
        tableColumns: [
            { data: 0 },
            { data: 1 },
            {
                data: null,
                orderable: false,
                searchable: false,
                className: 'text-center actions-col',
                render: (_, __, row) => renderCollegeActions(row),
            },
        ],
        populateOptions: (records) => populateCollegeOptions(records),
    }
];

async function ensureCsvFile(relativePath, headerLine) {
    if(csvPathCache.has(relativePath)) return csvPathCache.get(relativePath);

    const absolutePath = await Neutralino.filesystem.getAbsolutePath(relativePath);
    const normalizedPath = await Neutralino.filesystem.getNormalizedPath(absolutePath);

    try {
        const pathParts = await Neutralino.filesystem.getPathParts(normalizedPath);
        await Neutralino.filesystem.createDirectory(pathParts.parentPath);
    } catch(_) {}

    
    try {
        await Neutralino.filesystem.getStats(normalizedPath);
        csvPathCache.set(relativePath, normalizedPath);
        return normalizedPath;
    } catch (error) {
        await Neutralino.filesystem.writeFile(normalizedPath, `${headerLine}\n`);
        csvPathCache.set(relativePath, normalizedPath);
        return normalizedPath;
    }
}

function parseCsvRecords(csvText, expectedHeaders, expectedColumns) {
    const lines = csvText.split(/\r?\n/);
    let headerLine = '';
    let startIndex = 0;

    for(let i = 0; i < lines.length; i += 1) {
        const line = lines[i].trim();
        if(line) {
            headerLine = line;
            startIndex = i + 1;
            break;
        }
    }

    if(!headerLine) return { records: [], empty: true };

    const header = headerLine.split(',');
    const headerMatches = expectedHeaders.every((expected, index) => (header[index] || '').trim().toLowerCase() === expected.toLowerCase());

    if(!headerMatches) throw new Error('CSV header mismatch.');
    const records = [];
    let hasData = false;

    for(let i = startIndex; i < lines.length; i += 1) {
        const raw = lines[i];
        if(!raw) continue;

        const trimmed = raw.trim();
        if(!trimmed) continue;

        hasData = true;
        const row = trimmed.split(',');
        if(row.length < expectedColumns) throw new Error('CSV row format invalid.');

        for(let j = 0; j < expectedColumns; j += 1) {
            row[j] = (row[j] || '').trim();
            if(!row[j]) throw new Error('CSV row format invalid.');
        }

        records.push(row);
    }

    if(!hasData) return { records: [], empty: true };

    return { records, empty: records.length === 0 };
}

async function loadCsvToTable(config) {
    const $table = $(`#${config.tableId}`);
    const $tbody = $table.find('tbody');

    if(!$table.length || !$tbody.length) return [];

    try {
        const normalizedPath = await ensureCsvFile(config.csvPath, config.headerLine);
        const csvText = await Neutralino.filesystem.readFile(normalizedPath);

        const { records, empty } = parseCsvRecords(csvText, config.headers, config.columns);

        if(empty) showToast(`No records found for <b>${config.tableId}</b>.`, 'warning');
        if(config.populateOptions) config.populateOptions(records);

        return records;
    } catch (error) {
        const message = error?.message ? `Failed to load <b>${config.tableId}</b>: ${error.message}` : `Failed to load <b>${config.tableId}</b>.`;
        showToast(message, 'danger');
        return [];
    }
}


async function getCsvHeaderAndRows(csvPath, headerLine) {
    const normalizedPath = await ensureCsvFile(csvPath, headerLine);
    const csvText = await Neutralino.filesystem.readFile(normalizedPath);
    const lines = csvText.split(/\r?\n/).filter(Boolean);
    const header = lines[0] || headerLine;
    const rows = lines.slice(1);

    return { normalizedPath, header, rows };
}

async function writeCsvRecord({ csvPath, headerLine, key, keyIndex, rowValues, mode }) {
    const { normalizedPath, header, rows } = await getCsvHeaderAndRows(csvPath, headerLine);
    const rowText = rowValues.join(',');
    const matchIndex = rows.findIndex((line) => (line.split(',')[keyIndex] || '') === key);

    if(mode === 'edit') {
        if(matchIndex === -1) return { status: 'missing' };
        rows[matchIndex] = rowText;
        await Neutralino.filesystem.writeFile(normalizedPath, [header, ...rows].join('\n') + '\n');
        return { status: 'updated' };
    }

    if(matchIndex !== -1) return { status: 'duplicate' };

    rows.push(rowText);
    await Neutralino.filesystem.writeFile(normalizedPath, [header, ...rows].join('\n') + '\n');
    return { status: 'added' };
}

async function deleteCsvRecord({ csvPath, headerLine, key, keyIndex }) {
    const { normalizedPath, header, rows } = await getCsvHeaderAndRows(csvPath, headerLine);
    const remaining = rows.filter((line) => (line.split(',')[keyIndex] || '') !== key);

    if(remaining.length === rows.length) return { status: 'missing' };

    await Neutralino.filesystem.writeFile(normalizedPath, [header, ...remaining].join('\n') + '\n');
    return { status: 'deleted' };
}

async function promptCsvFile() {
    try {
        const entries = await Neutralino.os.showOpenDialog('Open CSV File', {
            filters: [
                { name: 'CSV Files', extensions: ['csv'] }
            ],
            multiSelections: false
        });

        if (!entries || entries.length === 0) return null;

        const content = await Neutralino.filesystem.readFile(entries[0]);
        return content;

    } catch (error) {
        if (error.code === 'NE_OS_UNLTOUP') return null;
        throw error;
    }
}

async function importCsv(tableId) {
    const config = csvConfigs.find((c) => c.tableId === tableId);
    if(!config) return;

    let csvText;
    try {
        csvText = await promptCsvFile();
    } catch (err) {
        showImportModal([{ record: '', status: 'error', reason: 'Error reading file' }]);
        return;
    }
    if(csvText === null) return false;

    let parsed;
    try {
        parsed = parseCsvRecords(csvText, config.headers, config.columns);
    } catch (err) {
        const msg = err.message || '';
        const reason = msg.startsWith('CSV') ? `Error: ${msg}` : msg;
        showImportModal([{ record: '', status: 'error', reason }]);
        return;
    }

    const { records, empty } = parsed;
    if(empty || !Array.isArray(records) || records.length === 0) {
        showImportModal([{ record: '', status: 'error', reason: 'No records found in import file' }]);
        return;
    }

    const { rows: existingRows } = await getCsvHeaderAndRows(config.csvPath, config.headerLine);
    const existingKeys = new Set(existingRows.map((line) => ((line.split(',')[0] || '').trim())));

    const programSet = new Set();
    const collegeSet = new Set();
    if(tableId === 'studentsTable') {
        const { rows: progRows } = await getCsvHeaderAndRows(csvConfigs[1].csvPath, csvConfigs[1].headerLine);
        progRows.forEach((line) => {
            const code = (line.split(',')[0] || '').trim();
            if(code) programSet.add(code);
        });
    } else if(tableId === 'programsTable') {
        const { rows: colRows } = await getCsvHeaderAndRows(csvConfigs[2].csvPath, csvConfigs[2].headerLine);
        colRows.forEach((line) => {
            const code = (line.split(',')[0] || '').trim();
            if(code) collegeSet.add(code);
        });
    }

    const seenInImport = new Set();
    const results = [];

    for(const row of records) {
        const key = (row[0] || '').trim();
        const recordText = row.join(',');

        if(seenInImport.has(key) || existingKeys.has(key)) {
            let reason;
            if(tableId === 'studentsTable') reason = 'Student ID already exists';
            else if(tableId === 'programsTable') reason = 'Program Code already exists';
            else if(tableId === 'collegesTable') reason = 'College Code already exists';
            results.push({ record: recordText, status: 'duplicate', reason });
            seenInImport.add(key);
            continue;
        }

        seenInImport.add(key);

        if(tableId === 'studentsTable') {
            let progCode = (row[3] || '').trim();
            if(progCode && progCode.toUpperCase() !== 'NULL' && !programSet.has(progCode)) {
                results.push({ record: recordText, status: 'missing', reason: 'Invalid program code' });
                continue;
            }
        } else if(tableId === 'programsTable') {
            let colCode = (row[2] || '').trim();
            if(colCode && colCode.toUpperCase() !== 'NULL' && !collegeSet.has(colCode)) {
                results.push({ record: recordText, status: 'missing', reason: 'Invalid college code' });
                continue;
            }
        }

        try {
            const payload = {
                csvPath: config.csvPath,
                headerLine: config.headerLine,
                key,
                keyIndex: 0,
                rowValues: row,
                mode: 'add',
            };
            const res = await writeCsvRecord(payload);
            if(res.status === 'added') {
                results.push({ record: recordText, status: 'success' });
                existingKeys.add(key);
            } else {
                results.push({ record: recordText, status: 'duplicate' });
            }
        } catch (err) {
            results.push({ record: recordText, status: 'error' });
        }
    }

    return results;
}
