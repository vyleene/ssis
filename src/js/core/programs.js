const createProgramRecord = (code, name, college) => {
    const $row = $('<tr>').attr('id', code);
    const $actions = $('<td>').addClass('text-center');
    const $edit = $('<button>').addClass('btn btn-sm btn-outline-primary me-1 edit-program').attr({ 'data-id': code, 'data-name': name, 'data-college': college }).text('Edit');
    const $del = $('<button>').addClass('btn btn-sm btn-outline-danger delete-program').attr({ 'data-id': code }).text('Delete');

    $actions.append($edit, $del);
    $row.append($('<td>').text(code), $('<td>').text(name), $('<td>').text(college), $actions);

    return $row.prop('outerHTML');
};

let programRecordsCache = [];

async function reloadStudentTable() {
    await loadCsvToTable(csvConfigs[1]);
    refreshDataTable('programsTable');
}

function populateProgramOptions(records = programRecordsCache) {
    if(Array.isArray(records) && records.length) {
        programRecordsCache = records;
    }

    const sourceRecords = Array.isArray(records) ? records : programRecordsCache;
    const $select = $('#student-program');
    const codes = Array.from(new Set(sourceRecords.map(([code]) => code))).sort();
    const programOptionsTemplate = [$('<option>').attr({ value: '', selected: true, disabled: true }).text('Select program code'), ...codes.map((code) => $('<option>').attr({ value: code }).text(code))];

    if(!$select.length) return;

    $select.empty().append(programOptionsTemplate.map((option) => option.clone()));
}