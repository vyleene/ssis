const createProgramRecord = (code, name, college) => {
    const $row = $('<tr>').attr('id', code);
    const $actions = $('<td>').addClass('text-center actions-col');
    const $edit = $('<button>')
        .addClass('btn btn-sm btn-outline-primary me-1 edit-program')
        .attr({ 'data-id': code, 'data-name': name, 'data-college': college, 'aria-label': 'Edit program', title: 'Edit' })
        .html('<span class="heroicon-url heroicon-url-outline icon-pencil-square" aria-hidden="true"></span>');
    const $del = $('<button>')
        .addClass('btn btn-sm btn-outline-danger delete-program')
        .attr({ 'data-id': code, 'aria-label': 'Delete program', title: 'Delete' })
        .html('<span class="heroicon-url heroicon-url-outline icon-trash" aria-hidden="true"></span>');

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