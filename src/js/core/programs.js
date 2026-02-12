const createProgramRecord = (code, name, college) => {
    const $row = $('<tr>').attr('id', code);
    const $actions = $('<td>').addClass('text-center');
    const $edit = $('<button>').addClass('btn btn-sm btn-outline-primary me-1 edit-program').attr({ 'data-id': code, 'data-name': name, 'data-college': college }).text('Edit');
    const $del = $('<button>').addClass('btn btn-sm btn-outline-danger delete-program').attr({ 'data-id': code }).text('Delete');

    $actions.append($edit, $del);
    $row.append($('<td>').text(code), $('<td>').text(name), $('<td>').text(college), $actions);

    return $row.prop('outerHTML');
};

async function reloadStudentTable() {
    await loadCsvToTable(csvConfigs[1]);
    refreshDataTable('programsTable');
}