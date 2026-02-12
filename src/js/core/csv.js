const csvPathCache = new Map();
const csvConfigs = [
    {
        tableId: 'studentsTable',
        csvPath: 'csv/students.csv',
        headerLine: 'ID,First Name,Last Name,Program Code,Year,Gender',
        headers: ['ID', 'First Name', 'Last Name', 'Program Code', 'Year', 'Gender'],
        columns: 6,
        rowMapper: ([id, f_name, l_name, code, year, gender]) => createStudentRecord(id, f_name, l_name, code, year, gender),
    },
    {
        tableId: 'programsTable',
        csvPath: 'csv/programs.csv',
        headerLine: 'Code,Name,College',
        headers: ['Code', 'Name', 'College'],
        columns: 3,
        rowMapper: ([code, name, college]) => createProgramRecord(code, name, college),
        populateOptions: (records) => populateProgramOptions(records),
    },
    {
        tableId: 'collegesTable',
        csvPath: 'csv/colleges.csv',
        headerLine: 'Code,Name',
        headers: ['Code', 'Name'],
        columns: 2,
        rowMapper: ([code, name]) => createCollegeRecord(code, name),
    }
];

async function ensureCsvFile(relativePath, headerLine) {
    if(csvPathCache.has(relativePath)) return csvPathCache.get(headerLine);

    const absolutePath = await Neutralino.filesystem.getAbsolutePath(relativePath);
    const normalizedPath = await Neutralino.filesystem.getNormalizedPath(absolutePath);

    try {
        await Neutralino.filesystem.createDirectory(await Neutralino.filesystem.getPathParts(normalizedPath).parentPath);
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
    const headerMatches = expectedHeaders.every((expected, index) => (header[index] || '').trim() === expected);

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

    if(!$table.length || !$tbody.length) return;

    try {
        const normalizedPath = await ensureCsvFile(config.csvPath, config.headerLine);
        const csvText = await Neutralino.filesystem.readFile(normalizedPath);

        const { records, empty } = parseCsvRecords(csvText, config.headers, config.columns);

        if(empty) showToast(`No records found for <b>${config.tableId}</b>.`, 'warning');
        if(config.populateOptions) config.populateOptions(records);

        $tbody.html(records.map(config.rowMapper).join(''));
    } catch (error) {
        const message = error?.message ? `Failed to load <b>${config.tableId}</b>: ${error.message}` : `Failed to load <b>${config.tableId}</b>.`;
        showToast(message, 'danger');
    }
}